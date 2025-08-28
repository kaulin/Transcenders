import { Static, TSchema, Type } from '@sinclair/typebox';
import {
  AVATAR_ROUTES,
  avatarResultSchema,
  BooleanOperationResultSchema,
  CreateUserRequest,
  DefaultAvatarsResultSchema,
  FriendRequestsDataSchema,
  FRIENDSHIP_ROUTES,
  GetUserRequest,
  GetUsersQuery,
  randomAvatarArraySchema,
  RandomCatsQuery,
  RelationshipStatusSchema,
  SERVICE_URLS,
  toQueryString,
  UpdateUserRequest,
  USER_ROUTES,
  userArraySchema,
  userSchema,
} from '@transcenders/contracts';
import { TypedApiClient } from '../api/TypedApiClient.js';
import { ApiCallOptions } from '../types/client.options.js';

export class UserApiClient extends TypedApiClient {
  /**
   * Internal method to call the user service
   */
  private static async callUserService<T extends TSchema>(
    endpoint: string,
    schema: T,
    options: ApiCallOptions = {},
  ): Promise<Static<T>> {
    const url = `${SERVICE_URLS.USER}${endpoint}`;
    return this.callTyped(url, schema, options);
  }

  /**
   * Gets a list of users based on optional query parameters
   */
  static async getUsers(query?: GetUsersQuery) {
    const queryString = toQueryString(query);
    const endpoint = `${USER_ROUTES.USERS}${queryString}`;
    return this.callUserService(endpoint, userArraySchema);
  }

  /**
   * Creates a new user
   */
  static async createUser(userData: CreateUserRequest) {
    const endpoint = USER_ROUTES.USERS;
    const options: ApiCallOptions = { method: 'POST', body: userData };
    return this.callUserService(endpoint, userSchema, options);
  }

  /**
   * Gets a user by their ID
   */
  static async getUserById(id: number) {
    const endpoint = USER_ROUTES.USER_BY_ID.replace(':id', id.toString());
    return this.callUserService(endpoint, userSchema);
  }

  /**
   * Updates a user's information
   */
  static async updateUser(id: number, userData: UpdateUserRequest = {}) {
    const endpoint = USER_ROUTES.USER_BY_ID.replace(':id', id.toString());
    const options: ApiCallOptions = { method: 'PATCH', body: userData };
    return this.callUserService(endpoint, userSchema, options);
  }

  /**
   * Deletes a user
   */
  static async deleteUser(id: number) {
    const endpoint = USER_ROUTES.USER_BY_ID.replace(':id', id.toString());
    const options: ApiCallOptions = { method: 'DELETE' };
    return this.callUserService(endpoint, BooleanOperationResultSchema, options);
  }

  /**
   * Checks if a user with the given identifier exists
   */
  static async checkUserExists(identifier: string) {
    const endpoint = USER_ROUTES.USER_EXISTS.replace(':identifier', identifier);
    return this.callUserService(endpoint, BooleanOperationResultSchema);
  }

  /**
   * Gets a user based on exact match parameters
   */
  static async getUserExact(query: GetUserRequest) {
    const queryString = `?${new URLSearchParams(query).toString()}`;
    const endpoint = `${USER_ROUTES.USERS_EXACT}${queryString}`;
    return this.callUserService(endpoint, userSchema);
  }

  // Friendship methods
  static async getUserFriends(userId: number) {
    const endpoint = FRIENDSHIP_ROUTES.USER_FRIENDSHIPS.replace(':id', userId.toString());
    return this.callUserService(endpoint, userArraySchema);
  }

  static async getRelationshipStatus(userId: number, targetUserId: number) {
    const endpoint = FRIENDSHIP_ROUTES.RELATIONSHIP_STATUS.replace(
      ':id',
      userId.toString(),
    ).replace(':targetUserId', targetUserId.toString());
    return this.callUserService(endpoint, RelationshipStatusSchema);
  }

  static async getIncomingFriendRequests(userId: number) {
    const endpoint = FRIENDSHIP_ROUTES.FRIEND_REQUESTS_INCOMING.replace(':id', userId.toString());
    return this.callUserService(endpoint, Type.Array(FriendRequestsDataSchema));
  }

