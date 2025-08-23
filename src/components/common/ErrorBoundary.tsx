import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, HomeIcon, RefreshCw, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useState } from 'react';

export function RootErrorBoundary() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return {
        title: `${error.status} - ${error.statusText}`,
        message: error.data?.message || 'Đã xảy ra lỗi không mong muốn',
        details: error.data,
      };
    }

    if (error instanceof Error) {
      return {
        title: 'Lỗi ứng dụng',
        message: error.message || 'Đã xảy ra lỗi không mong muốn',
        details: error.stack,
      };
    }

    return {
      title: 'Lỗi không xác định',
      message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
      details: String(error),
    };
  };

  const { title, message, details } = getErrorMessage();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='mx-auto max-w-2xl shadow-lg border-destructive/20'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='rounded-full bg-destructive/10 p-4'>
              <AlertTriangle className='h-12 w-12 text-destructive' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-destructive'>{title}</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <Alert className='border-destructive/20'>
            <Bug className='h-4 w-4' />
            <AlertDescription className='text-base'>{message}</AlertDescription>
          </Alert>

          <div className='text-center text-sm text-muted-foreground'>
            <p>Chúng tôi xin lỗi vì sự bất tiện này. Nhóm phát triển đã được thông báo và đang khắc phục vấn đề.</p>
          </div>

          {details && (
            <div className='border-t pt-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowDetails(!showDetails)}
                className='w-full justify-center gap-2 text-muted-foreground'>
                {showDetails ? (
                  <>
                    <ChevronUp className='h-4 w-4' />
                    Ẩn chi tiết lỗi
                  </>
                ) : (
                  <>
                    <ChevronDown className='h-4 w-4' />
                    Xem chi tiết lỗi
                  </>
                )}
              </Button>

              {showDetails && (
                <div className='mt-3 p-3 bg-muted rounded-md'>
                  <pre className='text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap'>
                    {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex flex-col sm:flex-row justify-center gap-3'>
          <Button onClick={handleRefresh} variant='default' className='w-full sm:w-auto'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>

          <Button onClick={handleGoHome} variant='outline' className='w-full sm:w-auto'>
            <HomeIcon className='mr-2 h-4 w-4' />
            Về trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Component cho lỗi trang con (ít nghiêm trọng hơn)
export function PageErrorBoundary() {
  const error = useRouteError();
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return {
        title: `${error.status} - ${error.statusText}`,
        message: error.data?.message || 'Không thể tải nội dung này',
        details: error.data,
      };
    }

    if (error instanceof Error) {
      return {
        title: 'Lỗi tải trang',
        message: error.message || 'Không thể tải nội dung này',
        details: error.stack,
      };
    }

    return {
      title: 'Lỗi không xác định',
      message: 'Không thể tải nội dung này. Vui lòng thử lại.',
      details: String(error),
    };
  };

  const { title, message, details } = getErrorMessage();

  return (
    <div className='flex items-center justify-center min-h-[400px] p-4'>
      <Card className='mx-auto max-w-lg shadow-md'>
        <CardHeader className='text-center pb-3'>
          <div className='flex justify-center mb-3'>
            <div className='rounded-full bg-amber-100 p-3'>
              <AlertTriangle className='h-8 w-8 text-amber-600' />
            </div>
          </div>
          <CardTitle className='text-lg font-semibold text-amber-700'>{title}</CardTitle>
        </CardHeader>

        <CardContent className='space-y-3'>
          <Alert className='border-amber-200 bg-amber-50'>
            <AlertDescription className='text-amber-800'>{message}</AlertDescription>
          </Alert>

          {details && (
            <div className='border-t pt-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowDetails(!showDetails)}
                className='w-full justify-center gap-2 text-muted-foreground'>
                {showDetails ? (
                  <>
                    <ChevronUp className='h-4 w-4' />
                    Ẩn chi tiết
                  </>
                ) : (
                  <>
                    <ChevronDown className='h-4 w-4' />
                    Xem chi tiết
                  </>
                )}
              </Button>

              {showDetails && (
                <div className='mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32'>
                  <pre className='text-muted-foreground whitespace-pre-wrap'>
                    {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className='flex justify-center gap-2'>
          <Button onClick={() => window.location.reload()} size='sm' className='w-full'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RootErrorBoundary;
