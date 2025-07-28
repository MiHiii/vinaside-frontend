import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertyStaffManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          Không tìm thấy ID property
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/properties")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách tòa nhà
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Quản lý nhân viên cho tòa nhà</CardTitle>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 