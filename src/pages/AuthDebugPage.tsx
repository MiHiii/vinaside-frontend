import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { useAppSelector } from '@/hooks/useRedux';
import messageService from '@/services/message.service';
import { useMessages } from '@/hooks/useMessages';

interface DebugInfo {
  reduxUser: unknown;
  reduxToken: string | null;
  localToken: string | null;
  localUser: unknown;
  userRole: string;
  timestamp: string;
}

export default function AuthDebugPage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { conversations, loadConversations, isLoadingConversations } = useMessages();

  const checkAuthStatus = () => {
    const localToken = localStorage.getItem('access_token');
    const localUser = localStorage.getItem('user');
    const userRole = messageService.getUserRole();
    
    setDebugInfo({
      reduxUser: user,
      reduxToken: token,
      localToken: localToken,
      localUser: localUser ? JSON.parse(localUser) : null,
      userRole,
      timestamp: new Date().toISOString()
    });
  };

  const testConversationAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing conversation API...');
      await loadConversations();
      console.log('✅ Conversations loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing direct message service...');
      const userRole = messageService.getUserRole();
      const result = await messageService.getConversations(userRole);
      console.log('✅ Direct API success:', result);
    } catch (error) {
      console.error('❌ Direct API failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Message API Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Auth Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Authentication Status</h3>
            <div className="grid gap-2 mb-4">
              <Button onClick={checkAuthStatus} variant="outline">
                Check Auth Status
              </Button>
            </div>
            
            {debugInfo && (
              <Alert>
                <AlertDescription>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* API Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-3">API Tests</h3>
            <div className="grid gap-2 mb-4">
              <Button 
                onClick={testConversationAPI} 
                disabled={loading || isLoadingConversations}
                className="w-full"
              >
                {loading || isLoadingConversations ? 'Testing...' : 'Test useMessages Hook'}
              </Button>
              
              <Button 
                onClick={testDirectAPI} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test Direct Message Service'}
              </Button>
            </div>

            {conversations.length > 0 && (
              <Alert>
                <AlertDescription>
                  <div className="text-sm">
                    <strong>Conversations loaded:</strong> {conversations.length}
                    <pre className="text-xs mt-2 overflow-auto max-h-40">
                      {JSON.stringify(conversations.slice(0, 2), null, 2)}
                    </pre>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Console Instructions */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Instructions:</h4>
            <ul className="text-sm space-y-1">
              <li>• Check browser console for detailed logs</li>
              <li>• Check Network tab for API request details</li>
              <li>• Verify Authorization header is being sent</li>
              <li>• Check if 401 errors are being handled properly</li>
            </ul>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
