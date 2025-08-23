import { useEffect } from 'react';
import { toast } from 'sonner'; // Assuming you have sonner for toast notifications

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);

      // Show toast notification
      toast.error('Đã xảy ra lỗi không mong muốn', {
        description: event.reason?.message || 'Vui lòng thử lại sau',
        action: {
          label: 'Tải lại',
          onClick: () => window.location.reload(),
        },
      });

      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global Error:', event.error);

      // Show toast for global errors
      toast.error('Lỗi ứng dụng', {
        description: event.error?.message || 'Đã xảy ra lỗi không mong muốn',
        action: {
          label: 'Tải lại',
          onClick: () => window.location.reload(),
        },
      });
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
}

// Fallback version without toast (if you don't have sonner)
export function SimpleGlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);

      // Simple alert (you can replace with your preferred notification method)
      if (import.meta.env.DEV) {
        console.warn('Error in development mode:', event.reason);
      }

      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global Error:', event.error);

      if (import.meta.env.DEV) {
        console.warn('Error in development mode:', event.error);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
}
