export interface Player {
  id?: number;
  username?: string;
  avatar?: string;
  mode?: 'guest' | 'login' | null;
  ready?: boolean;
}
