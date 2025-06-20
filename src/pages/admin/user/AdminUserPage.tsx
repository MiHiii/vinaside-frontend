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

  // State cho filter và phân trang
  const [filterParams, setFilterParams] = useState <QueryUserDto>({});
  const [page, setPage] = useState(1);

  // Xử lý áp dụng filter mới
  const handleFilter = (params: QueryUserDto) => {
    setFilterParams(params);
    setPage(1); // Khi lọc reset về trang 1
  };

  // Xử lý reset filter
  const handleReset = () => {
    setFilterParams({});
    setPage(1);
  };

  // Fetch users khi filter hoặc page thay đổi
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
