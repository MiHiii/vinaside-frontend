import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface Props {
  search: string;
  onFilter: (params: {
    search?: string;
    role?: string;
    is_verified?: string;
    isDeleted?: string; // Bổ sung filter trạng thái
  }) => void;
  onReset: () => void;
  role?: string;
  is_verified?: string;
  isDeleted?: string;
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const UserTableHeader: React.FC<Props> = ({
  search,
  role = "",
  is_verified = "",
  isDeleted = "all",
  onFilter,
  onReset,
  page,
  total,
  limit,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / limit);

  // Local state cho filter UI
  const [searchValue, setSearchValue] = useState(search || "");
  const [roleValue, setRoleValue] = useState(role || "all");
  const [isVerifiedValue, setIsVerifiedValue] = useState(is_verified || "all");
  const [isDeletedValue, setIsDeletedValue] = useState(isDeleted || "all");

  // Gửi filter lên parent khi bấm "Lọc"
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      search: searchValue.trim() || undefined,
      role: roleValue === "all" ? undefined : roleValue,
      is_verified: isVerifiedValue === "all" ? undefined : isVerifiedValue,
      isDeleted: isDeletedValue === "all" ? undefined : isDeletedValue,
    });
  };

  // Đặt lại filter
  const handleReset = () => {
    setSearchValue("");
    setRoleValue("all");
    setIsVerifiedValue("all");
    setIsDeletedValue("all");
    onReset();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
      <Link to={`/admin/user/create`}>
        <Button variant="outline" size="sm">
          Thêm
        </Button>
      </Link>
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-center gap-2 mb-2 md:mb-0"
      >
        <Input
          placeholder="Tìm kiếm tên, email, số điện thoại..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-56"
        />
        <Select value={roleValue} onValueChange={setRoleValue}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
        <Select value={isVerifiedValue} onValueChange={setIsVerifiedValue}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Chọn xác minh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả xác minh</SelectItem>
            <SelectItem value="true">Đã xác minh</SelectItem>
            <SelectItem value="false">Chưa xác minh</SelectItem>
          </SelectContent>
        </Select>
        <Select value={isDeletedValue} onValueChange={setIsDeletedValue}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="false">Hoạt động</SelectItem>
            <SelectItem value="true">Đã khóa</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="default">
          Lọc
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Đặt lại
        </Button>
      </form>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          &lt;
        </Button>
        <span className="mx-2 text-sm">
          Trang {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          &gt;
        </Button>
      </div>
    </div>
  );
};

export default UserTableHeader;
