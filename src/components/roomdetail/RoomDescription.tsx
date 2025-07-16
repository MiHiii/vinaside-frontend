import React from "react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";
import { Amenity } from "@/types/amenity";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

interface RoomDescriptionProps {
  listing: IListing;
  amenitiesList: Amenity[];
  selectedServices: string[];
  setSelectedServices: (s: string[]) => void;
}

const RoomDescription: React.FC<RoomDescriptionProps> = ({ listing, amenitiesList, selectedServices, setSelectedServices }) => {
  const [open, setOpen] = useState(false);
  // Group amenities by category
  const grouped = amenitiesList
    .filter(a => (listing.amenities ?? []).includes(a._id))
    .reduce((acc, amenity) => {
      const cat = amenity.category || "Khác";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(amenity);
      return acc;
    }, {} as Record<string, typeof amenitiesList>);
  // Dịch vụ cố định kèm giá
  const fixedServices = [
    {
      name: "Dọn phòng hàng ngày",
      icon_url: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
      price: 50000
    },
    {
      name: "Đưa đón sân bay",
      icon_url: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
      price: 200000
    },
  ];
  const toggleService = (name: string) => {
    if (selectedServices.includes(name)) {
      setSelectedServices(selectedServices.filter(n => n !== name));
    } else {
      setSelectedServices([...selectedServices, name]);
    }
  };
  return (
    <>
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold">
          Giới thiệu về chỗ ở này
        </h3>
        <div className="text-gray-900 leading-relaxed">
          <p>{listing.description}</p>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg sm:text-xl font-semibold">Nơi này có những gì cho bạn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listing.amenities?.map((amenityId) => {
            const amenity = amenitiesList.find(a => a._id === amenityId);
            if (!amenity) return null;
            return (
              <div key={amenity._id} className="flex items-center gap-3">
                {amenity.icon_url && (
                  <img src={amenity.icon_url} alt={amenity.name} className="h-5 w-5" />
                )}
                <span className="text-gray-700">{amenity.name}</span>
              </div>
            );
          })}
        </div>
        <Button
          variant="outline"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-md border-none shadow-sm transition duration-200"
          onClick={() => setOpen(true)}
        >
          Hiển thị tất cả {listing.amenities?.length || 0} tiện nghi
        </Button>
        {/* Dịch vụ kèm theo ngoài modal - chuyển xuống dưới */}
        <div className="mt-8">
          <div className="text-lg sm:text-xl font-semibold">Dịch vụ kèm theo</div>
          <div className="rounded-2xl bg-white shadow p-2 sm:p-4">
            {fixedServices.map(service => {
              const checked = selectedServices.includes(service.name);
              return (
                <div
                  key={service.name}
                  className={`flex items-center gap-6 px-6 py-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition ${checked ? 'bg-pink-50' : ''}`}
                  onClick={() => toggleService(service.name)}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service.name)}
                    className="accent-pink-500 h-5 w-5"
                    onClick={e => e.stopPropagation()}
                  />
                  <img src={service.icon_url} alt={service.name} className="h-10 w-10 rounded-xl object-contain border border-gray-200 shadow-sm" />
                  <span className="text-gray-900 text-base font-semibold flex-1">{service.name}</span>
                  <span className="text-pink-600 text-base font-bold">{service.price.toLocaleString()}₫</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-full w-full bg-white shadow-xl px-4 py-8 border-none" style={{ maxWidth: '1200px' }}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold mb-8">Nơi này có những gì cho bạn</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-8">
                <div className="font-extrabold text-2xl mb-4 text-gray-900">{cat}</div>
                <div className="rounded-2xl shadow-md p-2 sm:p-4">
                  {items.map((amenity, idx) => (
                    <div
                      key={amenity._id}
                      className={`flex items-center gap-6 px-6 py-4 ${idx !== items.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50 transition`}
                    >
                      {amenity.icon_url && (
                        <img src={amenity.icon_url} alt={amenity.name} className="h-12 w-12 rounded-xl bg-gray-50 object-contain border border-gray-200 shadow-sm" />
                      )}
                      <span className="text-gray-900 text-lg font-semibold">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomDescription;