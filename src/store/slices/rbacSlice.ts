import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { rbacApi } from '../../services/rbacApi';
import {
  RbacState,
  CreateRoleDto,
  CreatePermissionDto,
  AssignRoleToUserDto,
  AssignPermissionToRoleDto,
} from '../../types/rbac';
import { UserPermissionsResponse } from "@/services/rbacApi";

// Helper function to extract error message
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

// Initial state
const initialState: RbacState = {
  // Roles
  roles: null,
  rolesLoading: false,
  rolesError: null,
  
  // Permissions
  permissions: null,
  permissionsLoading: false,
  permissionsError: null,
  
  // User roles
  userRoles: {},
  userRolesLoading: false,
  userRolesError: null,
  
  // Role permissions
  rolePermissions: {},
  rolePermissionsLoading: false,
  rolePermissionsError: null,
  
  // User permissions
  userPermissions: {},
  userPermissionsLoading: false,
  userPermissionsError: null,
  
  // Users with role
  usersWithRole: {},
  usersWithRoleLoading: false,
  usersWithRoleError: null,
  
  // Permission checks
  permissionChecks: {},
  permissionChecksLoading: false,
  permissionChecksError: null,
};

// ========== ROLES ASYNC THUNKS ==========

export const fetchRoles = createAsyncThunk(
  'rbac/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await rbacApi.getAllRoles();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createRole = createAsyncThunk(
  'rbac/createRole',
  async (roleData: CreateRoleDto, { rejectWithValue, dispatch }) => {
    try {
      const newRole = await rbacApi.createRole(roleData);
      // Refresh roles list after creating
      dispatch(fetchRoles());
      return newRole;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRolePermissions = createAsyncThunk(
  'rbac/fetchRolePermissions',
  async (roleId: string, { rejectWithValue }) => {
    try {
      return await rbacApi.getRolePermissions(roleId);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch role permissions'));
    }
  }
);

export const fetchUsersWithRole = createAsyncThunk(
  'rbac/fetchUsersWithRole',
  async (roleKey: string, { rejectWithValue }) => {
    try {
      return await rbacApi.getUsersWithRole(roleKey);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch users with role'));
    }
  }
);

// ========== PERMISSIONS ASYNC THUNKS ==========

export const fetchPermissions = createAsyncThunk(
  'rbac/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await rbacApi.getAllPermissions();
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch permissions'));
    }
  }
);

export const createPermission = createAsyncThunk(
  'rbac/createPermission',
  async (permissionData: CreatePermissionDto, { rejectWithValue, dispatch }) => {
    try {
      const newPermission = await rbacApi.createPermission(permissionData);
      // Refresh permissions list after creating
      dispatch(fetchPermissions());
      return newPermission;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create permission'));
    }
  }
);

// ========== ROLE-PERMISSION ASSIGNMENTS ASYNC THUNKS ==========

export const assignPermissionToRole = createAsyncThunk(
  'rbac/assignPermissionToRole',
  async (
    { roleKey, assignPermissionDto }: { roleKey: string; assignPermissionDto: AssignPermissionToRoleDto },
    { rejectWithValue }
  ) => {
    try {
      await rbacApi.assignPermissionToRole(roleKey, assignPermissionDto);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to assign permission to role'));
    }
  }
);

export const removePermissionFromRole = createAsyncThunk(
  'rbac/removePermissionFromRole',
  async (
    { roleKey, permissionKey }: { roleKey: string; permissionKey: string },
    { rejectWithValue }
  ) => {
    try {
      await rbacApi.removePermissionFromRole(roleKey, permissionKey);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to remove permission from role'));
    }
  }
);

// ========== USER-ROLE ASSIGNMENTS ASYNC THUNKS ==========

export const fetchUserRoles = createAsyncThunk(
  'rbac/fetchUserRoles',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await rbacApi.getUserRoles(userId);
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch user roles'));
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'rbac/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Sử dụng API mới trong rbacApi
      return await rbacApi.getUserPermissions(userId);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch user permissions'));
    }
  }
);

