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
  CommandGroup,
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
  Minus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { format } from "date-fns";
import BookingCalendar from "@/components/roomdetail/BookingCalendar";

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
    status: "pending",
    payment_status: "unpaid",
    price_per_night: undefined,
    final_amount: undefined,
    skip_availability_check: false,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      resetForm();
    }
  }, [isOpen]);

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
    if (formData.listingId) {
      loadBookedDates();
    }
  }, [formData.listingId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (selectedListing && nights > 0) {
      const basePrice =
        formData.price_per_night || selectedListing.price_per_night;
      const totalPrice = basePrice * nights;

      // Calculate services total
      const servicesTotal = formData.services.reduce((sum, service) => {
        const serviceData = services.find((s) => s._id === service.serviceId);
        return sum + (serviceData?.default_price || 0) * service.quantity;
      }, 0);

      // Calculate additional costs
      const additionalCosts = formData.additionalCost || 0;

      // Calculate final amount (simplified calculation)
      const subtotal = totalPrice + servicesTotal + additionalCosts;
      const serviceFee = subtotal * 0.1; // 10%
      const tax = subtotal * 0.08; // 8%
      const finalAmount = subtotal + serviceFee + tax;

      setCalculatedPrice(finalAmount);
    }
  }, [
    selectedListing,
    nights,
    formData.services,
    formData.additionalCost,
    formData.price_per_night,
    services,
  ]);

  const loadBookedDates = async () => {
    try {
      const res = await api.get(
        `/bookings/listing/${formData.listingId}/booked-dates`
      );
      const dates = res.data.data || [];
      setBookedDates(dates.map((dateStr: string) => new Date(dateStr)));
    } catch (error) {
      console.error("Error loading booked dates:", error);
      setBookedDates([]);
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
      const guestsRes = await api.get("/users?role=guest");
      console.log("Guests API response:", guestsRes);
      console.log("Guests response.data:", guestsRes.data);
      console.log("Guests response.data.data:", guestsRes.data.data);

      // Parse dữ liệu guests
      let guestsData = [];
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
        console.log("Không tìm thấy mảng guests trong response");
        guestsData = [];
      }

      setGuests(guestsData);
      console.log("Final guests data set:", guestsData);
      console.log("Sample guest:", guestsData[0]);

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
      status: "pending",
      payment_status: "unpaid",
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
    const listing = listings.find((l) => l._id === listingId);
    setSelectedListing(listing || null);
    setFormData((prev) => ({
      ...prev,
      listingId,
      price_per_night: listing?.price_per_night,
    }));
  };

  const handleGuestChange = (guestId: string) => {
    if (guestId === "__new__") {
      setFormData((prev) => ({
        ...prev,
        guestId: "",
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

  const addService = () => {
    if (services.length > 0) {
      setFormData((prev) => ({
        ...prev,
        services: [
          ...prev.services,
          { serviceId: services[0]._id, quantity: 1 },
        ],
      }));
    }
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateService = (
    index: number,
    field: keyof StaffBookingService,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((service, i) =>
        i === index ? { ...service, [field]: value } : service
      ),
    }));
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

      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      await api.post("/bookings/staff/create", payload);
      toast.success("Tạo booking thành công!");
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Tạo Booking cho Nhân viên
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property and Listing Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Chọn Property và Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Property *</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={handlePropertyChange}
                    disabled={dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn property" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(properties) &&
                        properties.map((property) => (
                          <SelectItem key={property._id} value={property._id}>
                            {property.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listing">Listing *</Label>
                  <Select
                    value={formData.listingId}
                    onValueChange={handleListingChange}
                    disabled={!formData.propertyId || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn listing" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(listings) &&
                        listings.map((listing) => (
                          <SelectItem key={listing._id} value={listing._id}>
                            {listing.title} -{" "}
                            {listing.price_per_night?.toLocaleString()} VND/đêm
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedListing && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedListing.title}</span>
                    <Badge variant="secondary">
                      Tối đa {selectedListing.max_guests} khách
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Giá: {selectedListing.price_per_night?.toLocaleString()}{" "}
                    VND/đêm
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Thông tin Khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest">Tìm Guest hoặc nhập mới</Label>
                  <Popover
                    open={guestSearchOpen}
                    onOpenChange={setGuestSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={guestSearchOpen}
                        className="w-full justify-between"
                      >
                        {formData.guestId && formData.guestId !== "__new__"
                          ? (() => {
                              const selectedGuest = guests.find(
                                (guest) => guest._id === formData.guestId
                              );
                              const guestName =
                                selectedGuest?.name ||
                                selectedGuest?.guest_name;
                              const guestEmail =
                                selectedGuest?.email ||
                                selectedGuest?.guest_email;
                              return `${guestName} (${guestEmail})`;
                            })()
                          : "Tìm guest hoặc nhập thông tin mới..."}
                        {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Tìm theo tên hoặc email..."
                          value={guestSearchValue}
                          onValueChange={setGuestSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-2 text-center">
                              <p className="text-sm text-muted-foreground">
                                Không tìm thấy guest
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  handleGuestChange("__new__");
                                  setGuestSearchOpen(false);
                                  setGuestSearchValue("");
                                }}
                              >
                                Nhập thông tin mới
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              key="__new__"
                              value="__new__"
                              onSelect={() => {
                                handleGuestChange("__new__");
                                setGuestSearchOpen(false);
                                setGuestSearchValue("");
                              }}
                            >
                              {/* <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.guestId === "__new__" ? "opacity-100" : "opacity-0"
                                }`}
                              /> */}
                              <div>
                                <div className="font-medium">
                                  Nhập thông tin mới
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Tạo booking cho guest mới
                                </div>
                              </div>
                            </CommandItem>
                            {Array.isArray(guests) &&
                              guests
                                .filter(
                                  (guest) =>
                                    guest.name
                                      ?.toLowerCase()
                                      .includes(
                                        guestSearchValue.toLowerCase()
                                      ) ||
                                    guest.email
                                      ?.toLowerCase()
                                      .includes(
                                        guestSearchValue.toLowerCase()
                                      ) ||
                                    guest.guest_name
                                      ?.toLowerCase()
                                      .includes(
                                        guestSearchValue.toLowerCase()
                                      ) ||
                                    guest.guest_email
                                      ?.toLowerCase()
                                      .includes(guestSearchValue.toLowerCase())
                                )
                                .map((guest) => (
                                  <CommandItem
                                    key={guest._id}
                                    value={guest._id}
                                    onSelect={() => {
                                      handleGuestChange(guest._id);
                                      setGuestSearchOpen(false);
                                      setGuestSearchValue("");
                                    }}
                                  >
                                    {/* <Check
                                      className={`mr-2 h-4 w-4 ${
                                        formData.guestId === guest._id ? "opacity-100" : "opacity-0"
                                      }`}
                                    /> */}
                                    <div>
                                      <div className="font-medium">
                                        {guest.name || guest.guest_name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {guest.email || guest.guest_email}{" "}
                                        {(guest.phone || guest.guest_phone) &&
                                          `• ${
                                            guest.phone || guest.guest_phone
                                          }`}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_name">Tên khách hàng *</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_email">Email *</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_phone">Số điện thoại</Label>
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Chi tiết Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chọn ngày check-in và check-out *</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guests">Số khách *</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={selectedListing?.max_guests || 10}
                      value={formData.guests}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          guests: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infants">Số trẻ em</Label>
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
                    />
                  </div>
                </div>
              </div>

              {nights > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Thời gian lưu trú</span>
                    <Badge variant="outline">{nights} đêm</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Dịch vụ bổ sung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.services.map((service, index) => {
                const serviceData = services.find(
                  (s) => s._id === service.serviceId
                );
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Select
                        value={service.serviceId}
                        onValueChange={(value) =>
                          updateService(index, "serviceId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(services) &&
                            services.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.name} - {s.default_price?.toLocaleString()}{" "}
                                VND
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateService(
                            index,
                            "quantity",
                            Math.max(1, service.quantity - 1)
                          )
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">
                        {service.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateService(index, "quantity", service.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      {serviceData &&
                        (
                          serviceData.default_price * service.quantity
                        ).toLocaleString()}{" "}
                      VND
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}

              <Button
                variant="outline"
                onClick={addService}
                className="w-full"
                disabled={services.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm dịch vụ
              </Button>
            </CardContent>
          </Card>

          {/* Pricing and Additional Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Tính giá và Chi phí bổ sung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_night">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalCost">Chi phí bổ sung</Label>
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalCostReason">
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
                />
              </div>

              {calculatedPrice > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tổng tiền ước tính:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {calculatedPrice.toLocaleString()} VND
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tùy chọn nâng cao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voucherCode">Mã voucher</Label>
                  <Input
                    id="voucherCode"
                    value={formData.voucherCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        voucherCode: e.target.value,
                      }))
                    }
                    placeholder="Nhập mã voucher..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái booking</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Trạng thái thanh toán</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="partially_paid">
                        Thanh toán một phần
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip_availability_check"
                    checked={formData.skip_availability_check}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        skip_availability_check: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="skip_availability_check">
                    Bỏ qua kiểm tra availability
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Ghi chú nội bộ..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dataLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải dữ liệu...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo Booking"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffBookingModal;
