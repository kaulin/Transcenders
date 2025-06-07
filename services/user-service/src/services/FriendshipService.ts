import { DatabaseResult, FriendRequestsData, User } from '@transcenders/contracts';
import SQL from 'sql-template-strings';
import { Database } from 'sqlite';
import { DatabaseHelper } from '../utils/DatabaseHelper';

export class FriendshipService {
  static async getUserFriends(userId: number): Promise<DatabaseResult<User[]>> {
    return DatabaseHelper.executeQuery<User[]>(`get friends`, async (database) => {
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
    });
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
  ): Promise<DatabaseResult<boolean>> {
    return DatabaseHelper.executeQuery<boolean>('check friendship', async (database) => {
      const result = await this.checkFriendshipExistsLogic(database, user1_id, user2_id);
      return result;
    });
  }

  static async sendFriendRequest(
    initiator: number,
    recipient: number,
  ): Promise<DatabaseResult<boolean>> {
    return DatabaseHelper.executeTransaction<boolean>('send friend request', async (database) => {
      if (await this.checkFriendshipExistsLogic(database, initiator, recipient)) {
        throw new Error(`${initiator} and ${recipient} are already friends`);
      }
      const mutualRequestQuery = SQL`
          SELECT id FROM friend_requests
          WHERE initiator_id = ${recipient} AND recipient_id = ${initiator}
        `;
      const mutualRequest: { id: number } | undefined = await database.get(
        mutualRequestQuery.text,
        mutualRequestQuery.values,
      );

      if (mutualRequest) {
        await this.acceptFriendLogic(database, mutualRequest.id);
        return true;
      }

      const insertQuery = SQL`
          INSERT INTO friend_requests (initiator_id, recipient_id)
          VALUES (${initiator}, ${recipient});
        `;
      const result = await database.run(insertQuery.text, insertQuery.values);
      return !!result.lastID;
    });
  }

  static async getIncomingFriendRequests(
    userId: number,
  ): Promise<DatabaseResult<FriendRequestsData[]>> {
    return DatabaseHelper.executeQuery<FriendRequestsData[]>(
      'get incoming requests',
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
      throw new Error('Friend request not found or already processed');
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

  static async acceptFriend(friendRequestId: number): Promise<DatabaseResult<boolean>> {
    return DatabaseHelper.executeTransaction<boolean>('accept friend request', async (database) => {
      await this.acceptFriendLogic(database, friendRequestId);
      return true;
    });
  }

  static async declineFriend(friendRequestId: number): Promise<DatabaseResult<boolean>> {
    return DatabaseHelper.executeQuery<boolean>('decline friend request', async (database) => {
      const sql = SQL`
          DELETE FROM friend_requests
          WHERE id = ${friendRequestId}
        `;

      const result = await database.run(sql.text, sql.values);
      return (result.changes || 0) > 0;
    });
  }

  static async removeFriend(userId1: number, userId2: number): Promise<DatabaseResult<boolean>> {
    return DatabaseHelper.executeQuery<boolean>('remove friend', async (database) => {
      // Database requires user1_id to be lower
      const user1_id = Math.min(userId1, userId2);
      const user2_id = Math.max(userId1, userId2);

      const sql = SQL`
        DELETE FROM friendships
        WHERE user1_id = ${user1_id} AND user2_id = ${user2_id}
      `;
      const result = await database.run(sql.text, sql.values);

      return (result.changes || 0) > 0;
    });
  }
}