export const assignRoleToUser = createAsyncThunk(
  'rbac/assignRoleToUser',
  async (
    { userId, assignRoleDto }: { userId: string; assignRoleDto: AssignRoleToUserDto },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await rbacApi.assignRoleToUser(userId, assignRoleDto);
      // Refresh user roles and permissions after assignment
      dispatch(fetchUserRoles(userId));
      dispatch(fetchUserPermissions(userId));
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to assign role to user'));
    }
  }
);

export const removeRoleFromUser = createAsyncThunk(
  'rbac/removeRoleFromUser',
  async (
    { userId, roleKey }: { userId: string; roleKey: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await rbacApi.removeRoleFromUser(userId, roleKey);
      // Refresh user roles and permissions after removal
      dispatch(fetchUserRoles(userId));
      dispatch(fetchUserPermissions(userId));
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to remove role from user'));
    }
  }
);

// ========== PERMISSION CHECKS ASYNC THUNKS ==========

export const checkUserPermission = createAsyncThunk(
  'rbac/checkUserPermission',
  async (
    { userId, permissionKey }: { userId: string; permissionKey: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await rbacApi.checkUserPermission(userId, permissionKey);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to check user permission'));
    }
  }
);

// ========== DELETE ROLE ========== 
export const deleteRole = createAsyncThunk(
  'rbac/deleteRole',
  async (roleKey: string, { rejectWithValue, dispatch }) => {
    try {
      await rbacApi.deleteRole(roleKey);
      // Refresh roles list after deleting
      dispatch(fetchRoles());
      return roleKey;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete role';
      return rejectWithValue(errorMessage);
    }
  }
);

export const softDeleteRole = createAsyncThunk(
  'rbac/softDeleteRole',
  async (roleKey: string, { rejectWithValue, dispatch }) => {
    try {
      await rbacApi.softDeleteRole(roleKey);
      dispatch(fetchRoles());
      return roleKey;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to soft delete role';
      return rejectWithValue(errorMessage);
    }
  }
);

// ========== UPDATE ROLE ========== 
export const updateRole = createAsyncThunk(
  'rbac/updateRole',
  async (roleData: CreateRoleDto, { rejectWithValue, dispatch }) => {
    try {
      const updatedRole = await rbacApi.updateRole(roleData);
      // Refresh roles list after updating
      dispatch(fetchRoles());
      return updatedRole;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      return rejectWithValue(errorMessage);
    }
  }
);

