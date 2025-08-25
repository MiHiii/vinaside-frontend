import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { User, Role, UserRole, CreateUserDto } from "../../types/user";
import { getErrorMessage } from "@/helper/message";
import { RootState } from "..";

// Lấy danh sách user
export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) => {
    const res = await api.get(`/users?page=${page}&limit=${limit}`);
    return {
      users: res.data.data.data as User[],
      pagination: res.data.data.pagination,
    };
  }
);

// Lấy danh sách role
export const fetchRoles = createAsyncThunk("users/fetchRoles", async () => {
  const res = await api.get("/rbac/roles");
  return res.data.data as Role[];
});

// Lấy vai trò của user
export const fetchUserRoles = createAsyncThunk(
  "users/fetchUserRoles",
  async (userId: string) => {
    const res = await api.get(`/rbac/users/${userId}/roles`);
    return { userId, roles: res.data.data as UserRole[] };
  }
);

// Tạo user với custom role (không cần gọi API gán role riêng nữa)
export const createUser = createAsyncThunk(
  "users/create",
  async (
    { userData }: { userData: CreateUserDto },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await api.post("/users", userData);
      dispatch(fetchUsers({}));
      return res.data.data as User;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Có lỗi xảy ra!";
      return rejectWithValue(message);
    }
  }
);

// Sửa user và gán role
export const updateUser = createAsyncThunk(
  "users/update",
  async (
    { id, userData }: { id: string; userData: Partial<User> }
  ) => {
    console.log('=== UPDATE USER THUNK ===');
    console.log('Sending update request:', { id, userData });
    
    const response = await api.patch(`/users/${id}`, userData);
    console.log('API response:', response.data);
    console.log('API response.data:', response.data?.data);
    console.log('API response.data.data:', response.data?.data?.data);
    
    // Backend trả về: { data: { data: user } } - có 2 lớp data!
    let updatedUser;
    if (response.data?.data?.data) {
      // Cấu trúc: response.data.data.data (user object)
      updatedUser = response.data.data.data;
    } else if (response.data?.data) {
      // Cấu trúc: response.data.data (user object)
      updatedUser = response.data.data;
    } else {
      // Fallback: sử dụng data đã gửi
      updatedUser = { id, ...userData };
    }
    
    // Đảm bảo có _id để tìm user trong state
    if (!updatedUser._id && updatedUser.id) {
      updatedUser._id = updatedUser.id;
    }
    
    // Nếu vẫn không có _id, sử dụng id từ parameter
    if (!updatedUser._id) {
      updatedUser._id = id;
    }
    
    console.log('Final updatedUser to return:', updatedUser);
    console.log('=== END UPDATE USER THUNK ===');
    
    // Không gọi fetchUsers ngay lập tức, để state được cập nhật trước
    return updatedUser;
  }
);

// Xóa user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: string, { dispatch }) => {
    await api.delete(`/users/${id}`);
    dispatch(fetchUsers({}));
    return id;
  }
);

// 8. Upload user avatar
export const uploadUserAvatar = createAsyncThunk<
  string, // trả về url
  File,
  { rejectValue: string }
>("users/uploadUserAvatar", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("access_token");
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = response.data.data; // Lấy đúng object chứa urls
    if (!data?.urls || !Array.isArray(data.urls) || data.urls.length === 0)
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

export const fetchStaffByIds = createAsyncThunk<
  User[],
  string[],
  { rejectValue: string }
>(
  "users/fetchStaffByIds",
  async (ids, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        ids.map(id => api.get(`/users/${id}`).then(res => res.data.data.data))
      );
      return results;
    } catch  {
      return rejectWithValue("Lỗi khi lấy thông tin staff");
    }
  }
);

