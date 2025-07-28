import {
  BooleanOperationResult,
  BooleanResultHelper,
  ERROR_CODES,
  FriendRequestsData,
  ResultHelper,
  ServiceError,
  ServiceResult,
  User,
} from '@transcenders/contracts';
import { DatabaseManager } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';

export class FriendshipService {
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

  static async checkFriendshipExists(
    user1_id: number,
    user2_id: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'check friendship',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        const exists = await this.checkFriendshipExistsLogic(database, user1_id, user2_id);
        if (exists) {
          return BooleanResultHelper.success(`Users ${user1_id} and ${user2_id} are friends`);
        } else {
          return BooleanResultHelper.failure(`Users ${user1_id} and ${user2_id} are not friends`);
        }
      },
    );
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

        // Check for existing friend request from recipient to initiator (mutual request)
        const mutualRequestQuery = SQL`
          SELECT id FROM friend_requests
          WHERE initiator_id = ${recipient} AND recipient_id = ${initiator}
        `;
        const mutualRequest: { id: number } | undefined = await database.get(
          mutualRequestQuery.text,
          mutualRequestQuery.values,
        );
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
        const sql = SQL`
          SELECT * FROM friend_requests
          WHERE recipient_id = ${userId}
          ORDER BY created_at DESC;
        `;
        const result = await database.all(sql.text, sql.values);
        return result as FriendRequestsData[];
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

  static async acceptFriend(
    friendRequestId: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeTransaction<BooleanOperationResult>(
      'accept friend request',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        await this.acceptFriendLogic(database, friendRequestId);
        return BooleanResultHelper.success(
          `Friend request ${friendRequestId} accepted successfully`,
        );
      },
    );
  }

  static async declineFriend(
    friendRequestId: number,
  ): Promise<ServiceResult<BooleanOperationResult>> {
    return ResultHelper.executeQuery<BooleanOperationResult>(
      'decline friend request',
      await DatabaseManager.for('USER').open(),
      async (database) => {
        const sql = SQL`
          DELETE FROM friend_requests
          WHERE id = ${friendRequestId}
        `;

        const result = await database.run(sql.text, sql.values);
        const declined = (result.changes ?? 0) > 0;

        if (declined) {
          return BooleanResultHelper.success(
            `Friend request ${friendRequestId} declined successfully`,
          );
        } else {
          throw new ServiceError(ERROR_CODES.USER.FRIEND_REQUEST_NOT_FOUND, {
            friendRequestId,
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
}