// ========== SLICE ==========

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    // Clear errors
    clearRolesError: (state) => {
      state.rolesError = null;
    },
    clearPermissionsError: (state) => {
      state.permissionsError = null;
    },
    clearUserRolesError: (state) => {
      state.userRolesError = null;
    },
    clearRolePermissionsError: (state) => {
      state.rolePermissionsError = null;
    },
    clearUserPermissionsError: (state) => {
      state.userPermissionsError = null;
    },
    clearUsersWithRoleError: (state) => {
      state.usersWithRoleError = null;
    },
    clearPermissionChecksError: (state) => {
      state.permissionChecksError = null;
    },
    
    // Clear specific data
    clearUserRoles: (state, action: PayloadAction<string>) => {
      delete state.userRoles[action.payload];
    },
    clearUserPermissions: (state, action: PayloadAction<string>) => {
      delete state.userPermissions[action.payload];
    },
    clearRolePermissions: (state, action: PayloadAction<string>) => {
      delete state.rolePermissions[action.payload];
    },
    clearUsersWithRole: (state, action: PayloadAction<string>) => {
      delete state.usersWithRole[action.payload];
    },
    clearPermissionCheck: (state, action: PayloadAction<string>) => {
      delete state.permissionChecks[action.payload];
    },
  },
  extraReducers: (builder) => {
    // ========== ROLES REDUCERS ==========
    
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload as string;
      })
      
      .addCase(createRole.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.rolesLoading = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload as string;
      });

    // ========== PERMISSIONS REDUCERS ==========
    
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.permissionsLoading = true;
        state.permissionsError = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsError = action.payload as string;
      })
      
      .addCase(createPermission.pending, (state) => {
        state.permissionsLoading = true;
        state.permissionsError = null;
      })
      .addCase(createPermission.fulfilled, (state) => {
        state.permissionsLoading = false;
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.permissionsError = action.payload as string;
      });

    // ========== ROLE PERMISSIONS REDUCERS ==========
    
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.rolePermissionsLoading = true;
        state.rolePermissionsError = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.rolePermissionsLoading = false;
        // Store permissions for the role (we'll need to get roleId from action.meta.arg)
        const roleId = action.meta.arg;
        state.rolePermissions[roleId] = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.rolePermissionsLoading = false;
        state.rolePermissionsError = action.payload as string;
      });

    // ========== USER ROLES REDUCERS ==========
    
    builder
      .addCase(fetchUserRoles.pending, (state) => {
        state.userRolesLoading = true;
        state.userRolesError = null;
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.userRolesLoading = false;
        const userId = action.meta.arg;
        state.userRoles[userId] = action.payload;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.userRolesLoading = false;
        state.userRolesError = action.payload as string;
      });

    // ========== USER PERMISSIONS REDUCERS ==========
    
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.userPermissionsLoading = true;
        state.userPermissionsError = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.userPermissionsLoading = false;
        const userId = action.meta.arg;
        const payload = action.payload as UserPermissionsResponse;
        state.userPermissions[userId] = {
          success: payload.success,
          statusCode: 200, // hoặc payload.statusCode nếu có
          message: payload.success ? "Success" : "Error",
          data: payload.data.data, // hoặc payload.data nếu đúng
        };
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.userPermissionsLoading = false;
        state.userPermissionsError = action.payload as string;
      });

    // ========== USERS WITH ROLE REDUCERS ==========
    
    builder
      .addCase(fetchUsersWithRole.pending, (state) => {
        state.usersWithRoleLoading = true;
        state.usersWithRoleError = null;
      })
      .addCase(fetchUsersWithRole.fulfilled, (state, action) => {
        state.usersWithRoleLoading = false;
        const roleKey = action.meta.arg;
        state.usersWithRole[roleKey] = action.payload;
      })
      .addCase(fetchUsersWithRole.rejected, (state, action) => {
        state.usersWithRoleLoading = false;
        state.usersWithRoleError = action.payload as string;
      });

    // ========== PERMISSION CHECKS REDUCERS ==========
    
    builder
      .addCase(checkUserPermission.pending, (state) => {
        state.permissionChecksLoading = true;
        state.permissionChecksError = null;
      })
      .addCase(checkUserPermission.fulfilled, (state, action) => {
        state.permissionChecksLoading = false;
        const { userId, permissionKey } = action.meta.arg;
        const key = `${userId}-${permissionKey}`;
        state.permissionChecks[key] = action.payload.hasPermission;
      })
      .addCase(checkUserPermission.rejected, (state, action) => {
        state.permissionChecksLoading = false;
        state.permissionChecksError = action.payload as string;
      });

    // ========== DELETE ROLE REDUCERS ==========
    builder
      .addCase(deleteRole.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.rolesLoading = false;
        state.roles = null;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload as string;
      });

    // ========== UPDATE ROLE REDUCERS ==========
    builder
      .addCase(updateRole.pending, (state) => {
        state.rolesLoading = true;
        state.rolesError = null;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.rolesLoading = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.rolesLoading = false;
        state.rolesError = action.payload as string;
      });
  },
});

export const {
  clearRolesError,
  clearPermissionsError,
  clearUserRolesError,
  clearRolePermissionsError,
  clearUserPermissionsError,
  clearUsersWithRoleError,
  clearPermissionChecksError,
  clearUserRoles,
  clearUserPermissions,
  clearRolePermissions,
  clearUsersWithRole,
  clearPermissionCheck,
} = rbacSlice.actions;

export default rbacSlice.reducer; 