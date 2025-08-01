import React from "react";
import { Button } from "@/components/ui/button";
import { IListing } from "@/types/listing";
import { Amenity } from "@/types/amenity";
import { Service } from "@/types/services";
import { useState } from "react";
import { SafetyFeature } from "@/types/safety-feature";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/useRedux";

interface RoomDescriptionProps {
  listing: IListing;
  amenitiesList: Amenity[];
  services: Service[];
  selectedServices: {
    service_id: string;
    service_name: string;
    service_price: number;
    quantity: number;
    total_price: number;
  }[];
  setSelectedServices: (services: any[]) => void;
  safetyFeatures: SafetyFeature[];
}

const RoomDescription: React.FC<RoomDescriptionProps> = (props) => {
  const {
    listing,
    amenitiesList = [],
    services = [],
    selectedServices = [],
    setSelectedServices,
    safetyFeatures = [],
  } = props;
  const [open, setOpen] = useState(false);
  console.log("RoomDescription services:", services);
  console.log("RoomDescription listing.service_ids:", listing.service_ids);
  console.log(
    "RoomDescription services _id list:",
    services.map((s) => s._id)
  );
  // Group amenities by category
  const grouped = amenitiesList
    .filter((a) => (listing.amenities ?? []).includes(a._id))
    .reduce((acc, amenity) => {
      const cat = amenity.category || "Tiện nghi";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(amenity);
      return acc;
    }, {} as Record<string, typeof amenitiesList>);
  const houseRules =
    useAppSelector((state) => state.houseRule.houseRules) ?? [];
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
        <h3 className="text-lg sm:text-xl font-semibold">
          Nơi này có những gì cho bạn
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listing.amenities?.map((amenityId) => {
            const amenity = amenitiesList.find((a) => a._id === amenityId);
            if (!amenity) return null;
            return (
              <div key={amenity._id} className="flex items-center gap-3">
                {amenity.icon_url && (
                  <img
                    src={amenity.icon_url}
                    alt={amenity.name}
                    className="h-5 w-5"
                  />
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
          Hiển thị tất cả tiện nghi & chính sách & nội quy
        </Button>
        {/* Dịch vụ kèm theo ngoài modal - chuyển xuống dưới */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-black">
              Dịch vụ kèm theo
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={
                  listing.service_ids &&
                  selectedServices.length === listing.service_ids.length &&
                  listing.service_ids.length > 0
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedServices(
                      (listing.service_ids ?? [])
                        .map((id) => {
                          const service = services.find(
                            (s) => s._id === String(id)
                          );
                          return service
                            ? {
                                service_id: service._id,
                                service_name: service.name,
                                service_price: service.default_price || 0,
                                quantity: 1,
                                total_price: (service.default_price || 0) * 1, // Đảm bảo tính đúng
                              }
                            : null;
                        })
                        .filter(Boolean)
                    );
                  } else {
                    setSelectedServices([]);
                  }
                }}
                className="accent-red-500 h-4 w-4 rounded border-2 border-gray-300"
              />
              <span className="text-xs font-medium text-gray-600 group-hover:text-red-500 transition-colors">
                Chọn tất cả
              </span>
            </label>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden">
            {listing.service_ids && listing.service_ids.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {(listing.service_ids ?? []).map((serviceId) => {
                  const service = services.find(
                    (s) => s._id === String(serviceId)
                  );
                  if (!service) return null;
                  const selected = selectedServices.find(
                    (s) => s.service_id === service._id
                  );
                  return (
                    <div
                      key={service._id}
                      className={`flex items-center gap-4 p-3 transition-all duration-200 hover:bg-gray-50 ${
                        selected ? "bg-red-50 border-l-4 border-l-red-500" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => {
                          console.log(
                            "Service clicked:",
                            service.name,
                            "Selected:",
                            !!selected
                          );
                          if (selected) {
                            const newServices = selectedServices.filter(
                              (s) => s.service_id !== service._id
                            );
                            console.log(
                              "Removing service, new services:",
                              newServices
                            );
                            setSelectedServices(newServices);
                          } else {
                            const servicePrice = service.default_price || 0;
                            const newService = {
                              service_id: service._id,
                              service_name: service.name,
                              service_price: servicePrice,
                              quantity: 1,
                              total_price: servicePrice * 1, // Đảm bảo tính đúng
                            };
                            const newServices = [
                              ...selectedServices,
                              newService,
                            ];
                            console.log(
                              "Adding service, new services:",
                              newServices
                            );
                            setSelectedServices(newServices);
                          }
                        }}
                        className="accent-red-500 h-4 w-4 rounded border-2 border-gray-300"
                      />

                      <div className="flex items-center gap-3 flex-1">
                        {service.icon_url ? (
                          <img
                            src={service.icon_url}
                            alt={service.name}
                            className="h-12 w-12 rounded-lg object-cover bg-white"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-sm">
                              {service.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="text-base font-medium text-black">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Dịch vụ bổ sung
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-red-600 font-medium">
                          {service.default_price?.toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-gray-400 text-xs">
                  Không có dịch vụ kèm theo
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-full w-full bg-white  shadow-xl px-4 py-8 border-none"
          style={{ maxWidth: "1200px" }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-8">
              Nơi này có những gì cho bạn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-8 text-lg sm:text-xl font-semibold ">
                <div className="text-lg sm:text-xl font-semibold mb-4">
                  {cat}
                </div>
                <div className="rounded-2xl  p-2 sm:p-4">
                  {items.map((amenity, idx) => (
                    <div
                      key={amenity._id}
                      className={`flex items-center gap-6 px-6 py-4 ${
                        idx !== items.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      } hover:bg-gray-50 transition`}
                    >
                      {amenity.icon_url && (
                        <img
                          src={amenity.icon_url}
                          alt={amenity.name}
                          className="h-12 w-12 rounded-xl object-contain border border-gray-200"
                        />
                      )}
                      <span className="text-gray-900 text-base flex-1">
                        {amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Chính sách an toàn */}
            <div>
              <div className="text-lg sm:text-xl font-semibold mb-2">
                Chính sách an toàn
              </div>
              <div className="rounded-2xl   p-2 sm:p-4">
                {listing.safety_features &&
                listing.safety_features.length > 0 ? (
                  (listing.safety_features ?? []).map((safetyId) => {
                    const safety = safetyFeatures.find(
                      (s) => s._id === String(safetyId)
                    );
                    if (!safety) return null;
                    return (
                      <div
                        key={safety._id}
                        className="flex items-center gap-3 px-6 py-2 border-b border-gray-200 hover:bg-gray-50 last:border-b-0"
                      >
                        <span className="text-gray-900 text-base flex-1">
                          {safety.name}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-500">
                    Không có chính sách an toàn
                  </span>
                )}
              </div>
            </div>
            {/* Nội quy */}
            <div>
              <div className="text-lg sm:text-xl font-semibold mb-2">
                Nội quy
              </div>
              <div className="rounded-2xl  p-2 sm:p-4">
                {listing.house_rules_selected &&
                listing.house_rules_selected.length > 0 ? (
                  listing.house_rules_selected.map((id: string) => {
                    const rule = houseRules.find(
                      (hr) => String(hr._id) === String(id)
                    );
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 px-6 py-2 border-b hover:bg-gray-50 border-gray-200 last:border-b-0"
                      >
                        {rule?.icon_url && (
                          <img
                            src={rule.icon_url}
                            alt={rule.name}
                            className="h-8 w-8 rounded object-contain border border-gray-200 shadow-sm"
                          />
                        )}
                        <span className="text-gray-900 text-base flex-1">
                          {rule ? rule.name : id}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-gray-500">Không có nội quy</span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomDescription;
