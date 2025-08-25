import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useRedux";
import socketService from "@/services/socket.service";
import messageService from "@/services/message.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRealtimeTest() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [connectionStatus, setConnectionStatus] = useState<any>({});
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      // Connect socket for admin/staff
      const userRole = user.role || "guest";
      socketService.connect(token, user._id, userRole);

      // Update connection status every 2 seconds
      const interval = setInterval(() => {
        setConnectionStatus(socketService.getConnectionStatus());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [token, user]);

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testSocketConnection = () => {
    addTestResult("Testing socket connection...");
    socketService.testConnection();
    socketService.debugEventListeners();
  };

  const testAdminBroadcastJoin = () => {
    addTestResult("Testing admin broadcast room join...");
    socketService.joinAdminBroadcastRoom();
  };

  const testDirectApiCall = async () => {
    addTestResult("Testing direct API call...");

    try {
      const token = localStorage.getItem("access_token");
      const userString = localStorage.getItem("user");
      const userObj = userString ? JSON.parse(userString) : null;

      if (!token || !userObj) {
        addTestResult("❌ No token or user found");
        return;
      }

      // Get conversations first
      const conversations = await messageService.getConversations(userObj.role);
      if (conversations.length === 0) {
        addTestResult("❌ No conversations found");
        return;
      }

      const testConv = conversations[0];
      addTestResult(`🧪 Testing conversation: ${testConv._id}`);
      addTestResult(`🧪 Expected messageCount: ${testConv.messageCount}`);

      // Direct fetch call
      const conversationId = testConv._id;
      const userId = userObj._id;
      const role = userObj.role;

      const directUrl = `${
        import.meta.env.VITE_API_URL || "http://localhost:8080"
      }/messages/conversation/${userId}?conversationId=${conversationId}&ui_for=${role}&limit=50&page=1`;
      addTestResult(`🌐 Direct API URL: ${directUrl}`);

      const response = await fetch(directUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      addTestResult(`📥 Direct API response status: ${response.status}`);
      addTestResult(`📥 Direct API response: ${JSON.stringify(data, null, 2)}`);

      if (data.success && Array.isArray(data.data)) {
        addTestResult(`✅ Direct API returned: ${data.data.length} messages`);
      } else {
        addTestResult(`❌ Direct API failed or returned unexpected format`);
      }
    } catch (error: any) {
      addTestResult(`❌ Direct API test failed: ${error.message}`);
    }
  };

  const testApiCalls = async () => {
    setIsLoading(true);
    addTestResult("Testing API calls...");

    try {
      const userRole = user?.role || "guest";

      // Test conversations API
      addTestResult(`Testing conversations API for role: ${userRole}`);
      const conversations = await messageService.getConversations(
        userRole as "guest" | "staff" | "admin"
      );
      addTestResult(
        `✅ Conversations API success: ${conversations.length} conversations`
      );

      // Test first conversation messages if available
      if (conversations.length > 0) {
        const firstConv = conversations[0];
        addTestResult(
          `Testing messages API for conversation: ${firstConv._id}`
        );
        addTestResult(
          `Conversation messageCount from list: ${firstConv.messageCount}`
        );

        const messages = await messageService.getConversationMessages(
          firstConv._id,
          10,
          1,
          userRole as "guest" | "staff" | "admin"
        );
        addTestResult(`✅ Messages API result: ${messages.length} messages`);

        if (messages.length === 0 && firstConv.messageCount > 0) {
          addTestResult(
            `⚠️ Warning: Conversation shows ${firstConv.messageCount} messages but API returned 0`
          );
        }
      }

      // Test enhanced API methods
      addTestResult("Running enhanced API tests...");
      await messageService.testAllApiMethods();
      addTestResult(
        "✅ Enhanced API tests completed - check console for details"
      );
    } catch (error: any) {
      addTestResult(`❌ API test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This test component is only available for admin and staff users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin/Staff Realtime Test Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            User: {user.name} | Role: {user.role}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Connection Status</h3>
              <div className="text-sm space-y-1">
                <p>
                  Connected:{" "}
                  <span
                    className={
                      connectionStatus.connected
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {connectionStatus.connected ? "✅ Yes" : "❌ No"}
                  </span>
                </p>
                <p>Socket ID: {connectionStatus.socketId || "N/A"}</p>
                <p>User ID: {connectionStatus.userId || "N/A"}</p>
                <p>User Role: {connectionStatus.userRole || "N/A"}</p>
                <p>
                  Connection Attempts:{" "}
                  {connectionStatus.connectionAttempts || 0}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Test Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={testSocketConnection}
                  size="sm"
                  className="w-full"
                >
                  Test Socket Connection
                </Button>
                <Button
                  onClick={testAdminBroadcastJoin}
                  size="sm"
                  className="w-full"
                >
                  Join Admin Broadcast
                </Button>
                <Button
                  onClick={testApiCalls}
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Testing APIs..." : "Test API Calls"}
                </Button>
                <Button
                  onClick={testDirectApiCall}
                  size="sm"
                  className="w-full"
                  variant="secondary"
                  disabled={isLoading}
                >
                  Test Direct API
                </Button>
                <Button
                  onClick={clearResults}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Clear Results
                </Button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div>
            <h3 className="font-semibold mb-2">Test Results</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No test results yet. Click the test buttons above.
                </p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <p key={index} className="text-xs font-mono">
                      {result}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold mb-2">Instructions</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. First test socket connection to ensure you're connected</p>
              <p>2. Join admin broadcast room to receive realtime updates</p>
              <p>3. Test API calls to verify data fetching works</p>
              <p>4. Check browser console for detailed logs</p>
              <p>
                5. Open messages page in another tab to see realtime updates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