  static async getOutgoingFriendRequests(userId: number) {
    const endpoint = FRIENDSHIP_ROUTES.FRIEND_REQUESTS_OUTGOING.replace(':id', userId.toString());
    return this.callUserService(endpoint, Type.Array(FriendRequestsDataSchema));
  }

  static async sendFriendRequest(userId: number, targetUserId: number) {
    const endpoint = FRIENDSHIP_ROUTES.SEND_FRIEND_REQUEST.replace(
      ':id',
      userId.toString(),
    ).replace(':targetUserId', targetUserId.toString());
    const options: ApiCallOptions = { method: 'POST' };
    return this.callUserService(endpoint, BooleanOperationResultSchema, options);
  }

  static async acceptFriendRequest(userId: number, requestingUserId: number) {
    const endpoint = FRIENDSHIP_ROUTES.ACCEPT_FRIEND_REQUEST.replace(
      ':id',
      userId.toString(),
    ).replace(':requestingUserId', requestingUserId.toString());
    const options: ApiCallOptions = { method: 'PUT' };
    return this.callUserService(endpoint, BooleanOperationResultSchema, options);
  }

  static async declineFriendRequest(userId: number, requestingUserId: number) {
    const endpoint = FRIENDSHIP_ROUTES.DECLINE_FRIEND_REQUEST.replace(
      ':id',
      userId.toString(),
    ).replace(':requestingUserId', requestingUserId.toString());
    const options: ApiCallOptions = { method: 'DELETE' };
    return this.callUserService(endpoint, BooleanOperationResultSchema, options);
  }

  static async removeFriend(userId: number, friendId: number) {
    const endpoint = FRIENDSHIP_ROUTES.REMOVE_FRIENDSHIP.replace(':id', userId.toString()).replace(
      ':friendId',
      friendId.toString(),
    );
    const options: ApiCallOptions = { method: 'DELETE' };
    return this.callUserService(endpoint, BooleanOperationResultSchema, options);
  }

  /**
   * Get list of available default avatars
   */
  static async getDefaultAvatars() {
    const endpoint = AVATAR_ROUTES.AVATARS_DEFAULTS;
    return this.callUserService(endpoint, DefaultAvatarsResultSchema);
  }

  /**
   * Set a default avatar for a user
   */
  static async setDefaultAvatar(userId: number, avatarName: string) {
    const endpoint = AVATAR_ROUTES.USER_AVATAR_DEFAULT.replace(':userId', userId.toString());
    const options: ApiCallOptions = { method: 'POST', body: { avatarName } };
    return this.callUserService(endpoint, avatarResultSchema, options);
  }

  /**
   * Get the full URL for an avatar path
   */
  static getFullAvatarURL(avatarPath: string): string {
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
    const endpoint = AVATAR_ROUTES.USER_AVATAR.replace(':userId', userId.toString());
    const options: ApiCallOptions = { method: 'PUT', body: formData };
    return await this.callUserService(endpoint, avatarResultSchema, options);
  }

  /**
   * Remove user avatar and set default
   */
  static async removeAvatar(userId: number) {
    const endpoint = AVATAR_ROUTES.USER_AVATAR.replace(':userId', userId.toString());
    const options: ApiCallOptions = { method: 'DELETE' };
    return await this.callUserService(endpoint, avatarResultSchema, options);
  }

  /**
   * Get a list of random cat avatars from TheCatApi
   */
  static async getRandomCats(query?: RandomCatsQuery) {
    const queryString = toQueryString(query);
    const endpoint = `${AVATAR_ROUTES.AVATARS_RANDOM}${queryString}`;
    return this.callUserService(endpoint, randomAvatarArraySchema);
  }

  /**
   * Get one random cat avatar from TheCatApi
   */
  static async getOneRandomCat(query?: RandomCatsQuery) {
    let catUrl;
    try {
      const cats = await this.getRandomCats({ limit: 1 });
      catUrl = cats[0]?.url;
    } catch {
      // ignore catApi errors and just let it be undefined
    }
    return catUrl;
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
