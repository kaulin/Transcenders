import {
  BooleanOperationResult,
  BooleanResultHelper,
  ERROR_CODES,
  FriendRequestsData,
  RelationshipStatus,
  ResultHelper,
  ServiceError,
  ServiceResult,
  User,
} from '@transcenders/contracts';
import { DatabaseManager } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';

export class FriendshipService {
  /**
   * Helper method to get friend requests based on direction
   */
  private static async getFriendRequestsLogic(
    database: Database,
    userId: number,
    direction: 'incoming' | 'outgoing',
  ): Promise<FriendRequestsData[]> {
    const isIncoming = direction === 'incoming';
    const sql = isIncoming
      ? SQL`SELECT * FROM friend_requests WHERE recipient_id = ${userId}`
      : SQL`SELECT * FROM friend_requests WHERE initiator_id = ${userId}`;

    const result = await database.all(sql.text, sql.values);
    return result as FriendRequestsData[];
  }

  /**
   * Helper method to get a specific friend request by user IDs
   */
  private static async getFriendRequestByUserIds(
    database: Database,
    initiatorId: number,
    recipientId: number,
  ): Promise<{ id: number; created_at: string } | undefined> {
    const sql = SQL`
      SELECT id, created_at FROM friend_requests
      WHERE initiator_id = ${initiatorId} AND recipient_id = ${recipientId}
    `;
    return await database.get(sql.text, sql.values);
  }

  /**
   * Helper method to check if a friend request already exists
   */
  private static async friendRequestExists(
    database: Database,
    initiatorId: number,
    recipientId: number,
  ): Promise<boolean> {
    const request = await this.getFriendRequestByUserIds(database, initiatorId, recipientId);
    return !!request;
  }

  /**
   * Helper method to get friendship data by user IDs
   */
  private static async getFriendshipByUserIds(
    database: Database,
    userId1: number,
    userId2: number,
  ): Promise<{ created_at: string } | undefined> {
    const min_id = Math.min(userId1, userId2);
    const max_id = Math.max(userId1, userId2);
    const sql = SQL`
      SELECT created_at FROM friendships 
      WHERE user1_id = ${min_id} AND user2_id = ${max_id}
    `;
    return await database.get(sql.text, sql.values);
  }

