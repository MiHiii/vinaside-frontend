import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppDispatch } from "@/hooks/useRedux";
import UserTableHeader from "@/components/admin/user/UserTableHeader";
import UserTable from "@/components/admin/user/UserTable";
import { QueryUserDto } from "@/types/user";
import { fetchUsers, selectUsers, selectUsersError, selectUsersLoading, selectUsersTotal } from "@/store/slices/userSlice";

const PAGE_SIZE = 10;

const AdminUserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);
  const total = useSelector(selectUsersTotal);


  const [filterParams, setFilterParams] = useState<QueryUserDto>({});
  const [page, setPage] = useState(1);
  const handleFilter = (params: {
    search?: string;
    role?: string;
    is_verified?: string;
    isDeleted?: string;
  }) => {
    const mappedParams: QueryUserDto = {
      ...params,
      isDeleted:
        params.isDeleted === "true"
          ? true
          : params.isDeleted === "false"
          ? false
          : undefined,
    };
    setFilterParams(mappedParams);
    setPage(1); 
  };

  const handleReset = () => {
    setFilterParams({});
    setPage(1);
  };
  useEffect(() => {
    dispatch(
      fetchUsers({
        page,
        limit: PAGE_SIZE,
        ...filterParams,
      })
    );
  }, [dispatch, page, filterParams]);

  return (
    <Card className="w-full max-w-5xl mx-auto my-8 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle>Quản lý người dùng</CardTitle>
      </CardHeader>
      <CardContent>
        <UserTableHeader
          search={filterParams.search || ""}
          role={filterParams.role || ""}
          is_verified={filterParams.is_verified || ""}
          onFilter={handleFilter}
          onReset={handleReset}
          page={page}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />

        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Tìm thấy <b>{total}</b> người dùng
          </span>
        </div>
        <UserTable users={users} loading={loading} />
      </CardContent>
    </Card>
  );
};

export default AdminUserPage;
