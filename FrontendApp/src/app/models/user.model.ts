export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
} 