  static async getUserFriends(userId: number): Promise<ServiceResult<User[]>> {
    return ResultHelper.executeQuery<User[]>(
      'get friends',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        const sql = SQL`
        SELECT users.* FROM users
        JOIN friendships f ON (
          (f.user1_id = ${userId} AND f.user2_id = users.id) OR
          (f.user2_id = ${userId} AND f.user1_id = users.id)
        )
        WHERE users.id != ${userId}
        ORDER BY f.created_at DESC;
      `;
        const users = await database.all(sql.text, sql.values);
        return users as User[];
      },
    );
  }

  private static async checkFriendshipExistsLogic(
    database: Database,
    user1_id: number,
    user2_id: number,
  ): Promise<boolean> {
    const min_id = Math.min(user1_id, user2_id);
    const max_id = Math.max(user1_id, user2_id);
    const sql = SQL`
      SELECT 1 FROM friendships WHERE user1_id = ${min_id} AND user2_id = ${max_id}
    `;

    const result = await database.get(sql.text, sql.values);
    return !!result;
  }

  static async sendFriendRequest(
    initiator: number,
    recipient: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeTransaction<BooleanOperationResult>(
      'send friend request',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        if (initiator === recipient) {
          throw new ServiceError(ERROR_CODES.USER.CANNOT_BEFRIEND_SELF, {
            initiator,
            recipient,
          });
        }

        if (await this.checkFriendshipExistsLogic(database, initiator, recipient)) {
          throw new ServiceError(ERROR_CODES.USER.FRIENDSHIP_ALREADY_EXISTS, {
            user1: initiator,
            user2: recipient,
          });
        }

        // Check if request already exists
        if (await this.friendRequestExists(database, initiator, recipient)) {
          throw new ServiceError(ERROR_CODES.USER.FRIEND_REQUEST_ALREADY_EXISTS, {
            initiator,
            recipient,
          });
        }

        // Check for existing friend request from recipient to initiator (mutual request)
        const mutualRequest = await this.getFriendRequestByUserIds(database, recipient, initiator);
        if (mutualRequest) {
          // Auto-accept mutual friend request by creating friendship
          await this.acceptFriendLogic(database, mutualRequest.id);
          return BooleanResultHelper.success(
            `Mutual friend request accepted between users ${initiator} and ${recipient}`,
          );
        }

        // Create new friend request
        const insertQuery = SQL`
        INSERT INTO friend_requests (initiator_id, recipient_id)
        VALUES (${initiator}, ${recipient});
      `;
        const result = await database.run(insertQuery.text, insertQuery.values);

        if (result.lastID) {
          return BooleanResultHelper.success(
            `Friend request sent from user ${initiator} to user ${recipient}`,
          );
        }

        throw new ServiceError(ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, {
          reason: 'Failed to insert friend request',
        });
      },
    );
  }

  static async getIncomingFriendRequests(
    userId: number,
  ): Promise<ServiceResult<FriendRequestsData[]>> {
    return ResultHelper.executeQuery<FriendRequestsData[]>(
      'get incoming requests',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        return this.getFriendRequestsLogic(database, userId, 'incoming');
      },
    );
  }

  static async getOutgoingFriendRequests(
    userId: number,
  ): Promise<ServiceResult<FriendRequestsData[]>> {
    return ResultHelper.executeQuery<FriendRequestsData[]>(
      'get outgoing requests',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        return this.getFriendRequestsLogic(database, userId, 'outgoing');
      },
    );
  }

  private static async acceptFriendLogic(
    database: Database,
    friendRequestId: number,
  ): Promise<void> {
    const selectQuery = SQL`
      SELECT initiator_id, recipient_id
      FROM friend_requests
      WHERE id = ${friendRequestId}
    `;

    const request = await database.get(selectQuery.text, selectQuery.values);
    if (!request) {
      throw new ServiceError(ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND, {
        friendRequestId,
      });
    }

    const user1_id = Math.min(request.initiator_id, request.recipient_id);
    const user2_id = Math.max(request.initiator_id, request.recipient_id);

    const insertQuery = SQL`
      INSERT OR IGNORE INTO friendships (user1_id, user2_id)
      VALUES (${user1_id}, ${user2_id})
    `;
    await database.run(insertQuery.text, insertQuery.values);

    const deleteQuery = SQL`
      DELETE FROM friend_requests
      WHERE id = ${friendRequestId}
    `;
    await database.run(deleteQuery.text, deleteQuery.values);
  }

  static async acceptFriendByUserIds(
    recipientId: number,
    requestingUserId: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeTransaction<BooleanOperationResult>(
      'accept friend request by user ids',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        // Find the friend request using helper method
        const request = await this.getFriendRequestByUserIds(
          database,
          requestingUserId,
          recipientId,
        );
        if (!request) {
          throw new ServiceError(ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND, {
            requestingUserId,
            recipientId,
          });
        }

        await this.acceptFriendLogic(database, request.id);
        return BooleanResultHelper.success(
          `Friend request from user ${requestingUserId} accepted by user ${recipientId}`,
        );
      },
    );
  }

  static async declineFriendByUserIds(
    recipientId: number,
    requestingUserId: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'decline friend request by user ids',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        const sql = SQL`
          DELETE FROM friend_requests
          WHERE initiator_id = ${requestingUserId} AND recipient_id = ${recipientId}
        `;

        const result = await database.run(sql.text, sql.values);
        const declined = (result.changes ?? 0) > 0;

        if (declined) {
          return BooleanResultHelper.success(
            `Friend request from user ${requestingUserId} declined by user ${recipientId}`,
          );
        } else {
          throw new ServiceError(ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND, {
            requestingUserId,
            recipientId,
          });
        }
      },
    );
  }

  static async removeFriend(
    userId1: number,
    userId2: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'remove friend',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        // Validate users aren't trying to remove themselves
        if (userId1 === userId2) {
          throw new ServiceError(ERROR_CODES.USER.CANNOT_BEFRIEND_SELF, {
            reason: 'Cannot remove friendship with self',
            userId1,
            userId2,
          });
        }

        // Database requires user1_id to be lower
        const user1_id = Math.min(userId1, userId2);
        const user2_id = Math.max(userId1, userId2);

        const sql = SQL`
          DELETE FROM friendships
          WHERE user1_id = ${user1_id} AND user2_id = ${user2_id}
        `;
        const result = await database.run(sql.text, sql.values);

        const removed = (result.changes ?? 0) > 0;

        if (removed) {
          return BooleanResultHelper.success(
            `Friendship removed between users ${userId1} and ${userId2}`,
          );
        } else {
          throw new ServiceError(ERROR_CODES.USER.FRIENDSHIP_NOT_FOUND, {
            user1: userId1,
            user2: userId2,
          });
        }
      },
    );
  }

  static async getRelationshipStatus(
    userId: number,
    targetUserId: number,
  ): Promise<ServiceResult<RelationshipStatus>> {
    return ResultHelper.executeQuery<RelationshipStatus>(
      'get relationship status',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        if (userId === targetUserId) {
          return {
            status: 'none',
            canSendRequest: false,
          } as RelationshipStatus;
        }

        // Check if they're friends
        const friendshipExists = await this.checkFriendshipExistsLogic(
          database,
          userId,
          targetUserId,
        );
        if (friendshipExists) {
          const friendship = await this.getFriendshipByUserIds(database, userId, targetUserId);
          return {
            status: 'friends',
            friendshipCreatedAt: friendship?.created_at,
            canSendRequest: false,
          } as RelationshipStatus;
        }

        // Check for outgoing request (I sent to them)
        const outgoingRequest = await this.getFriendRequestByUserIds(
          database,
          userId,
          targetUserId,
        );
        if (outgoingRequest) {
          return {
            status: 'request_sent',
            requestId: outgoingRequest.id,
            requestCreatedAt: outgoingRequest.created_at,
            canSendRequest: false,
          } as RelationshipStatus;
        }

        // Check for incoming request (they sent to me)
        const incomingRequest = await this.getFriendRequestByUserIds(
          database,
          targetUserId,
          userId,
        );
        if (incomingRequest) {
          return {
            status: 'request_received',
            requestId: incomingRequest.id,
            requestCreatedAt: incomingRequest.created_at,
            canSendRequest: false,
          } as RelationshipStatus;
        }

        // No relationship exists
        return {
          status: 'none',
          canSendRequest: true,
        } as RelationshipStatus;
      },
    );
  }
}