const userSlice = createSlice({
  name: "users",
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
  reducers: {
    clearStaffList: (state) => {
      state.staffList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.pagination = action.payload.pagination || state.pagination;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.error.message || "Lỗi lấy danh sách user";
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
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.error = action.error.message || "Lỗi lấy danh sách role";
        state.loading = false;
      })
      // fetchStaffList
      .addCase(fetchStaffList.pending, (state) => {
        state.staffLoading = true;
        state.staffError = null;
      })
      .addCase(
        fetchStaffList.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.staffLoading = false;
          state.staffList = action.payload;
        }
      )
      .addCase(fetchStaffList.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError = action.payload as string;
      })
      // fetchStaffByIds
      .addCase(fetchStaffByIds.pending, (state) => {
        state.staffLoading = true;
        state.staffError = null;
      })
      .addCase(fetchStaffByIds.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.staffLoading = false;
        state.staffList = action.payload;
      })
      .addCase(fetchStaffByIds.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError = action.payload as string;
      })
             // fetchUserRoles
       .addCase(fetchUserRoles.fulfilled, (state, action) => {
         state.userRoles[action.payload.userId] = action.payload.roles;
       })
       
       // createUser
       .addCase(createUser.pending, (state) => {
         state.loading = true;
       })
       .addCase(createUser.fulfilled, (state) => {
         state.loading = false;
       })
       .addCase(createUser.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string || "Lỗi tạo user";
       })
       
       // updateUser
       .addCase(updateUser.pending, (state) => {
         state.loading = true;
       })
       .addCase(updateUser.fulfilled, (state, action) => {
         state.loading = false;
         // Cập nhật user trong state
         const updatedUser = action.payload;
         console.log('=== UPDATE USER STATE ===');
         console.log('UpdatedUser payload:', updatedUser);
         
         // Tìm user theo _id
         const index = state.users.findIndex(user => user._id === updatedUser._id);
         
         if (index !== -1) {
           console.log('Found user at index:', index);
           console.log('Current user before update:', { ...state.users[index] });
           
           // Cập nhật từng trường một cách rõ ràng
           if (updatedUser.name !== undefined) {
             console.log('Updating name from', state.users[index].name, 'to', updatedUser.name);
             state.users[index].name = updatedUser.name;
           }
           if (updatedUser.email !== undefined) {
             console.log('Updating email from', state.users[index].email, 'to', updatedUser.email);
             state.users[index].email = updatedUser.email;
           }
           if (updatedUser.phone !== undefined) {
             console.log('Updating phone from', state.users[index].phone, 'to', updatedUser.phone);
             state.users[index].phone = updatedUser.phone;
           }
           if (updatedUser.avatar_url !== undefined) {
             console.log('Updating avatar_url from', state.users[index].avatar_url, 'to', updatedUser.avatar_url);
             state.users[index].avatar_url = updatedUser.avatar_url;
           }
           if (updatedUser.customRoles !== undefined) {
             console.log('Updating customRoles from', state.users[index].customRoles, 'to', updatedUser.customRoles);
             state.users[index].customRoles = updatedUser.customRoles;
           }
           
           console.log('User after update:', { ...state.users[index] });
           console.log('=== END UPDATE USER STATE ===');
         } else {
           console.log('User not found in state for update');
           console.log('Available user IDs:', state.users.map(u => u._id));
           console.log('Looking for ID:', updatedUser._id);
         }
       })
       .addCase(updateUser.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string || "Lỗi cập nhật user";
       })
       
       // deleteUser
       .addCase(deleteUser.pending, (state) => {
         state.loading = true;
       })
       .addCase(deleteUser.fulfilled, (state, action) => {
         state.loading = false;
         // Xóa user khỏi state
         state.users = state.users.filter(user => user._id !== action.payload);
       })
       .addCase(deleteUser.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string || "Lỗi xóa user";
       });
   },
});

export default userSlice.reducer;

export const { clearStaffList } = userSlice.actions;

// Selector cho staffList

export const selectStaffList = (state: RootState) =>
  Array.isArray(state.users.staffList) ? state.users.staffList : [];
export const selectStaffLoading = (state: RootState) =>
  state.users.staffLoading;
export const selectStaffError = (state: RootState) => state.users.staffError;

export const selectUsers = (state: RootState) =>
  Array.isArray(state.users.users) ? state.users.users : [];
