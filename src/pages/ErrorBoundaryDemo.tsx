import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function ErrorBoundaryDemo() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Đây là lỗi demo để test Error Boundary!');
  }

  const triggerAsyncError = async () => {
    // Simulate async error
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('Lỗi async demo!');
  };

  const trigger404Error = () => {
    // This will trigger a route error
    window.location.href = '/non-existent-route';
  };

  return (
    <div className='container mx-auto p-6 max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Demo</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Các nút dưới đây sẽ trigger các loại lỗi khác nhau để test Error Boundary:
          </p>

          <div className='grid gap-3'>
            <Button onClick={() => setShouldError(true)} variant='destructive' className='w-full'>
              Trigger Sync Error (Component Error)
            </Button>

            <Button onClick={triggerAsyncError} variant='destructive' className='w-full'>
              Trigger Async Error
            </Button>

            <Button onClick={trigger404Error} variant='outline' className='w-full'>
              Trigger 404 Error
            </Button>

            <Button
              onClick={() => {
                // Trigger unhandled promise rejection
                Promise.reject(new Error('Unhandled Promise Rejection Demo'));
              }}
              variant='secondary'
              className='w-full'>
              Trigger Promise Rejection
            </Button>
          </div>

          <div className='mt-6 p-4 bg-muted rounded-lg'>
            <h4 className='font-semibold mb-2'>Hướng dẫn test:</h4>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>
                • <strong>Sync Error:</strong> Sẽ được bắt bởi Error Boundary
              </li>
              <li>
                • <strong>Async Error:</strong> Có thể không được bắt (depends on implementation)
              </li>
              <li>
                • <strong>404 Error:</strong> Sẽ show trang ErrorPage
              </li>
              <li>
                • <strong>Promise Rejection:</strong> Sẽ show trong console
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
