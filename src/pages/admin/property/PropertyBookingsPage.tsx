import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import PropertyBookingsList from "@/components/admin/properties/PropertyBookingsList";

export default function PropertyBookingsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  if (!propertyId) return null;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-white border-gray-200 hover:bg-gray-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
      <PropertyBookingsList propertyId={propertyId} />
    </div>
  );
}
