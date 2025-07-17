import React, { useState } from 'react';
import { Permission } from '@/types/rbac';

interface Props {
  permissions: Permission[];
  assigned: string[]; // các permission key đã được gán cho vai trò
  onChange: (key: string, checked: boolean) => void;
  onCheckAllModule: (module: string, checked: boolean) => void;
}

const PermissionTree: React.FC<Props> = ({
  permissions,
  assigned,
  onChange,
  onCheckAllModule,
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Nhóm permission theo module và sub-module
  const moduleStructure = permissions.reduce((acc, permission) => {
    const [mainModule, subModule] = permission.module.split('.');
    
    if (!acc[mainModule]) {
      acc[mainModule] = {};
    }
    
    if (!acc[mainModule][subModule || 'default']) {
      acc[mainModule][subModule || 'default'] = [];
    }
    
    acc[mainModule][subModule || 'default'].push(permission);
    return acc;
  }, {} as Record<string, Record<string, Permission[]>>);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const isModuleExpanded = (module: string) => expandedModules.has(module);

  const getAllPermissionsInModule = (module: string) => {
    const subModules = moduleStructure[module];
    return Object.values(subModules).flat();
  };

  const getModuleStats = (module: string) => {
    const allPermissions = getAllPermissionsInModule(module);
    const assignedCount = allPermissions.filter(p => assigned.includes(p.key)).length;
    return { total: allPermissions.length, assigned: assignedCount };
  };

  return (
    <div className="space-y-2">
      {Object.entries(moduleStructure).map(([mainModule, subModules]) => {
        const moduleStats = getModuleStats(mainModule);
        const allPermissions = getAllPermissionsInModule(mainModule);
        const allChecked = allPermissions.every(p => assigned.includes(p.key));
        const someChecked = !allChecked && allPermissions.some(p => assigned.includes(p.key));
        const isExpanded = isModuleExpanded(mainModule);

        return (
          <div key={mainModule} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Main Module Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleModule(mainModule)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <h4 className="font-medium text-gray-900 capitalize">{mainModule}</h4>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {moduleStats.assigned}/{moduleStats.total}
                  </span>
                </div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => {
                      if (el) el.indeterminate = someChecked;
                    }}
                    onChange={e => onCheckAllModule(mainModule, e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Chọn tất cả
                </label>
              </div>
            </div>

            {/* Sub-modules */}
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {Object.entries(subModules).map(([subModule, subPermissions]) => {
                  const subAllChecked = subPermissions.every(p => assigned.includes(p.key));
                  const subSomeChecked = !subAllChecked && subPermissions.some(p => assigned.includes(p.key));

                  return (
                    <div key={subModule} className="bg-gray-25">
                      {/* Sub-module Header */}
                      <div className="px-6 py-2 bg-gray-25 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-medium text-gray-700 capitalize">
                              {subModule === 'default' ? 'Chung' : subModule}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {subPermissions.filter(p => assigned.includes(p.key)).length}/{subPermissions.length}
                            </span>
                          </div>
                          <label className="inline-flex items-center text-xs font-medium text-gray-600">
                            <input
                              type="checkbox"
                              checked={subAllChecked}
                              ref={el => {
                                if (el) el.indeterminate = subSomeChecked;
                              }}
                              onChange={e => {
                                const moduleKey = `${mainModule}.${subModule}`;
                                onCheckAllModule(moduleKey, e.target.checked);
                              }}
                              className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Chọn tất cả
                          </label>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="px-8 py-2 space-y-1">
                        {subPermissions.map((permission) => (
                          <label key={permission.key} className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={assigned.includes(permission.key)}
                              onChange={e => onChange(permission.key, e.target.checked)}
                              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">
                                {permission.description || permission.action || permission.key}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PermissionTree;
