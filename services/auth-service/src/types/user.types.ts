/**
 * User entity - represents a user in the database
 */
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  created_at: string;
  modified_at: string;
}

/**
 * Request body for creating a new user
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  display_name?: string;
}

/**
 * Request body for updating an existing user
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  display_name?: string;
}

/**
 * Request body for removing an existing user
 */
export interface RemoveUserRequest {
  username: string;
  email: string;
}

/**
 * Response for checking if a user exists
 */
export interface UserExistsResponse {
  identifier: string;
  exists: boolean;
  available: boolean;
}

/**
 * Query parameters for getting users
 */
export interface GetUsersQuery {
  search?: string;
}
