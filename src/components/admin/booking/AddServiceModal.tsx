import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { SERVICE_CONSTANTS, SERVICE_MESSAGES } from "@/constants/service";

interface Service {
  _id: string;
  name: string;
  description?: string;
  default_price: number;
  unit: string;
  allow_quantity?: boolean;
}

interface BookingService {
  service_id?: string;
  _id?: string;
  service_name?: string;
  quantity?: number;
  service_price?: number;
}

interface Booking {
  _id: string;
  selected_services?: BookingService[];
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking; // Booking data
  propertyId: string;
  bookingId: string;
  onSuccess: () => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  propertyId,
  bookingId,
  onSuccess,
}) => {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Load available services when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableServices();
      setSelectedServices({});
    }
  }, [isOpen]);

  const loadAvailableServices = async () => {
    setServicesLoading(true);
    try {
      const res = await api.get("/services/active");
      setAvailableServices(res.data.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices((prev) => ({
        ...prev,
        [serviceId]: 1,
      }));
    } else {
      setSelectedServices((prev) => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  };

  const handleConfirmAddServices = async () => {
    if (Object.keys(selectedServices).length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    // Validate and enforce quantity rules
    for (const [serviceId, quantity] of Object.entries(selectedServices)) {
      const service = availableServices.find((s) => s._id === serviceId);
      if (!service) continue;
      if (!service.allow_quantity && quantity > 1) {
        toast.error(
          `Dịch vụ "${service.name}" không cho phép chọn số lượng. Chỉ có thể chọn 1 lần.`
        );
        return;
      }
      if (quantity > SERVICE_CONSTANTS.MAX_QUANTITY) {
        toast.error(SERVICE_MESSAGES.MAX_QUANTITY_EXCEEDED);
        return;
      }
      if (quantity < SERVICE_CONSTANTS.MIN_QUANTITY) {
        toast.error(SERVICE_MESSAGES.MIN_QUANTITY_REQUIRED);
        return;
      }
    }

    setLoading(true);
    try {
      // Tạo danh sách dịch vụ mới được chọn
      const newSelectedServicesArray = Object.entries(selectedServices).map(
        ([serviceId, quantity]) => ({
          serviceId,
          quantity,
        })
      );

      // Lấy danh sách dịch vụ cũ từ booking
      const existingServicesArray =
        booking.selected_services?.map((service: BookingService) => ({
          serviceId: service.service_id || service._id,
          quantity: service.quantity || 1,
        })) || [];

      // Kết hợp dịch vụ cũ và mới
      const allServicesArray = [
        ...existingServicesArray,
        ...newSelectedServicesArray,
      ];

      console.log("Sending all services:", allServicesArray);

      // Sử dụng API dành cho admin/staff
      const response = await api.patch(
        `/bookings/property/${propertyId}/${bookingId}`,
        {
          selected_services: allServicesArray,
        }
      );

      console.log("API Response:", response.data);

      toast.success("Thêm dịch vụ thành công!");
      onClose();
      setSelectedServices({});
      onSuccess(); // Refresh booking data
    } catch (error: unknown) {
      console.error("Error adding services:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi khi thêm dịch vụ";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white shadow-xl border border-gray-200 rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={20} />
            Thêm dịch vụ cho booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {servicesLoading ? (
            <div className="text-center py-8">
              <Loader2 size={24} className="animate-spin mx-auto mb-2" />
              <p>Đang tải danh sách dịch vụ...</p>
            </div>
          ) : availableServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có dịch vụ nào khả dụng</p>
            </div>
          ) : (
            availableServices.map((service) => {
              // Kiểm tra xem dịch vụ này đã được đăng ký trước đó chưa
              const existingService = booking.selected_services?.find(
                (registeredService: BookingService) =>
                  registeredService.service_id === service._id ||
                  registeredService._id === service._id ||
                  registeredService.service_name === service.name
              );
              const isAlreadyRegistered = !!existingService;

              return (
                <div
                  key={service._id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    selectedServices[service._id]
                      ? "bg-blue-50 border-blue-300"
                      : isAlreadyRegistered
                      ? "bg-gray-100 border-gray-300 opacity-75"
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isAlreadyRegistered) {
                      const currentChecked = !!selectedServices[service._id];
                      handleServiceSelection(service._id, !currentChecked);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={service._id}
                        checked={
                          !!selectedServices[service._id] || isAlreadyRegistered
                        }
                        disabled={isAlreadyRegistered}
                        onCheckedChange={(checked) => {
                          if (!isAlreadyRegistered) {
                            handleServiceSelection(
                              service._id,
                              checked as boolean
                            );
                          }
                        }}
                        onClick={(e) => {
                          if (!isAlreadyRegistered) {
                            e.stopPropagation();
                          }
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      />
                      <div>
                        <Label
                          htmlFor={service._id}
                          className={`font-medium ${
                            isAlreadyRegistered
                              ? "cursor-not-allowed text-gray-500"
                              : "cursor-pointer"
                          }`}
                        >
                          {service.name}
                          {isAlreadyRegistered && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Đã đăng ký
                            </span>
                          )}
                        </Label>
                        <p
                          className={`text-sm ${
                            isAlreadyRegistered
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {service.description}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {service.default_price?.toLocaleString()}₫ /{" "}
                          {service.unit}
                        </p>
                        {service.allow_quantity && selectedServices[service._id] && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;
                                  const next = Math.max(SERVICE_CONSTANTS.MIN_QUANTITY, current - 1);
                                  return { ...prev, [service._id]: next };
                                });
                              }}
                            >
                              -
                            </Button>
                            <span className="min-w-[20px] text-center text-sm font-medium">
                              {selectedServices[service._id] || 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;
                                  if (current >= SERVICE_CONSTANTS.MAX_QUANTITY) {
                                    toast.error(SERVICE_MESSAGES.MAX_QUANTITY_EXCEEDED);
                                    return prev;
                                  }
                                  const next = current + 1;
                                  return { ...prev, [service._id]: next };
                                });
                              }}
                              disabled={(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY}
                            >
                              +
                            </Button>
                            {(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY && (
                              <span className="text-xs text-gray-500">{SERVICE_MESSAGES.QUANTITY_LIMIT_HINT}</span>
                            )}
                          </div>
                        )}
                        {service.allow_quantity && selectedServices[service._id] && (
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;
                                  const next = Math.max(
                                    SERVICE_CONSTANTS.MIN_QUANTITY,
                                    current - 1
                                  );
                                  return { ...prev, [service._id]: next };
                                });
                              }}
                            >
                              -
                            </Button>
                            <span className="min-w-[20px] text-center text-sm font-medium">
                              {selectedServices[service._id] || 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServices((prev) => {
                                  const current = prev[service._id] || 1;
                                  if (current >= SERVICE_CONSTANTS.MAX_QUANTITY) {
                                    toast.error(SERVICE_MESSAGES.MAX_QUANTITY_EXCEEDED);
                                    return prev;
                                  }
                                  const next = current + 1;
                                  return { ...prev, [service._id]: next };
                                });
                              }}
                              disabled={(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY}
                            >
                              +
                            </Button>
                            {(selectedServices[service._id] || 1) >= SERVICE_CONSTANTS.MAX_QUANTITY && (
                              <span className="text-xs text-gray-500">{SERVICE_MESSAGES.QUANTITY_LIMIT_HINT}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirmAddServices}
            disabled={loading || Object.keys(selectedServices).length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Đang thêm...
              </>
            ) : (
              "Thêm dịch vụ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
