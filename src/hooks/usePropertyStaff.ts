import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import { RootState } from '@/store';
import messageService from '@/services/message.service';

interface Staff {
  _id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role: string;
}

interface UsePropertyStaffReturn {
  staffList: Staff[];
  loading: boolean;
  error: string | null;
  sendMessageToStaff: (staffId: string, content: string) => Promise<void>;
}

export const usePropertyStaff = (propertyId?: string): UsePropertyStaffReturn => {
  const { user, token } = useAppSelector((state: RootState) => state.auth);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load staff list for property
  const loadPropertyStaff = useCallback(async () => {
    if (!propertyId || !token) return;

    try {
      setLoading(true);
      setError(null);

      // For now, return a mock staff list since we don't have the API endpoint
      // In a real implementation, this would call an API endpoint like:
      // const response = await api.get(`/properties/${propertyId}/staff`);

      // Mock staff data
      const mockStaff: Staff[] = [
        {
          _id: 'staff_1',
          name: 'Nhân viên hỗ trợ',
          email: 'support@vinaside.com',
          role: 'staff',
          avatar_url: undefined,
        },
      ];

      setStaffList(mockStaff);
    } catch (err) {
      console.error('❌ Error loading property staff:', err);
      setError('Không thể tải danh sách nhân viên');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId, token]);

  // Send message to staff - creates a new conversation
  const sendMessageToStaff = useCallback(
    async (staffId: string, content: string) => {
      if (!propertyId || !content.trim()) {
        throw new Error('Missing required parameters');
      }

      try {
        // Create new conversation with staff using v2 API
        await messageService.sendMessage({
          property_id: propertyId,
          guest_id: user?._id, // Current user is guest
          content: content.trim(),
        });
      } catch (err) {
        console.error('❌ Error sending message to staff:', err);
        throw err;
      }
    },
    [propertyId, user?._id],
  );

  // Load staff when propertyId changes
  useEffect(() => {
    loadPropertyStaff();
  }, [loadPropertyStaff]);

  return {
    staffList,
    loading,
    error,
    sendMessageToStaff,
  };
};
