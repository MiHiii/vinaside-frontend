import { useState } from "react";

export function DashboardContent() {
  const [tab, setTab] = useState<
    "Overview" | "Analytics" | "Reports" | "Notifications"
  >("Overview");

  const tabs = ["Overview", "Analytics", "Reports", "Notifications"] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-2  dark:bg-slate-800 p-1 rounded">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === t
                ? "bg-white dark:bg-slate-900 shadow"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-md shadow">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="text-xl font-bold">$45,231.89</div>
          <div className="text-sm text-green-500">+20.1% from last month</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-md shadow">
          <div className="text-xs text-gray-500">Subscriptions</div>
          <div className="text-xl font-bold">+2,350</div>
          <div className="text-sm text-green-500">+180.1% from last month</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-md shadow">
          <div className="text-xs text-gray-500">Sales</div>
          <div className="text-xl font-bold">+12,234</div>
          <div className="text-sm text-green-500">+19% from last month</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-md shadow">
          <div className="text-xs text-gray-500">Active Now</div>
          <div className="text-xl font-bold">+573</div>
          <div className="text-sm text-green-500">+201 since last hour</div>
        </div>
      </div>

      {/* Graph placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-md shadow p-4 h-64 flex items-center justify-center">
        {/* Bạn có thể thay bằng chart thực tế ở đây */}
        <span className="text-gray-500">[Chart]</span>
      </div>

      {/* Recent Sales placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-md shadow p-4">
        <h2 className="text-lg font-medium mb-2">Recent Sales</h2>
        <div className="space-y-2">
          {[
            { name: "Olivia Martin", amount: "$1,999.00" },
            { name: "Jackson Lee", amount: "$39.00" },
            { name: "Isabella Nguyen", amount: "$299.00" },
          ].map((u) => (
            <div key={u.name} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-500">
                  {u.name.toLowerCase().split(" ").join(".")}@email.com
                </div>
              </div>
              <div className="text-green-500 font-medium">{u.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
