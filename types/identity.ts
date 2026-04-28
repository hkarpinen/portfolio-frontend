export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Me {
  id: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  isBanned: boolean;
  isEmailConfirmed: boolean;
  createdAt: string;
}
