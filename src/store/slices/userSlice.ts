import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { User, Role, UserRole, CreateUserDto } from '../../types/user';
import { getErrorMessage } from "@/helper/message";
import { RootState } from "..";
import toast from 'react-hot-toast';

// Lấy danh sách user
export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
    const res = await api.get(`/users?page=${page}&limit=${limit}`);
    return {
      users: res.data.data.data as User[],
      pagination: res.data.data.pagination,
    };
  }
);

// Lấy danh sách role
export const fetchRoles = createAsyncThunk('users/fetchRoles', async () => {
  const res = await api.get('/rbac/roles');
  return res.data.data as Role[];
});

// Lấy vai trò của user
export const fetchUserRoles = createAsyncThunk(
  'users/fetchUserRoles',
  async (userId: string) => {
    const res = await api.get(`/rbac/users/${userId}/roles`);
    return { userId, roles: res.data.data as UserRole[] };
  }
);

// Tạo user và gán role
export const createUser = createAsyncThunk(
  'users/create',
  async (
    { userData, roleKey }: { userData: CreateUserDto; roleKey: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await api.post('/users', userData);
      console.log('User create response:', res.data);
      console.log('res.data.data:', res.data.data);
      const userDataRes = res.data.data.data; // Sửa ở đây
      const userId = userDataRes._id || userDataRes.id || userDataRes.userId;
      if (!userId) {
        toast.error('Không lấy được userId sau khi tạo user!');
        return;
      }
      // Gán vai trò cho user sau khi tạo
      await api.post(`/rbac/users/${userId}/roles`, { roleKey });
      dispatch(fetchUsers({}));
      return res.data.data as User;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      const message = error?.response?.data?.error || error?.response?.data?.message || 'Có lỗi xảy ra!';
      return rejectWithValue(message);
    }
  }
);

// Sửa user và gán role
export const updateUser = createAsyncThunk(
  'users/update',
  async (
    { id, userData, roleKey }: { id: string; userData: Partial<User>; roleKey: string },
    { dispatch }
  ) => {
    await api.patch(`/users/${id}`, userData);
    await api.post(`/rbac/users/${id}/roles`, { roleKey });
    dispatch(fetchUsers({}));
    return { id, ...userData };
  }
);

// Xóa user
export const deleteUser = createAsyncThunk('users/delete', async (id: string, { dispatch }) => {
  await api.delete(`/users/${id}`);
  dispatch(fetchUsers({}));
  return id;
});

// 8. Upload user avatar
export const uploadUserAvatar = createAsyncThunk<
  string, // trả về url
  File,
  { rejectValue: string }
>("users/uploadUserAvatar", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // Đúng field backend yêu cầu
    const token = localStorage.getItem("access_token");
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = response.data.data; // Lấy đúng object chứa urls
    if (
      !data?.urls ||
      !Array.isArray(data.urls) ||
      data.urls.length === 0
    ) 
      throw new Error("Không nhận được url ảnh!");
    return data.urls[0];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// Thunk lấy danh sách staff
export const fetchStaffList = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchStaffList", async (_, { rejectWithValue }) => {
  try {
    const arr = (await api.get("/users/staff")).data?.data?.data;
    return Array.isArray(arr) ? arr : [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateMyAvatar = createAsyncThunk<
  unknown,
  { avatar_url: string },
  { rejectValue: string }
>("users/updateMyAvatar", async (data, { rejectWithValue }) => {
  try {
    const response = await api.patch("/users/me", data);
    return response.data;
  } catch (error) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err?.response?.data?.message || "Cập nhật avatar thất bại!"
    );
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [] as User[],
    roles: [] as Role[],
    userRoles: {} as Record<string, UserRole[]>,
    loading: false,
    error: null as string | null,
    uploadAvatarLoading: false,
    uploadAvatarError: null as string | null,
    uploadedAvatarUrl: undefined as string | undefined,
    staffLoading: false,
    staffError: null as string | null,
    staffList: [] as User[],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, state => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.pagination = action.payload.pagination || state.pagination;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.error.message || 'Lỗi lấy danh sách user';
        state.loading = false;
      })

      // uploadUserAvatar
      .addCase(uploadUserAvatar.pending, (state) => {
        state.uploadAvatarLoading = true;
        state.uploadAvatarError = null;
        state.uploadedAvatarUrl = undefined;
      })
      .addCase(
        uploadUserAvatar.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.uploadAvatarLoading = false;
          state.uploadedAvatarUrl = action.payload;
        }
      )
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.uploadAvatarLoading = false;
        state.uploadAvatarError =
          (action.payload as string) ||
          action.error.message ||
          "Upload avatar thất bại!";
      })
      // fetchRoles
      .addCase(fetchRoles.pending, state => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.error = action.error.message || 'Lỗi lấy danh sách role';
        state.loading = false;
      })
      // fetchStaffList
      .addCase(fetchStaffList.pending, (state) => {
        state.staffLoading = true;
        state.staffError = null;
      })
      .addCase(fetchStaffList.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.staffLoading = false;
        state.staffList = action.payload;
      })
      .addCase(fetchStaffList.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError = action.payload as string;
      })
      // fetchUserRoles
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.userRoles[action.payload.userId] = action.payload.roles;
      });
      // createUser, updateUser, deleteUser: chỉ refetch users, không cần update state trực tiếp
      
  }
});

export default userSlice.reducer; 

// Selector cho staffList
export const selectStaffList = (state: RootState) => Array.isArray(state.users.staffList) ? state.users.staffList : [];
export const selectStaffLoading = (state: RootState) => state.users.staffLoading;
export const selectStaffError = (state: RootState) => state.users.staffError;