import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import socketService from '@/services/socket.service';
import { useAppSelector } from '@/hooks/useRedux';

export default function SocketDebug() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [socketStatus, setSocketStatus] = useState(socketService.getSocketStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSocketStatus(socketService.getSocketStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleForceReconnect = () => {
    if (token && user?._id) {
      socketService.forceReconnect(token, user._id);
    }
  };

  const handleConnect = () => {
    if (token && user?._id) {
      socketService.connect(token, user._id);
    }
  };

  const handleDisconnect = () => {
    socketService.disconnect();
  };

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} variant='outline' size='sm' className='fixed bottom-4 right-4 z-50'>
        🔌 Socket Debug
      </Button>
    );
  }

  return (
    <Card className='fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm flex items-center justify-between'>
          🔌 Socket Debug
          <Button onClick={() => setIsVisible(false)} variant='ghost' size='sm' className='h-6 w-6 p-0'>
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='text-xs space-y-1'>
          <div className='flex justify-between'>
            <span>Status:</span>
            <span className={socketStatus.connected ? 'text-green-500' : 'text-red-500'}>
              {socketStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>User ID:</span>
            <span className='text-muted-foreground'>{user?._id || 'None'}</span>
          </div>
          <div className='flex justify-between'>
            <span>Token:</span>
            <span className='text-muted-foreground'>{token ? 'Present' : 'Missing'}</span>
          </div>
          <div className='flex justify-between'>
            <span>Connection Attempts:</span>
            <span className='text-muted-foreground'>{socketStatus.connectionAttempts}</span>
          </div>
        </div>

        <div className='flex gap-2 pt-2'>
          <Button onClick={handleConnect} size='sm' className='text-xs'>
            Connect
          </Button>
          <Button onClick={handleDisconnect} size='sm' variant='outline' className='text-xs'>
            Disconnect
          </Button>
          <Button onClick={handleForceReconnect} size='sm' variant='secondary' className='text-xs'>
            Reconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
