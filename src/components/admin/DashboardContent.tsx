import React from "react";
import { useUserRole } from "@/hooks/useUserRole";

export default function DashboardContent() {
  const { isAdmin, isStaff, user } = useUserRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isAdmin ? "Admin Dashboard" : isStaff ? "Staff Dashboard" : "Dashboard"}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Xin chào,</span>
          <span className="font-medium">{user?.name || 'User'}</span>
          {isAdmin && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Admin
            </span>
          )}
          {isStaff && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Staff
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Stats */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            {isAdmin ? "Tổng Properties" : "Properties của tôi"}
          </h3>
          <p className="text-3xl font-bold text-blue-600">-</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            {isAdmin ? "Tổng Bookings" : "Bookings quản lý"}
          </h3>
          <p className="text-3xl font-bold text-green-600">-</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            {isAdmin ? "Tổng Users" : "Thông tin cá nhân"}
          </h3>
          <p className="text-3xl font-bold text-purple-600">-</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            {isAdmin ? "Revenue" : "Thu nhập"}
          </h3>
          <p className="text-3xl font-bold text-orange-600">-</p>
        </div>
      </div>

      {/* Role-specific content */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              Quản lý Properties
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              Quản lý Staff
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              System Settings
            </button>
          </div>
        </div>
      )}

      {isStaff && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Staff Tools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              Quản lý Properties được assign
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50">
              Xem Bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
