export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  createdAt?: Date;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
} 