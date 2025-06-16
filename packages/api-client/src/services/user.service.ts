import {
  ApiResponseType,
  CreateUserRequest,
  FRIENDSHIP_ROUTES,
  GetUserRequest,
  GetUsersQuery,
  SERVICE_URLS,
  toQueryString,
  UpdateUserRequest,
  USER_ROUTES,
  UserSchema,
} from '@transcenders/contracts';
import { ApiClient } from '../api/ApiClient';
import { ApiCallOptions } from '../types/client.options';

export class UserApiService {
  /**
   * Internal method to call the user service
   */
  private static async callUserService(
    endpoint: string,
    options: ApiCallOptions = {},
  ): Promise<ApiResponseType> {
    const url = `${SERVICE_URLS.USER}${endpoint}`;
    return ApiClient.call(url, options);
  }

  // #TODO schema validate all the data

  /**
   * Gets a list of users based on optional query parameters
   */
  static async getUsers(query?: GetUsersQuery) {
    const queryString = query ? toQueryString(query) : '';
    return this.callUserService(`${USER_ROUTES.USERS}${queryString}`);
  }

  /**
   * Creates a new user
   */
  static async createUser(userData: CreateUserRequest) {
    return this.callUserService(USER_ROUTES.USERS, {
      method: 'POST',
      body: userData,
    });
  }

  /**
   * Gets a user by their ID
   */
  static async getUserById(id: number) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()));
  }

  /**
   * Updates a user's information
   */
  static async updateUser(id: number, userData: UpdateUserRequest) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()), {
      method: 'PATCH',
      body: userData,
    });
  }

  /**
   * Deletes a user
   */
  static async privateDelete(id: number) {
    return this.callUserService(USER_ROUTES.USER_BY_ID.replace(':id', id.toString()), {
      method: 'DELETE',
    });
  }

  /**
   * Checks if a user with the given identifier exists
   */
  static async checkUserExists(identifier: string) {
    return this.callUserService(USER_ROUTES.USER_EXISTS.replace(':identifier', identifier));
  }

  /**
   * Gets a user based on exact match parameters
   */
  static async getUserExact(query: GetUserRequest) {
    const queryString = `?${new URLSearchParams(query).toString()}`;
    return this.callUserService(`${USER_ROUTES.USERS_EXACT}${queryString}`, {
      expectedDataSchema: UserSchema,
    });
  }

  // Friendship methods
  static async getFriends(userId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.USER_FRIENDSHIPS.replace(':id', userId.toString()),
    );
  }

  static async sendFriendRequest(userId: number, recipientId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':recipientId',
        recipientId.toString(),
      ),
      { method: 'POST' },
    );
  }

  static async acceptFriendRequest(userId: number, requestId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':requestId',
        requestId.toString(),
      ),
      { method: 'PUT' },
    );
  }

  static async declineFriendRequest(userId: number, requestId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIEND_REQUEST.replace(':id', userId.toString()).replace(
        ':requestId',
        requestId.toString(),
      ),
      { method: 'DELETE' },
    );
  }

  static async removeFriend(userId: number, friendId: number) {
    return this.callUserService(
      FRIENDSHIP_ROUTES.FRIENDSHIP.replace(':id', userId.toString()).replace(
        ':friendId',
        friendId.toString(),
      ),
      { method: 'DELETE' },
    );
  }
}
