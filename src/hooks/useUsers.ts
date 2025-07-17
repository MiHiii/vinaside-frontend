import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchUsers,
  fetchRoles,
  fetchUserRoles,
  createUser,
  updateUser,
  deleteUser,
} from '../store/slices/userSlice';
import { User, CreateUserDto } from '../types/user';

export const useUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, roles, userRoles, loading, error, pagination } = useSelector(
    (state: RootState) => state.users
  );

  return {
    users,
    roles,
    userRoles,
    loading,
    error,
    pagination,
    fetchUsers: (params?: { page?: number; limit?: number }) => dispatch(fetchUsers(params || {})),
    fetchRoles: () => dispatch(fetchRoles()),
    fetchUserRoles: (userId: string) => dispatch(fetchUserRoles(userId)),
    createUser: (data: { userData: CreateUserDto; roleKey: string }) => dispatch(createUser(data)),
    updateUser: (data: { id: string; userData: Partial<User>; roleKey: string }) => dispatch(updateUser(data)),
    deleteUser: (id: string) => dispatch(deleteUser(id)),
  };
}; 