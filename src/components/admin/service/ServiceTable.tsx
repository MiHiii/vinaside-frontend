import { Service } from '@/types/services';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  services: Service[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onShowDetail: (id: string) => void;
  onToggleQuantity: (id: string) => void;
}

const statusColor = (active: boolean) => (active ? 'text-green-600 font-semibold' : 'text-orange-500 font-semibold');

// Custom Toggle Component
const ToggleSwitch = ({
  checked,
  onChange,
  disabled = false,
  color = 'blue',
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: 'blue' | 'green';
}) => {
  const bgColor = checked ? (color === 'blue' ? 'bg-blue-500' : 'bg-green-500') : 'bg-gray-200';

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-green-500'}
      `}>
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

const ServiceTable: React.FC<Props> = ({
  services,
  onEdit,
  onDelete,
  onRestore,
  onToggleStatus,
  onToggleQuantity,
}: Props) => {
  const navigate = useNavigate();

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Kiểm tra xem click có phải từ các nút hay toggle không
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('label') || target.tagName === 'INPUT') {
      return;
    }
    navigate(`/admin/services/${id}/usage`);
  };

  return (
    <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow'>
      <table className='min-w-full'>
        <thead>
          <tr className='bg-gray-50'>
            <th className='text-center p-2'>Icon</th>
            <th className='text-center p-2'>Tên dịch vụ</th>
            <th className='text-center p-2'>Mô tả</th>
            <th className='text-center p-2'>Đơn vị</th>
            <th className='text-center p-2'>Giá</th>
            <th className='text-center p-2'>Trạng thái</th>
            <th className='text-center p-2'>Cho phép số lượng</th>
            <th className='text-center p-2'>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s._id} className='hover:bg-gray-50 cursor-pointer' onClick={(e) => handleRowClick(s._id, e)}>
              <td className='text-center p-2'>
                {s.icon_url ? (
                  <img
                    src={s.icon_url}
                    alt='icon'
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: 'cover',
                      borderRadius: 6,
                      display: 'inline-block',
                    }}
                  />
                ) : null}
              </td>
              <td className='px-4 py-2 font-medium hover:text-gray-600'>{s.name}</td>
              <td className='text-center p-2'>{s.description}</td>
              <td className='text-center p-2'>{s.unit}</td>
              <td className='text-center p-2'>{s.default_price.toLocaleString()} đ</td>
              <td className='text-center p-2' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-center gap-2'>
                  <span className={`font-medium ${statusColor(s.is_active)}`}>
                    {s.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                  <ToggleSwitch checked={s.is_active} onChange={() => onToggleStatus(s._id)} color='green' />
                </div>
              </td>
              <td className='text-center p-2' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-center gap-2'>
                  <span className={`font-medium ${s.allow_quantity ? 'text-green-600' : 'text-gray-500'}`}>
                    {s.allow_quantity ? 'Có' : 'Không'}
                  </span>
                  <ToggleSwitch
                    checked={s.allow_quantity || false}
                    onChange={() => onToggleQuantity(s._id)}
                    color='blue'
                  />
                </div>
              </td>
              <td className='text-center p-2 space-x-2' onClick={(e) => e.stopPropagation()}>
                <Button size='sm' variant='default' onClick={() => onEdit(s._id)}>
                  <Pencil className='w-4 h-4' /> Sửa
                </Button>
                {!s.isDeleted ? (
                  <Button size='sm' variant='default' onClick={() => onDelete(s._id)}>
                    <Trash className='w-4 h-4' /> Xóa
                  </Button>
                ) : (
                  <Button size='sm' variant='secondary' onClick={() => onRestore(s._id)}>
                    Khôi phục
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceTable;
