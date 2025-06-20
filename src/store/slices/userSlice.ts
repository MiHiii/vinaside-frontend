import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { User, UpdateUserDto, QueryUserDto, CreateUserDto } from "@/types/user";
import { RootState } from "..";
import { getErrorMessage } from "@/helper/message";

interface UserState {
  users: User[];
  user?: User;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  user: undefined,
  total: 0,
  loading: false,
  error: null,
};

// 1. Lấy danh sách users
export const fetchUsers = createAsyncThunk<
  { users: User[]; total: number },
  QueryUserDto,
  { rejectValue: string }
>("users/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/users", { params });
    const users = response.data.data?.users ?? [];
    return {
      users,
      total: response.data.data?.meta?.total || 0,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 2. Lấy chi tiết 1 user
export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/fetchUserById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/users/${id}`);
    const user = response.data.data.data;
    return { ...user, id: user._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 3. Update user (PUT)
export const updateUser = createAsyncThunk<
  User,
  { id: string } & UpdateUserDto,
  { rejectValue: string }
>("users/updateUser", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/users/${id}`, data);
    const user = response.data.data.data;
    return { ...user, id: user._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 4. Patch user (PATCH)
export const patchUser = createAsyncThunk<
  User,
  { id: string } & Partial<UpdateUserDto>,
  { rejectValue: string }
>("users/patchUser", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/users/${id}`, data);
    const user = response.data.data.data;
    return { ...user, id: user._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 5. Toggle status
export const toggleUserStatus = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/toggleUserStatus", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/users/${id}/toggle-status`);
    const user = response.data.data.data;
    return { ...user, id: user._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 6. Create user (POST)
export const createUser = createAsyncThunk<
  User,
  CreateUserDto,
  { rejectValue: string }
>("users/createUser", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/users", data);
    const user = response.data.data.data;
    return { ...user, id: user._id };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// 7. Delete user 
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);

      return id; 
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
    }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<{ users: User[]; total: number }>) => {
          state.loading = false;
          state.users = action.payload.users;
          state.total = action.payload.total;
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Lỗi tải danh sách users!";
      })

      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Không tìm thấy user!";
      })

      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Cập nhật thất bại!";
      })

      // patchUser
      .addCase(patchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(patchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(patchUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Cập nhật thất bại!";
      })

      // toggleUserStatus
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        toggleUserStatus.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.user = action.payload;
        }
      )
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Cập nhật trạng thái thất bại!";
      })

      // createUser
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.user = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Tạo người dùng thất bại!";
      })
      
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user: User) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = usersSlice.actions;
export default usersSlice.reducer;

// Selectors
export const selectUsers = (state: RootState) => state.users.users ?? [];
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectUsersTotal = (state: RootState) => state.users.total;
export const selectUserDetail = (state: RootState) => state.users.user;
