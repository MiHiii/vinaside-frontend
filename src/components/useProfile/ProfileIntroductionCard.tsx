import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileIntroductionCardProps {
  userName: string;
  userRole: string;
  avatarFallback: string;
}

export default function ProfileIntroductionCard({
  userName,
  userRole,
  avatarFallback,
}: ProfileIntroductionCardProps) {
  return (
    <Card className="w-full max-w-xs rounded-xl shadow-lg border-none  hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <Avatar className="h-24 w-24">
          <AvatarFallback className="text-4xl bg-black text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{userName}</h2>
          <p className="text-sm text-gray-500">{userRole}</p>
        </div>
      </CardContent>
    </Card>
  );
}