import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  User,
  Package,
  CreditCard,
  FileText,
  Plus,
  Loader2,
  Building2,
  Home,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { format } from "date-fns";
import BookingCalendar from "@/components/roomdetail/BookingCalendar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
interface Property {
  _id: string;
  name: string;
}

interface Listing {
  _id: string;
  title: string;
  price_per_night: number;
  max_guests: number;
  has_weekend_surcharge?: boolean;
  weekend_surcharge_percent?: number;
}

interface Guest {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  default_price: number;
  unit: string;
}

interface StaffBookingService {
  serviceId: string;
  quantity: number;
}

interface StaffCreateBookingForm {
  propertyId: string;
  listingId: string;
  guestId?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  infants: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  specialRequests?: string;
  voucherCode?: string;
  services: StaffBookingService[];
  note?: string;
  additionalCost: number;
  additionalCostReason?: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  deposit_paid_amount?: number;
  price_per_night?: number;
  final_amount?: number;
  skip_availability_check: boolean;
}

interface StaffBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const StaffBookingModal: React.FC<StaffBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<StaffCreateBookingForm>({
    propertyId: "",
    listingId: "",
    guestId: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    infants: 0,
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    specialRequests: "",
    voucherCode: "",
    services: [],
    note: "",
    additionalCost: 0,
    additionalCostReason: "",
    status: "confirmed",
    payment_status: "unpaid",
    payment_method: "cash",
    deposit_paid_amount: 0,
    price_per_night: undefined,
    final_amount: undefined,
    skip_availability_check: false,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [validVouchers, setValidVouchers] = useState<
    Array<{
      _id: string;
      code: string;
      discount_percent: number;
      is_active: boolean;
      isDeleted?: boolean;
      description?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [nights, setNights] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [guestSearchOpen, setGuestSearchOpen] = useState(false);
  const [guestSearchValue, setGuestSearchValue] = useState("");

  // Calendar states
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [bookedDatesLoading, setBookedDatesLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    description: "",
    confirmText: "Xác nhận",
    variant: "default" as "default" | "destructive",
  });

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      loadVouchersForStaff(); // Load vouchers using public API
      resetForm();
    }
  }, [isOpen]);

  // Debug guests data
  useEffect(() => {
    console.log("Guests state changed:", guests);
    console.log("Guests length:", guests.length);
    if (guests.length > 0) {
      console.log("First guest:", guests[0]);
      console.log("Guest fields:", Object.keys(guests[0]));
    }
  }, [guests]);

  // Debug search value
  useEffect(() => {
    if (guestSearchValue) {
      console.log("Search value changed:", guestSearchValue);
      const filteredGuests = guests.filter(
        (g) =>
          g.name?.toLowerCase().includes(guestSearchValue.toLowerCase()) ||
          g.email?.toLowerCase().includes(guestSearchValue.toLowerCase()) ||
          g.guest_name
            ?.toLowerCase()
            .includes(guestSearchValue.toLowerCase()) ||
          g.guest_email?.toLowerCase().includes(guestSearchValue.toLowerCase())
      );
      console.log("Filtered guests count:", filteredGuests.length);
      if (filteredGuests.length > 0) {
        console.log("First filtered guest:", filteredGuests[0]);
      }
    }
  }, [guestSearchValue, guests]);

  // Update formData when calendar dates change
  useEffect(() => {
    if (checkIn) {
      setFormData((prev) => ({
        ...prev,
        checkInDate: format(checkIn, "yyyy-MM-dd"),
      }));
    }
    if (checkOut) {
      setFormData((prev) => ({
        ...prev,
        checkOutDate: format(checkOut, "yyyy-MM-dd"),
      }));
    }
  }, [checkIn, checkOut]);

  // Load booked dates when listing changes
  useEffect(() => {
    console.log("useEffect - formData.listingId changed:", formData.listingId);
    if (formData.listingId) {
      console.log("Calling loadBookedDates for listing:", formData.listingId);
      loadBookedDates();
    } else {
      console.log("No listingId, clearing booked dates");
      setBookedDates([]);
      // Clear selected dates when no listing is selected
      setCheckIn(null);
      setCheckOut(null);
      setNights(0);
    }
  }, [formData.listingId]);

  // Calculate nights when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const nightsCount = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      setNights(nightsCount > 0 ? nightsCount : 0);
    }
  }, [checkIn, checkOut]);

  // Calculate price when relevant fields change
  useEffect(() => {
    if (selectedListing && nights > 0 && checkIn && checkOut) {
      const basePrice =
        formData.price_per_night || selectedListing.price_per_night;

      // Calculate weekend surcharge
      let weekendSurcharge = 0;
      if (
        selectedListing.has_weekend_surcharge &&
        selectedListing.weekend_surcharge_percent
      ) {
        const current = new Date(checkIn);
        while (current < checkOut) {
          const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Weekend
            weekendSurcharge +=
              basePrice * (selectedListing.weekend_surcharge_percent / 100);
          }
          current.setDate(current.getDate() + 1);
        }
      }

      const totalPrice = basePrice * nights + weekendSurcharge;

      // Calculate services total
      const servicesTotal = formData.services.reduce((sum, service) => {
        const serviceData = services.find((s) => s._id === service.serviceId);
        return sum + (serviceData?.default_price || 0) * service.quantity;
      }, 0);

      // Calculate additional costs
      const additionalCosts = formData.additionalCost || 0;

      // Calculate subtotal before voucher discount
      const subtotalBeforeDiscount =
        totalPrice + servicesTotal + additionalCosts;

      // Calculate voucher discount
      let voucherDiscount = 0;
      if (formData.voucherCode) {
        const selectedVoucher = validVouchers.find(
          (v) => v.code === formData.voucherCode
        );
        if (selectedVoucher && selectedVoucher.is_active) {
          voucherDiscount =
            subtotalBeforeDiscount * (selectedVoucher.discount_percent / 100);
        }
      }

      // Calculate final amount after voucher discount
      const subtotalAfterDiscount = subtotalBeforeDiscount - voucherDiscount;
      const serviceFee = subtotalAfterDiscount * 0.1; // 10%
      const tax = subtotalAfterDiscount * 0.08; // 8%
      const finalAmount = subtotalAfterDiscount + serviceFee + tax;

      setCalculatedPrice(finalAmount);
      // Cập nhật final_amount vào formData
      setFormData((prev) => ({ ...prev, final_amount: finalAmount }));
    }
  }, [
    selectedListing,
    nights,
    checkIn,
    checkOut,
    formData.services,
    formData.additionalCost,
    formData.price_per_night,
    formData.voucherCode,
    services,
    validVouchers,
  ]);

  const loadBookedDates = async () => {
    if (!formData.listingId) {
      setBookedDates([]);
      setBookedDatesLoading(false);
      return;
    }

    setBookedDatesLoading(true);
    try {
      console.log("Loading booked dates for listing:", formData.listingId);
      const res = await api.get(`/bookings/booked-dates/${formData.listingId}`);
      console.log("Booked dates API response:", res.data);

      const dates = res.data.data?.bookedDates || [];
      const bookedDatesArray = dates.map(
        (dateStr: string) => new Date(dateStr)
      );
      console.log("Parsed booked dates:", bookedDatesArray);

      setBookedDates(bookedDatesArray);

      // Validate current selected dates against new booked dates
      if (checkIn && checkOut) {
        const current = new Date(checkIn);
        let hasConflict = false;
        while (current <= checkOut) {
          if (
            dates.some(
              (dateStr: string) =>
                new Date(dateStr).toDateString() === current.toDateString()
            )
          ) {
            hasConflict = true;
            break;
          }
          current.setDate(current.getDate() + 1);
        }

        if (hasConflict) {
          // Clear conflicting dates
          setCheckIn(null);
          setCheckOut(null);
          setNights(0);
          toast.error("Ngày đã chọn không còn khả dụng, vui lòng chọn lại");
        }
      }
    } catch (error) {
      console.error("Error loading booked dates:", error);
      setBookedDates([]);
    } finally {
      setBookedDatesLoading(false);
    }
  };

  const loadGuests = async () => {
    // Load guests - thử nhiều endpoint khác nhau
    let guestsData = [];
    try {
      // Thử endpoint chính trước
      const guestsRes = await api.get("/users?role=guest");
      console.log("Guests API response:", guestsRes);
      console.log("Guests response.data:", guestsRes.data);
      console.log("Guests response.data.data:", guestsRes.data.data);

      // Parse dữ liệu guests
      if (
        guestsRes.data &&
        guestsRes.data.data &&
        guestsRes.data.data.data &&
        Array.isArray(guestsRes.data.data.data)
      ) {
        guestsData = guestsRes.data.data.data;
        console.log("Using guestsRes.data.data.data:", guestsData);
      } else if (
        guestsRes.data &&
        guestsRes.data.data &&
        Array.isArray(guestsRes.data.data)
      ) {
        guestsData = guestsRes.data.data;
        console.log("Using guestsRes.data.data:", guestsData);
      } else if (Array.isArray(guestsRes.data)) {
        guestsData = guestsRes.data;
        console.log("Using guestsRes.data");
      } else {
        console.log("Không tìm thấy mảng guests trong response chính");
      }
    } catch (guestsError) {
      console.error("Error loading guests from main endpoint:", guestsError);

      // Thử endpoint public nếu endpoint chính thất bại
      try {
        const publicGuestsRes = await api.get("/users/public?role=guest");
        console.log("Public guests API response:", publicGuestsRes);

        if (
          publicGuestsRes.data &&
          publicGuestsRes.data.data &&
          Array.isArray(publicGuestsRes.data.data)
        ) {
          guestsData = publicGuestsRes.data.data;
          console.log("Using publicGuestsRes.data.data:", guestsData);
        } else if (Array.isArray(publicGuestsRes.data)) {
          guestsData = publicGuestsRes.data;
          console.log("Using publicGuestsRes.data");
        }
      } catch (publicGuestsError) {
        console.error("Error loading public guests:", publicGuestsError);

        // Thử endpoint cuối cùng - tất cả users
        try {
          const allUsersRes = await api.get("/users");
          console.log("All users API response:", allUsersRes);

          if (
            allUsersRes.data &&
            allUsersRes.data.data &&
            Array.isArray(allUsersRes.data.data)
          ) {
            // Lọc chỉ lấy users có role guest
            guestsData = allUsersRes.data.data.filter(
              (user: { role?: string }) =>
                user.role === "guest" || user.role === "Guest"
            );
            console.log("Filtered guests from all users:", guestsData);
          } else if (Array.isArray(allUsersRes.data)) {
            guestsData = allUsersRes.data.filter(
              (user: { role?: string }) =>
                user.role === "guest" || user.role === "Guest"
            );
            console.log("Filtered guests from all users (direct):", guestsData);
          }
        } catch (allUsersError) {
          console.error("Error loading all users:", allUsersError);
        }
      }
    }

    // Thêm debug info
    console.log("Final guests data set:", guestsData);
    console.log("Guests count:", guestsData.length);
    if (guestsData.length > 0) {
      console.log("Sample guest:", guestsData[0]);
      console.log("Guest fields:", Object.keys(guestsData[0]));
      console.log("Guest name field:", guestsData[0].name);
      console.log("Guest email field:", guestsData[0].email);
    }

    setGuests(guestsData);
    return guestsData;
  };

  // Load vouchers using valid/public API for staff
  const loadVouchersForStaff = async () => {
    try {
      const response = await api.get("/vouchers/valid");
      console.log("Valid vouchers response:", response);

      if (response.data && response.data.data && response.data.data.data) {
        setValidVouchers(response.data.data.data);
        console.log("Valid vouchers loaded:", response.data.data.data);
      } else if (response.data && response.data.data) {
        setValidVouchers(response.data.data);
        console.log("Valid vouchers loaded:", response.data.data);
      }
    } catch (error) {
      console.error("Error loading valid vouchers:", error);
      setValidVouchers([]);
      // Fallback: continue without vouchers
    }
  };

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      // Load properties - thử nhiều endpoint khác nhau
      let propertiesData = [];
      try {
        const propertiesRes = await api.get("/properties");
        console.log("Properties API response:", propertiesRes);
        console.log("Properties response.data:", propertiesRes.data);
        console.log("Properties response.data.data:", propertiesRes.data.data);

        // Parse dữ liệu properties
        if (
          propertiesRes.data &&
          propertiesRes.data.data &&
          propertiesRes.data.data.data
        ) {
          propertiesData = propertiesRes.data.data.data;
          console.log("Using propertiesRes.data.data.data:", propertiesData);
          console.log("Properties count:", propertiesData.length);
        } else if (propertiesRes.data && propertiesRes.data.data) {
          propertiesData = propertiesRes.data.data;
          console.log("Using propertiesRes.data.data:", propertiesData);
          console.log("Properties count:", propertiesData.length);
        } else if (Array.isArray(propertiesRes.data)) {
          propertiesData = propertiesRes.data;
          console.log("Using propertiesRes.data");
        } else {
          console.log("Không tìm thấy mảng properties trong response");
          propertiesData = [];
        }
      } catch (propError) {
        console.error("Error loading properties:", propError);
        // Thử endpoint public nếu endpoint chính thất bại
        try {
          const publicPropertiesRes = await api.get("/properties/public");
          console.log("Public properties API response:", publicPropertiesRes);
          propertiesData = Array.isArray(publicPropertiesRes.data.data)
            ? publicPropertiesRes.data.data
            : Array.isArray(publicPropertiesRes.data)
            ? publicPropertiesRes.data
            : [];
        } catch (publicError) {
          console.error("Error loading public properties:", publicError);
        }
      }
      setProperties(propertiesData);
      console.log("Final properties data set:", propertiesData);

      // Load guests
      await loadGuests();

      // Load services
      const servicesRes = await api.get("/services/active");
      console.log("Services API response:", servicesRes);
      setServices(
        Array.isArray(servicesRes.data.data) ? servicesRes.data.data : []
      );
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Không thể tải dữ liệu ban đầu");
    } finally {
      setDataLoading(false);
    }
  };

  const loadListings = async (propertyId: string) => {
    try {
      // Sử dụng endpoint /listings với query parameter propertyId
      const res = await api.get(`/listings?propertyId=${propertyId}`);
      console.log("Listings API response:", res);
      console.log("Listings response.data:", res.data);
      console.log("Listings response.data.data:", res.data.data);

      let listingsData = [];
      if (res.data && res.data.data && res.data.data.listings) {
        listingsData = res.data.data.listings;
        console.log("Using res.data.data.listings:", listingsData);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        listingsData = res.data.data;
        console.log("Using res.data.data:", listingsData);
      } else if (res.data && res.data.listings) {
        listingsData = res.data.listings;
        console.log("Using res.data.listings:", listingsData);
      } else if (Array.isArray(res.data)) {
        listingsData = res.data;
        console.log("Using res.data");
      } else {
        console.log("Không tìm thấy mảng listings trong response");
        listingsData = [];
      }

      setListings(listingsData);
      console.log("Final listings data set:", listingsData);
    } catch (error) {
      console.error("Error loading listings:", error);
      toast.error("Không thể tải danh sách listing");
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: "",
      listingId: "",
      guestId: "",
      checkInDate: "",
      checkOutDate: "",
      guests: 1,
      infants: 0,
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      specialRequests: "",
      voucherCode: "",
      services: [],
      note: "",
      additionalCost: 0,
      additionalCostReason: "",
      status: "confirmed",
      payment_status: "unpaid",
      payment_method: "cash",
      deposit_paid_amount: 0,
      price_per_night: undefined,
      final_amount: undefined,
      skip_availability_check: false,
    });
    setSelectedListing(null);
    setNights(0);
    setCalculatedPrice(0);
    setCheckIn(null);
    setCheckOut(null);
    setBookedDates([]);
  };

  const handlePropertyChange = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, propertyId, listingId: "" }));
    setSelectedListing(null);
    setBookedDates([]);
    if (propertyId) {
      loadListings(propertyId);
    } else {
      setListings([]);
    }
  };

  const handleListingChange = (listingId: string) => {
    console.log("handleListingChange called with listingId:", listingId);
    const listing = listings.find((l) => l._id === listingId);
    console.log("Found listing:", listing);
    setSelectedListing(listing || null);
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        listingId,
        price_per_night: listing?.price_per_night,
      };
      console.log("Updated formData:", newFormData);
      return newFormData;
    });
    // Clear booked dates when listing changes - will be reloaded by useEffect
    setBookedDates([]);
  };

  const handleGuestChange = (guestId: string) => {
    if (guestId === "__new__") {
      setFormData((prev) => ({
        ...prev,
        guestId: "__new__", // Giữ "__new__" để biết đang ở chế độ nhập mới
        guest_name: "",
        guest_email: "",
        guest_phone: "",
      }));
    } else {
      const guest = guests.find((g) => g._id === guestId);
      setFormData((prev) => ({
        ...prev,
        guestId,
        guest_name: guest?.name || guest?.guest_name || "",
        guest_email: guest?.email || guest?.guest_email || "",
        guest_phone: guest?.phone || "",
      }));
    }
  };

  const showConfirm = (
    title: string,
    description: string,
    action: () => void,
    confirmText = "Xác nhận",
    variant: "default" | "destructive" = "default"
  ) => {
    setConfirmConfig({ title, description, confirmText, variant });
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.propertyId) {
      toast.error("Vui lòng chọn property");
      return;
    }
    if (!formData.listingId) {
      toast.error("Vui lòng chọn listing");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày check-in và check-out");
      return;
    }
    if (!formData.guest_name || !formData.guest_email) {
      toast.error("Vui lòng nhập thông tin khách hàng");
      return;
    }

    // Nếu chọn "Nhập thông tin mới", đảm bảo có đầy đủ thông tin
    if (
      formData.guestId === "__new__" &&
      (!formData.guest_name || !formData.guest_email)
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng mới");
      return;
    }
    if (formData.guests < 1) {
      toast.error("Số khách phải lớn hơn 0");
      return;
    }

    const submitBooking = async () => {
      setLoading(true);
      try {
        // Tạo payload và loại bỏ guestId nếu rỗng
        const payload = { ...formData };
        if (!payload.guestId || payload.guestId.trim() === "") {
          delete payload.guestId;
        }

        // Xóa các field rỗng để tránh validation issues
        if (!payload.specialRequests || payload.specialRequests.trim() === "") {
          delete payload.specialRequests;
        }
        if (!payload.voucherCode || payload.voucherCode.trim() === "") {
          delete payload.voucherCode;
        }
        if (!payload.note || payload.note.trim() === "") {
          delete payload.note;
        }
        if (
          !payload.additionalCostReason ||
          payload.additionalCostReason.trim() === ""
        ) {
          delete payload.additionalCostReason;
        }
        if (!payload.guest_phone || payload.guest_phone.trim() === "") {
          delete payload.guest_phone;
        }

        // Đảm bảo deposit_paid_amount được set đúng dựa trên payment_status
        const finalAmount = payload.final_amount || 0;
        if (payload.payment_status === "paid") {
          payload.deposit_paid_amount = finalAmount;
        } else if (payload.payment_status === "partially_paid") {
          // Nếu thanh toán một phần, cần có logic để tính số tiền đã thanh toán
          // Hiện tại set mặc định là 50% của final_amount
          payload.deposit_paid_amount = Math.round(finalAmount * 0.5);
        } else {
          // unpaid hoặc các trạng thái khác
          payload.deposit_paid_amount = 0;
        }

        console.log("Sending payload:", JSON.stringify(payload, null, 2));
        const bookingResponse = await api.post(
          "/bookings/staff/create",
          payload
        );
        const bookingId =
          bookingResponse.data?.data?._id || bookingResponse.data?._id;

        toast.success("Tạo booking thành công!");

        // Nếu chọn VNPay, tự động tạo payment URL và redirect
        if (
          payload.payment_method === "vnpay" &&
          bookingId &&
          payload.propertyId
        ) {
          try {
            console.log("Creating VNPay payment for booking:", bookingId);
            const paymentResponse = await api.post(
              `/bookings/${payload.propertyId}/${bookingId}/payment/remaining/staff`,
              {
                paymentMethod: "vnpay",
                returnUrl: `${window.location.origin}/admin/bookings?payment=success&bookingId=${bookingId}`,
                cancelUrl: `${window.location.origin}/admin/bookings?payment=cancel&bookingId=${bookingId}`,
                note: "Admin tạo booking với VNPay",
              }
            );

            const paymentUrl =
              paymentResponse.data?.data?.paymentUrl ||
              paymentResponse.data?.paymentUrl;
            if (paymentUrl) {
              console.log("Redirecting to VNPay:", paymentUrl);
              onSuccess(); // Gọi trước khi redirect
              onClose();
              // Redirect đến VNPay
              window.location.href = paymentUrl;
              return;
            } else {
              console.error("No payment URL received:", paymentResponse.data);
              toast.error("Không nhận được link thanh toán VNPay");
            }
          } catch (paymentError) {
            console.error("Error creating VNPay payment:", paymentError);
            toast.error("Lỗi tạo thanh toán VNPay, vui lòng thử lại");
          }
        }

        onSuccess();
        onClose();
      } catch (error: unknown) {
        console.error("Error creating booking:", error);

        let errorMessage = "Có lỗi xảy ra khi tạo booking";

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              data?: {
                error?: string;
                message?: string;
              };
            };
            message?: string;
          };

          console.error("Error response:", axiosError.response);
          console.error("Error response data:", axiosError.response?.data);

          errorMessage =
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            axiosError.message ||
            errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    showConfirm(
      "Xác nhận tạo booking",
      `Bạn có chắc chắn muốn tạo booking cho khách hàng "${
        formData.guest_name
      }" từ ${format(checkIn!, "dd/MM/yyyy")} đến ${format(
        checkOut!,
        "dd/MM/yyyy"
      )}?`,
      submitBooking,
      "Tạo booking"
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="!max-w-[95vw] !w-[1400px] max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl mx-0 p-0">
          <DialogHeader className="text-center pb-4 px-8 pt-6 bg-gray-50 border-b border-gray-200">
            <div className="mx-auto w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Tạo Booking cho Nhân viên
            </DialogTitle>
            <p className="text-gray-600 mt-1 text-sm">
              Quản lý đặt phòng và dịch vụ cho khách hàng
            </p>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Property and Listing Selection */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  Chọn HomeStay và Phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="property"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Home className="w-4 h-4 text-gray-500" />
                      HomeStay *
                    </Label>
                    <Select
                      value={formData.propertyId}
                      onValueChange={handlePropertyChange}
                      disabled={dataLoading}
                    >
                      <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400  focus:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Chọn homestay" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                        {Array.isArray(properties) &&
                          properties.map((property) => (
                            <SelectItem
                              key={property._id}
                              value={property._id}
                              className="rounded-lg py-3 px-4 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-800"
                            >
                              {property.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="listing"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Star className="w-4 h-4 text-gray-500" />
                      Phòng *
                    </Label>
                    <Select
                      value={formData.listingId}
                      onValueChange={handleListingChange}
                      disabled={!formData.propertyId || dataLoading}
                    >
                      <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Chọn phòng" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                        {Array.isArray(listings) &&
                          listings.map((listing) => (
                            <SelectItem
                              key={listing._id}
                              value={listing._id}
                              className="rounded-lg py-3 px-4 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-800"
                            >
                              {listing.title} -{" "}
                              <span className="font-medium text-gray-600">
                                {listing.price_per_night?.toLocaleString()}{" "}
                                VND/đêm
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedListing && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {selectedListing.title}
                        </h3>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        <Users className="w-3 h-3 mr-1" />
                        Tối đa {selectedListing.max_guests} khách
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <div>
                          <span className="text-xs text-gray-600">
                            Giá theo đêm
                          </span>
                          <p className="font-semibold text-base text-gray-800">
                            {selectedListing.price_per_night?.toLocaleString()}{" "}
                            VND
                          </p>
                        </div>
                      </div>
                      {selectedListing.has_weekend_surcharge && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <div>
                            <span className="text-xs text-gray-600">
                              Phụ thu cuối tuần
                            </span>
                            <p className="font-semibold text-base text-gray-800">
                              {selectedListing.weekend_surcharge_percent}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  Thông tin Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Tìm Guest hoặc nhập mới
                  </Label>
                  <Popover
                    open={guestSearchOpen}
                    onOpenChange={setGuestSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={guestSearchOpen}
                        className="w-full h-16 justify-between border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all duration-300 rounded-2xl text-left font-normal bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 shadow-lg hover:shadow-xl hover:scale-[1.02] group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            {(() => {
                              // Nếu có guestId và không phải là "__new__" → lấy theo ID
                              if (
                                formData.guestId &&
                                formData.guestId !== "__new__"
                              ) {
                                const selectedGuest = guests.find(
                                  (guest) => guest._id === formData.guestId
                                );
                                const guestName =
                                  selectedGuest?.name ||
                                  selectedGuest?.guest_name;
                                const guestEmail =
                                  selectedGuest?.email ||
                                  selectedGuest?.guest_email;
                                return (
                                  <>
                                    <div className="font-semibold text-gray-800 text-base">
                                      {guestName}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                      {guestEmail}
                                    </div>
                                  </>
                                );
                              }

                              // Nếu có thông tin guest từ form (bao gồm cả khi guestId === "__new__") → hiển thị theo form data
                              console.log("=== GUEST DISPLAY DEBUG ===");
                              console.log(
                                "formData.guestId:",
                                formData.guestId
                              );
                              console.log(
                                "formData.guest_name:",
                                formData.guest_name
                              );
                              console.log(
                                "formData.guest_email:",
                                formData.guest_email
                              );
                              console.log(
                                "formData.guest_phone:",
                                formData.guest_phone
                              );

                              if (
                                formData.guest_name ||
                                formData.guest_email ||
                                formData.guest_phone
                              ) {
                                return (
                                  <>
                                    <div className="font-semibold text-gray-800 text-base">
                                      {formData.guest_name || "Chưa có tên"}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                                      {formData.guest_email || "Chưa có email"}
                                    </div>
                                    {formData.guest_phone && (
                                      <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                        {formData.guest_phone}
                                      </div>
                                    )}
                                  </>
                                );
                              }

                              // Mặc định → hiển thị placeholder
                              return (
                                <>
                                  <div className="font-semibold text-gray-700 text-base">
                                    Tìm guest hoặc nhập thông tin mới
                                  </div>
                                  <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    Click để tìm kiếm hoặc tạo mới
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {(() => {
                            // Hiển thị badge "Đã chọn" cho cả hai trường hợp
                            if (
                              formData.guestId &&
                              formData.guestId !== "__new__"
                            ) {
                              return (
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                  Đã chọn (ID)
                                </div>
                              );
                            }
                            if (
                              formData.guest_name ||
                              formData.guest_email ||
                              formData.guest_phone
                            ) {
                              return (
                                <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                                  Đã chọn (Form)
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                            <ChevronDown
                              className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-all duration-300 ${
                                guestSearchOpen ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[1250px] p-0 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                      <Command className="rounded-2xl">
                        <div className="p-5  border-gray-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"></div>
                            <CommandInput
                              placeholder="Tìm kiếm guest theo tên hoặc email..."
                              value={guestSearchValue}
                              onValueChange={setGuestSearchValue}
                              className="h-10 pl-12 pr-4 border-0 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 text-base placeholder:text-gray-400"
                            />
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span>Gõ để tìm kiếm nhanh</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await loadGuests();
                                    toast.success(
                                      "Đã tải lại danh sách guests"
                                    );
                                  } catch {
                                    toast.error(
                                      "Không thể tải lại danh sách guests"
                                    );
                                  }
                                }}
                                className="h-6 px-2 text-xs bg-white/80 hover:bg-white border-gray-300 hover:border-blue-400"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Tải lại
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log("=== DEBUG GUESTS ===");
                                  console.log("Guests array:", guests);
                                  console.log("Guests length:", guests.length);
                                  console.log(
                                    "Search value:",
                                    guestSearchValue
                                  );
                                  if (guests.length > 0) {
                                    console.log("First guest:", guests[0]);
                                    console.log("Guest name:", guests[0].name);
                                    console.log(
                                      "Guest email:",
                                      guests[0].email
                                    );
                                  }
                                  toast.info(
                                    `Có ${guests.length} guests trong danh sách`
                                  );
                                }}
                                className="h-6 px-2 text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-300 hover:border-yellow-400 text-yellow-700"
                              >
                                Debug
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CommandList
                          className="max-h-96 p-2"
                          onWheel={(e) => {
                            // Cho phép scroll event lan truyền lên parent để cuộn trang
                            e.stopPropagation();
                            const container = e.currentTarget;
                            const { scrollTop, scrollHeight, clientHeight } =
                              container;

                            // Nếu đã scroll đến đầu hoặc cuối của dropdown
                            if (
                              (e.deltaY < 0 && scrollTop <= 0) ||
                              (e.deltaY > 0 &&
                                scrollTop + clientHeight >= scrollHeight)
                            ) {
                              // Cho phép scroll event lan truyền lên để cuộn trang
                              e.stopPropagation();
                              // Tạo một wheel event mới để cuộn trang
                              const wheelEvent = new WheelEvent("wheel", {
                                deltaY: e.deltaY,
                                deltaMode: e.deltaMode,
                                bubbles: true,
                              });
                              document.dispatchEvent(wheelEvent);
                            }
                          }}
                        >
                          {(() => {
                            const filteredGuests = guests.filter(
                              (g) =>
                                g.name
                                  ?.toLowerCase()
                                  .includes(guestSearchValue.toLowerCase()) ||
                                g.email
                                  ?.toLowerCase()
                                  .includes(guestSearchValue.toLowerCase()) ||
                                g.guest_name
                                  ?.toLowerCase()
                                  .includes(guestSearchValue.toLowerCase()) ||
                                g.guest_email
                                  ?.toLowerCase()
                                  .includes(guestSearchValue.toLowerCase())
                            );

                            // Debug logs
                            console.log("=== SEARCH DEBUG ===");
                            console.log("guestSearchValue:", guestSearchValue);
                            console.log("guests length:", guests.length);
                            console.log(
                              "filteredGuests length:",
                              filteredGuests.length
                            );
                            if (filteredGuests.length > 0) {
                              console.log(
                                "First filtered guest:",
                                filteredGuests[0]
                              );
                            }

                            // Nếu không có kết quả tìm kiếm và có search value
                            if (
                              filteredGuests.length === 0 &&
                              guestSearchValue
                            ) {
                              return (
                                <CommandEmpty>
                                  <div className="p-8 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                      <User className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                      Không tìm thấy guest nào
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6">
                                      Hãy thử tìm kiếm với từ khóa khác hoặc tạo
                                      guest mới
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105"
                                      onClick={() => {
                                        handleGuestChange("__new__");
                                        setGuestSearchOpen(false);
                                        setGuestSearchValue("");
                                      }}
                                    >
                                      <Plus className="w-5 h-5 mr-2" />
                                      Tạo Guest Mới
                                    </Button>
                                  </div>
                                </CommandEmpty>
                              );
                            }

                            // Nếu có kết quả tìm kiếm, hiển thị cả "Tạo mới" và guests
                            console.log(
                              "Will show guests section, filteredGuests.length:",
                              filteredGuests.length
                            );
                            return (
                              <>
                                {/* Tùy chọn tạo guest mới - luôn hiển thị */}
                                <CommandItem
                                  key="__new__"
                                  value="__new__"
                                  onSelect={() => {
                                    handleGuestChange("__new__");
                                    setGuestSearchOpen(false);
                                    setGuestSearchValue("");
                                  }}
                                  className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 p-5 mx-1 my-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-lg group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                                      <Plus className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-bold text-gray-800 text-lg mb-1">
                                        Nhập thông tin mới
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Tạo booking cho guest mới với thông tin
                                        chi tiết
                                      </div>
                                    </div>
                                    <div className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-full font-bold shadow-lg">
                                      Mới
                                    </div>
                                  </div>
                                </CommandItem>

                                {/* Guest có sẵn - chỉ hiển thị khi có kết quả tìm kiếm */}
                                {filteredGuests.length > 0 &&
                                  filteredGuests.map((guest) => (
                                    <CommandItem
                                      key={guest._id}
                                      value={guest._id}
                                      onSelect={() => {
                                        handleGuestChange(guest._id);
                                        setGuestSearchOpen(false);
                                        setGuestSearchValue("");
                                      }}
                                      className="rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 p-5 mx-1 my-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-200 hover:shadow-lg group"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                                          <User className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-bold text-gray-800 text-lg mb-1">
                                            {guest.name || guest.guest_name}
                                          </div>
                                          <div className="text-sm text-gray-500 mb-2">
                                            {guest.email || guest.guest_email}
                                          </div>
                                          {(guest.phone ||
                                            guest.guest_phone) && (
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                              {guest.phone || guest.guest_phone}
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full font-bold shadow-lg">
                                          Có sẵn
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </>
                            );
                          })()}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tên khách hàng *
                    </Label>
                    <Input
                      id="guest_name"
                      value={formData.guest_name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          guest_name: e.target.value,
                        }))
                      }
                      placeholder="Nhập tên khách hàng"
                      className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email *
                    </Label>
                    <Input
                      id="guest_email"
                      type="email"
                      value={formData.guest_email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          guest_email: e.target.value,
                        }))
                      }
                      placeholder="email@example.com"
                      className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="guest_phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Số điện thoại
                    </Label>
                    <Input
                      id="guest_phone"
                      value={formData.guest_phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          guest_phone: e.target.value,
                        }))
                      }
                      placeholder="0123456789"
                      className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Chi tiết Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600" />
                      Chọn ngày check-in và check-out *
                    </Label>
                    <div className="relative border-none p-8">
                      <div className="absolute inset-4  rounded-lg "></div>
                      <div className="relative z-10 p-4">
                        {bookedDatesLoading && (
                          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang tải thông tin ngày đã đặt...
                            </p>
                          </div>
                        )}
                        <BookingCalendar
                          checkIn={checkIn}
                          checkOut={checkOut}
                          setCheckIn={setCheckIn}
                          setCheckOut={setCheckOut}
                          setNights={setNights}
                          bookedDates={bookedDates}
                          dateOpen={dateOpen}
                          setDateOpen={setDateOpen}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="guests"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-gray-600" />
                        Số khách * (Tối đa: {selectedListing?.max_guests || 10})
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={selectedListing?.max_guests || 10}
                        value={formData.guests}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const maxGuests = selectedListing?.max_guests || 10;

                          if (value > maxGuests) {
                            toast.error(
                              `Số khách không được vượt quá ${maxGuests} người`
                            );
                            return;
                          }

                          setFormData((prev) => ({
                            ...prev,
                            guests: value,
                          }));
                        }}
                        className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                      />
                      {formData.guests >
                        (selectedListing?.max_guests || 10) && (
                        <p className="text-sm text-red-600">
                          Số khách vượt quá giới hạn cho phép (
                          {selectedListing?.max_guests || 10} người)
                        </p>
                      )}
                    </div>

                    {/* <div className="space-y-2">
                    <Label htmlFor="infants" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      Số trẻ em
                    </Label>
                    <Input
                      id="infants"
                      type="number"
                      min="0"
                      value={formData.infants}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          infants: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                    />
                  </div> */}
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-lg text-gray-800">
                            Thời gian lưu trú
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Số đêm khách hàng sẽ ở lại
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 border-gray-300 px-4 py-2 rounded-full text-lg font-bold"
                      >
                        {nights} đêm
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="specialRequests"
                    className="text-sm font-medium text-gray-700"
                  >
                    Yêu cầu đặc biệt
                  </Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialRequests: e.target.value,
                      }))
                    }
                    placeholder="Nhập yêu cầu đặc biệt của khách hàng..."
                    rows={3}
                    className="border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                  Dịch vụ bổ sung
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Available Services List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      Dịch vụ kèm theo
                    </Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all-services"
                        checked={
                          formData.services.length === services.length &&
                          services.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Select all services
                            const allServices = services.map((service) => ({
                              serviceId: service._id,
                              quantity: 1,
                            }));
                            setFormData((prev) => ({
                              ...prev,
                              services: allServices,
                            }));
                          } else {
                            // Deselect all services
                            setFormData((prev) => ({ ...prev, services: [] }));
                          }
                        }}
                        className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          formData.services.length === services.length &&
                          services.length > 0
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      <Label
                        htmlFor="select-all-services"
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        Chọn tất cả
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                    {Array.isArray(services) &&
                      services.map((service) => {
                        const existingService = formData.services.find(
                          (s) => s.serviceId === service._id
                        );
                        const isSelected = !!existingService;

                        return (
                          <div
                            key={service._id}
                            className={`flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0 ${
                              isSelected
                                ? "bg-red-50 border-l-4 border-l-red-500"
                                : "bg-white"
                            }`}
                          >
                            {/* Service Icon */}
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-gray-600" />
                            </div>

                            {/* Service Info */}
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {service.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Dịch vụ bổ sung
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="font-medium text-red-600">
                                {service.default_price?.toLocaleString()}₫
                              </div>
                            </div>

                            {/* Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Add service
                                  setFormData((prev) => ({
                                    ...prev,
                                    services: [
                                      ...prev.services,
                                      { serviceId: service._id, quantity: 1 },
                                    ],
                                  }));
                                } else {
                                  // Remove service
                                  const newServices = formData.services.filter(
                                    (s) => s.serviceId !== service._id
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    services: newServices,
                                  }));
                                }
                              }}
                              className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                isSelected
                                  ? "bg-red-500 border-red-500 text-white"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="voucherCode"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mã voucher
                  </Label>
                  <Select
                    value={formData.voucherCode || "none"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        voucherCode: value === "none" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg">
                      <SelectValue placeholder="Chọn mã voucher..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                      <SelectItem
                        value="none"
                        className="rounded-lg py-3 px-4 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-800"
                      >
                        Không sử dụng voucher
                      </SelectItem>
                      {Array.isArray(validVouchers) &&
                        validVouchers
                          .filter(
                            (voucher) => voucher.is_active && !voucher.isDeleted
                          )
                          .map((voucher) => (
                            <SelectItem
                              key={voucher._id}
                              value={voucher.code}
                              className="rounded-lg py-3 px-4 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-purple-100 data-[state=checked]:text-purple-800"
                            >
                              {voucher.code} - Giảm {voucher.discount_percent}%
                              {voucher.description &&
                                ` - ${voucher.description}`}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Additional Costs */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  Tính giá và Chi phí bổ sung
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label
                      htmlFor="price_per_night"
                      className="text-sm font-medium text-gray-700"
                    >
                    Giá theo đêm (tùy chỉnh)
                  </Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    min="0"
                    value={formData.price_per_night || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price_per_night: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder={
                      selectedListing?.price_per_night?.toString() ||
                      "Giá mặc định"
                    }
                    className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                  />
                </div>


              </div> */}

                {/* <div className="space-y-2">
                <Label htmlFor="additionalCost" className="text-sm font-medium text-gray-700">
                    Chi phí bổ sung
                  </Label>
                  <Input
                    id="additionalCost"
                    type="number"
                    min="0"
                    value={formData.additionalCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        additionalCost: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                  />
              </div> */}

                {/* <div className="space-y-2">
                <Label htmlFor="additionalCostReason" className="text-sm font-medium text-gray-700">
                  Lý do chi phí bổ sung
                </Label>
                <Input
                  id="additionalCostReason"
                  value={formData.additionalCostReason}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalCostReason: e.target.value,
                    }))
                  }
                  placeholder="Giải thích lý do chi phí bổ sung..."
                  className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg"
                />
              </div> */}

                {(calculatedPrice > 0 || (selectedListing && nights > 0)) && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-xl text-gray-800">
                            Tổng tiền ước tính
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Chi tiết các khoản phí
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                          {(calculatedPrice || 0).toLocaleString()}
                        </span>
                        <p className="text-base text-gray-600 font-medium">
                          VND
                        </p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 text-sm bg-white rounded-lg border border-gray-100 p-4">
                      <div className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
                        Chi tiết thanh toán
                      </div>

                      {/* Giá phòng cơ bản */}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">
                          Giá phòng ({nights || 0} đêm)
                        </span>
                        <span className="font-medium text-gray-800">
                          {selectedListing
                            ? (
                                (formData.price_per_night ||
                                  selectedListing.price_per_night) *
                                (nights || 0)
                              ).toLocaleString()
                            : "0"}
                          ₫
                        </span>
                      </div>

                      {/* Phí cuối tuần */}
                      {selectedListing?.has_weekend_surcharge &&
                        selectedListing.weekend_surcharge_percent &&
                        checkIn &&
                        checkOut &&
                        (() => {
                          let weekendNights = 0;
                          const current = new Date(checkIn);
                          while (current < checkOut) {
                            const dayOfWeek = current.getDay();
                            if (dayOfWeek === 0 || dayOfWeek === 6)
                              weekendNights++;
                            current.setDate(current.getDate() + 1);
                          }
                          const weekendSurcharge =
                            weekendNights > 0
                              ? (formData.price_per_night ||
                                  selectedListing.price_per_night) *
                                weekendNights *
                                (selectedListing.weekend_surcharge_percent! /
                                  100)
                              : 0;

                          return weekendNights > 0 ? (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">
                                Phí cuối tuần ({weekendNights} đêm -{" "}
                                {selectedListing.weekend_surcharge_percent}%)
                              </span>
                              <span className="font-medium text-orange-600">
                                +{weekendSurcharge.toLocaleString()}₫
                              </span>
                            </div>
                          ) : null;
                        })()}

                      {/* Dịch vụ bổ sung */}
                      {formData.services.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 font-medium">
                              Dịch vụ bổ sung
                            </span>
                            <span className="font-medium text-blue-600">
                              +
                              {formData.services
                                .reduce((sum, service) => {
                                  const serviceData = services.find(
                                    (s) => s._id === service.serviceId
                                  );
                                  return (
                                    sum +
                                    (serviceData?.default_price || 0) *
                                      service.quantity
                                  );
                                }, 0)
                                .toLocaleString()}
                              ₫
                            </span>
                          </div>

                          {/* Chi tiết dịch vụ */}
                          <div className="ml-4 space-y-1 bg-gray-50 rounded-lg p-3">
                            {formData.services.map((service, index) => {
                              const serviceData = services.find(
                                (s) => s._id === service.serviceId
                              );
                              if (!serviceData) return null;
                              return (
                                <div
                                  key={index}
                                  className="flex justify-between items-center text-xs text-gray-600"
                                >
                                  <span>
                                    • {serviceData.name} (x{service.quantity})
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      serviceData.default_price *
                                      service.quantity
                                    ).toLocaleString()}
                                    ₫
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Voucher giảm giá */}
                      {formData.voucherCode &&
                        (() => {
                          const selectedVoucher = validVouchers.find(
                            (v) => v.code === formData.voucherCode
                          );
                          if (!selectedVoucher) return null;

                          // Tính subtotal trước khi áp dụng voucher
                          const basePrice = selectedListing
                            ? (formData.price_per_night ||
                                selectedListing.price_per_night) * nights
                            : 0;

                          const weekendSurcharge =
                            selectedListing?.has_weekend_surcharge &&
                            selectedListing.weekend_surcharge_percent &&
                            checkIn &&
                            checkOut
                              ? (() => {
                                  let weekendNights = 0;
                                  const current = new Date(checkIn);
                                  while (current < checkOut) {
                                    const dayOfWeek = current.getDay();
                                    if (dayOfWeek === 0 || dayOfWeek === 6)
                                      weekendNights++;
                                    current.setDate(current.getDate() + 1);
                                  }
                                  return weekendNights > 0
                                    ? (formData.price_per_night ||
                                        selectedListing.price_per_night) *
                                        weekendNights *
                                        (selectedListing.weekend_surcharge_percent! /
                                          100)
                                    : 0;
                                })()
                              : 0;

                          const servicesTotal = formData.services.reduce(
                            (sum, service) => {
                              const serviceData = services.find(
                                (s) => s._id === service.serviceId
                              );
                              return (
                                sum +
                                (serviceData?.default_price || 0) *
                                  service.quantity
                              );
                            },
                            0
                          );

                          const subtotal =
                            basePrice +
                            weekendSurcharge +
                            servicesTotal +
                            formData.additionalCost;
                          const discountAmount =
                            subtotal * (selectedVoucher.discount_percent / 100);

                          return (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600">
                                Giảm giá ({formData.voucherCode} -{" "}
                                {selectedVoucher.discount_percent}%)
                              </span>
                              <span className="font-medium text-green-600">
                                -{discountAmount.toLocaleString()}₫
                              </span>
                            </div>
                          );
                        })()}

                      {/* Chi phí phát sinh */}
                      <div className="flex justify-between items-center py-2">
                        <div>
                          <span className="text-gray-600">
                            Chi phí phát sinh
                          </span>
                          {formData.additionalCostReason && (
                            <div className="text-xs text-gray-500 mt-1">
                              ({formData.additionalCostReason})
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-orange-600">
                          {formData.additionalCost > 0 ? "+" : ""}
                          {(formData.additionalCost || 0).toLocaleString()}₫
                        </span>
                      </div>

                      {/* Phân cách */}
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        {/* Tạm tính */}
                        {(() => {
                          const basePrice = selectedListing
                            ? (formData.price_per_night ||
                                selectedListing.price_per_night) * nights
                            : 0;

                          const weekendSurcharge =
                            selectedListing?.has_weekend_surcharge &&
                            selectedListing.weekend_surcharge_percent &&
                            checkIn &&
                            checkOut
                              ? (() => {
                                  let weekendNights = 0;
                                  const current = new Date(checkIn);
                                  while (current < checkOut) {
                                    const dayOfWeek = current.getDay();
                                    if (dayOfWeek === 0 || dayOfWeek === 6)
                                      weekendNights++;
                                    current.setDate(current.getDate() + 1);
                                  }
                                  return weekendNights > 0
                                    ? (formData.price_per_night ||
                                        selectedListing.price_per_night) *
                                        weekendNights *
                                        (selectedListing.weekend_surcharge_percent! /
                                          100)
                                    : 0;
                                })()
                              : 0;

                          const servicesTotal = formData.services.reduce(
                            (sum, service) => {
                              const serviceData = services.find(
                                (s) => s._id === service.serviceId
                              );
                              return (
                                sum +
                                (serviceData?.default_price || 0) *
                                  service.quantity
                              );
                            },
                            0
                          );

                          const subtotal =
                            basePrice +
                            weekendSurcharge +
                            servicesTotal +
                            formData.additionalCost;

                          const selectedVoucher = validVouchers.find(
                            (v) => v.code === formData.voucherCode
                          );
                          const discountAmount = selectedVoucher
                            ? subtotal *
                              (selectedVoucher.discount_percent / 100)
                            : 0;

                          const amountAfterDiscount = subtotal - discountAmount;
                          const serviceFee = amountAfterDiscount * 0.1;
                          const taxAmount = amountAfterDiscount * 0.08;

                          return (
                            <>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 font-medium">
                                  Tạm tính
                                </span>
                                <span className="font-medium text-gray-800">
                                  {amountAfterDiscount.toLocaleString()}₫
                                </span>
                              </div>

                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">
                                  Phí dịch vụ (10%)
                                </span>
                                <span className="font-medium text-gray-600">
                                  +{serviceFee.toLocaleString()}₫
                                </span>
                              </div>

                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">
                                  Thuế VAT (8%)
                                </span>
                                <span className="font-medium text-gray-600">
                                  +{taxAmount.toLocaleString()}₫
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Tổng cộng */}
                      <div className="border-t-2 border-blue-200 pt-3 mt-3 bg-blue-50 -mx-4 px-4 py-3 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-blue-800">
                            Tổng cộng
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {(calculatedPrice || 0).toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card className="border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all duration-200">
              <CardHeader className="bg-gray-100 text-gray-800 rounded-t-lg py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Tùy chọn nâng cao
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Trạng thái booking
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                        <SelectItem
                          value="confirmed"
                          className="rounded-lg py-3 px-4 hover:bg-green-50 hover:text-green-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800"
                        >
                          Đã xác nhận
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="payment_status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Trạng thái thanh toán
                    </Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(value) => {
                        // Chỉ cập nhật payment_status, không tự động thay đổi payment_method
                        setFormData((prev) => ({
                          ...prev,
                          payment_status: value,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Chọn trạng thái thanh toán" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                        <SelectItem
                          value="paid"
                          className="rounded-lg py-3 px-4 hover:bg-green-50 hover:text-green-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800"
                        >
                          Đã thanh toán
                        </SelectItem>
                        <SelectItem
                          value="partially_paid"
                          className="rounded-lg py-3 px-4 hover:bg-yellow-50 hover:text-yellow-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-800"
                        >
                          Thanh toán một phần
                        </SelectItem>
                        <SelectItem
                          value="unpaid"
                          className="rounded-lg py-3 px-4 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-red-100 data-[state=checked]:text-red-800"
                        >
                          Chưa thanh toán
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="payment_method"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phương thức thanh toán
                    </Label>
                    <Select
                      value={formData.payment_method || "cash"}
                      onValueChange={(value) => {
                        // Chỉ cập nhật payment_method, không tự động thay đổi payment_status
                        setFormData((prev) => ({
                          ...prev,
                          payment_method: value,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11 border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg">
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white shadow-xl border border-gray-200/50">
                        <SelectItem
                          value="cash"
                          className="rounded-lg py-3 px-4 hover:bg-green-50 hover:text-green-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Tiền mặt
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="vnpay"
                          className="rounded-lg py-3 px-4 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-800"
                        >
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            VNPay
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                  Ghi chú
                </Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Ghi chú nội bộ..."
                  rows={3}
                  className="border border-gray-300 hover:border-gray-400 focus:border-gray-500 transition-colors rounded-lg resize-none"
                />
              </div> */}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex items-center justify-between pt-6 border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-3">
              {dataLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="font-medium">Đang tải dữ liệu...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-14 px-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-all duration-200 text-base"
              >
                <span>Hủy</span>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-14 px-10 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span>Tạo Booking</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default StaffBookingModal;
