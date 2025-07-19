import {
  ApiResponseType,
  AVATAR_ROUTES,
  CreateUserRequest,
  FRIENDSHIP_ROUTES,
  GetUserRequest,
  GetUsersQuery,
  RandomCatsQuery,
  SERVICE_URLS,
  toQueryString,
  UpdateUserRequest,
  USER_ROUTES,
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
  static async deleteUser(id: number) {
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
    return this.callUserService(`${USER_ROUTES.USERS_EXACT}${queryString}`);
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

  /**
   * Get list of available default avatars
   */
  static async getDefaultAvatars() {
    return this.callUserService(AVATAR_ROUTES.AVATARS_DEFAULTS);
  }

  /**
   * Set a default avatar for a user
   */
  static async setDefaultAvatar(userId: number, avatarName: string) {
    return this.callUserService(
      AVATAR_ROUTES.USER_AVATAR_DEFAULT.replace(':userId', userId.toString()),
      {
        method: 'POST',
        body: { avatarName },
      },
    );
  }

  /**
   * Get the full URL for an avatar path
   */
  static getAvatarUrl(avatarPath: string): string {
    if (this.getAvatarType(avatarPath) == 'web') {
      return avatarPath;
    }
    return `${SERVICE_URLS.USER}${avatarPath}`;
  }

  /**
   * Get the type of the Avatar
   */
  static getAvatarType(avatarPath: string): 'default' | 'web' | 'custom' {
    if (avatarPath.startsWith('http')) {
      return 'web';
    }
    if (avatarPath.startsWith('/uploads/avatars/')) {
      return 'custom';
    }
    return 'default';
  }

  /**
   * Upload an avatar for a user
   */
  static async uploadAvatar(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.callUserService(
      `${AVATAR_ROUTES.USER_AVATAR.replace(':userId', userId.toString())}`,
      {
        method: 'PUT',
        body: formData,
      },
    );
  }

  /**
   * Remove user avatar and set default
   */
  static async removeAvatar(userId: number) {
    return await this.callUserService(
      `${AVATAR_ROUTES.USER_AVATAR.replace(':userId', userId.toString())}`,
      {
        method: 'DELETE',
      },
    );
  }

  /**
   * Get a list of random cat avatars from TheCatApi
   */
  static async getRandomCats(query?: RandomCatsQuery) {
    const queryString = query ? toQueryString(query) : '';
    return this.callUserService(`${AVATAR_ROUTES.AVATARS_RANDOM}${queryString}`);
  }

  /**
   * Hard set an avatar URL for the user
   */
  static async setWebAvatar(userId: number, avatarUrl: string) {
    await this.removeAvatar(userId);
    return await this.updateUser(userId, {
      avatar: avatarUrl,
    });
  }
}
