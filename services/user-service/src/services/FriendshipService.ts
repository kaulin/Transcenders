import { FriendRequestsData, User } from '@transcenders/contracts';
import { getDB } from '../db/database';

export class FriendshipService {
  static async getFriends(userId: number): Promise<User[]> {
    try {
      const database = await getDB();

      const sql = `
		SELECT users.* FROM users
		JOIN friendships f ON (
		  (f.user1_id = ? AND f.user2_id = users.id) OR
		  (f.user2_id = ? AND f.user1_id = users.id)
		)
		WHERE users.id != ?
		`;
      const result = await database.all(sql, [userId, userId, userId]);

      return result as User[];
    } catch (error) {
      console.log('failed to get friends', error);
      throw error;
    }
  }

  static async sendRequest(initiator: number, recipient: number): Promise<boolean> {
    try {
      const database = await getDB();
      const sql = `
		INSERT INTO friend_requests (initiator_id, recipient_id, state) VALUES (?, ?, "pending")
	  `;
      const result = await database.run(sql, [initiator, recipient]);
      return !!result.lastID;
    } catch (error) {
      console.log('failed to send friend request', error);
      throw error;
    }
  }

  static async getIncomingFriendRequests(userId: number): Promise<FriendRequestsData[]> {
    try {
      const database = await getDB();
      const sql = `
		SELECT * FROM friend_requests WHERE recipient_id = ?
	  `;
      const result = await database.all(sql, [userId]);
      return result as FriendRequestsData[];
    } catch (error) {
      console.log('failed to send friend request', error);
      throw error;
    }
  }

  static async acceptFriend(friendRequestId: number): Promise<boolean> {
    try {
      const database = await getDB();

      // Get the friend request details
      const request = await database.get(
        'SELECT initiator_id, recipient_id FROM friend_requests WHERE id = ? AND state = "pending"',
        [friendRequestId],
      );

      if (!request) {
        throw new Error('Friend request not found or already processed');
      }

      await database.run('BEGIN TRANSACTION');
      try {
        // Database Requires user1_id to be lower
        const user1_id = Math.min(request.initiator_id, request.recipient_id);
        const user2_id = Math.max(request.initiator_id, request.recipient_id);
        await database.run('INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)', [
          user1_id,
          user2_id,
        ]);
        await database.run('DELETE FROM friend_requests WHERE id = ?', [friendRequestId]);
        await database.run('COMMIT');
        return true;
      } catch (error) {
        await database.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.log('failed to accept friend request', error);
      throw error;
    }
  }

  static async declineFriend(friendRequestId: number): Promise<boolean> {
    try {
      const database = await getDB();

      const result = await database.run(
        'UPDATE friend_requests SET state = "declined" WHERE id = ? AND state = "pending"',
        [friendRequestId],
      );

      return (result.changes || 0) > 0;
    } catch (error) {
      console.log('failed to decline friend request', error);
      throw error;
    }
  }

  static async removeFriend(userId1: number, userId2: number): Promise<boolean> {
    try {
      const database = await getDB();

      const user1_id = Math.min(userId1, userId2);
      const user2_id = Math.max(userId1, userId2);

      const result = await database.run(
        'DELETE FROM friendships WHERE user1_id = ? AND user2_id = ?',
        [user1_id, user2_id],
      );

      return (result.changes || 0) > 0;
    } catch (error) {
      console.log('failed to remove friend', error);
      throw error;
    }
  }
}
