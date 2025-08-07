// src/router/index.tsx
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Register from '@/pages/auth/RegisterPage';
import Login from '@/pages/auth/LoginPage';
import ForgotPassword from '@/pages/auth/ForgotPasswordPage';
import ResetPassword from '@/pages/auth/ResetPasswordPage';
import ErrorPage from '@/pages/errorPage';
import ClientLayout from '@/components/layouts/client/ClientLayout';
import UserProfilePage from '@/pages/useProfile/ProfilePage';
import PastTrip from '@/components/useProfile/PastTrip';
import Connection from '@/components/useProfile/Connection';
import EditProfile from '@/components/useProfile/EditProfile';
import OtpPage from '@/pages/auth/OtpPage';
import RoomDeatil from '@/pages/RoomDeatil';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Become a host
import Overview from '@/pages/become-a-host/Overview';
import Location from '@/pages/become-a-host/Location';
import AboutYourPlace from '@/pages/become-a-host/AboutYourPlace';
import FloorPlan from '@/pages/become-a-host/FloorPlan';
import StandOut from '@/pages/become-a-host/StandOut';
import Amenities from '@/pages/become-a-host/Amenities';
import UploadPhotos from '@/pages/become-a-host/Photos';
import Title from '@/pages/become-a-host/Title';
import Description from '@/pages/become-a-host/Description';
import FinishSetup from '@/pages/become-a-host/FinishSetup';
import Price from '@/pages/become-a-host/Price';
import HostLayout from '@/components/layouts/host/HostLayout';
import Hosting from '@/pages/hosting/Hosting';
import Listing from '@/pages/hosting/Listing';
import BecomeAHostLayout from '@/components/layouts/become-a-host/BecomeAHostLayout';
import BecomeAHost from '@/pages/become-a-host/BecomeAHost';
import Messages from '@/pages/messages/Messages';
import AllNotificationsPage from '@/pages/notifications/AllNotificationsPage';
// Admin Pages
import AdminLayout from '@/components/layouts/admin/AdminLayout';
import DashboardContent from '@/components/admin/dasboard/DashboardContent';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ProtectedAdminRoute from '@/components/common/ProtectedAdminRoute';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import AdminForgotPasswordPage from '@/pages/auth/AdminForgotPasswordPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

import PaymentPage from '@/pages/payment/PaymentPage';
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage';
import PaymentFailedPage from '@/pages/payment/PaymentFailedPage';
//properties
import PropertiesPage from '@/pages/admin/property/PropertiesPage';
import CreatePropertyPage from '@/pages/admin/property/CreatePropertyPage';
import EditPropertyPage from '@/pages/admin/property/EditPropertyPage';
import PropertyDetailPage from '@/pages/admin/property/PropertyDetailPage';
import PropertyDeletedPage from '@/pages/admin/property/PropertyDeletedPage';
import PropertyStaffManagement from '@/pages/admin/properties/PropertyStaffManagement';
import PropertyStaffOverview from '@/pages/admin/properties/PropertyStaffOverview';
//listing
import ListingsPage from '@/pages/admin/listing/ListingsPage';
import EditListingPage from '@/pages/admin/listing/EditListingPage';
import ListingDetailPage from '@/pages/admin/listing/ListingDetailPage';
import CreateListingPage from '@/pages/admin/listing/CreateListingPage';
import DeleteListingsPage from '@/pages/admin/listing/DeleteListingsPage';
import AmenitiesPage from '@/pages/admin/amenities/AmenitiesPage';
import CreateAmenities from '@/components/admin/amenities/CreateAmenities';
import EditAmenities from '@/components/admin/amenities/EditAmenities';
// House Rules
import RoleManagementPage from '@/pages/admin/roles/RoleManagementPage';
import RoleCreatePage from '@/pages/admin/roles/RoleCreatePage';
import VoucherListPage from '@/pages/admin/voucher/VoucherListPage';
import ServiceListPage from '@/pages/admin/service/ServiceListPage';
import SafetyFeatureListPage from '@/pages/admin/safety-feature/SafetyFeatureListPage';
import HouseRuleListPage from '@/pages/admin/house-rule/HouseRuleListPage';
import ReviewManagementPage from '@/pages/admin/reviews/ReviewManagementPage';

//booking
import BookingManagementPage from '@/pages/admin/booking/BookingManagementPage';
import BookingDetailPage from '@/pages/admin/booking/BookingDetailPage';
import { BookingCalendarPage } from '@/pages/admin/booking/BookingCalendarPage';
import AdminUserPage from '@/pages/admin/user/AdminUserPage';
import StaffManagementPage from '@/pages/admin/user/StaffManagementPage';
import AdminWishlistPage from '@/pages/admin/wishlist/AdminWishlistPage';
import WishlistPage from '@/pages/WishlistPage';
import SearchResultPage from '@/pages/SearchResultPage';
import PropertieInfo from '@/components/roomdetail/PropertieInfo';
const routes: RouteObject[] = [
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      {
        path: 'verify-otp',
        element: <OtpPage />,
      },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      {
        path: 'profilepage',
        element: (
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'past-trip',
        element: (
          <ProtectedRoute>
            <PastTrip />
          </ProtectedRoute>
        ),
      },
      {
        path: 'connection',
        element: (
          <ProtectedRoute>
            <Connection />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit-profile',
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <AllNotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wishlists',
        element: (
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        ),
      },
      { path: 'list/:id', element: <RoomDeatil /> },
      { path: 'room-detail/:id', element: <RoomDeatil /> },
      { path: 'search', element: <SearchResultPage /> },
      { path: 'property/:id', element: <PropertieInfo /> },
    ],
  },
  {
    path: '/payment',
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment/return',
    element: <PaymentSuccessPage />,
  },
  {
    path: '/payment/failed',
    element: <PaymentFailedPage />,
  },

  // Các route trở thành host, có thể cho phép tất cả user đăng nhập, hoặc chỉ một số role, nếu cần thì wrap bằng ProtectedRoute luôn
  { path: '/overview', element: <Overview /> },
  { path: '/location', element: <Location /> },
  { path: '/about-your-place', element: <AboutYourPlace /> },
  { path: '/floor-plan', element: <FloorPlan /> },
  { path: '/stand-out', element: <StandOut /> },
  { path: '/amenities', element: <Amenities /> },
  { path: '/photos', element: <UploadPhotos /> },
  { path: '/title', element: <Title /> },
  { path: '/description', element: <Description /> },
  { path: '/finish-setup', element: <FinishSetup /> },
  { path: '/price', element: <Price /> },

  // router Become a host (nếu cần bảo vệ, wrap bằng ProtectedRoute)
  {
    path: '/become-a-host',
    element: (
      <ProtectedRoute>
        <BecomeAHostLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <BecomeAHost /> },
      { path: 'about-your-place', element: <AboutYourPlace /> },
      { path: 'location', element: <Location /> },
      { path: 'floor-plan', element: <FloorPlan /> },
      { path: 'stand-out', element: <StandOut /> },
      { path: 'amenities', element: <Amenities /> },
      { path: 'photos', element: <UploadPhotos /> },
      { path: 'title', element: <Title /> },
      { path: 'description', element: <Description /> },
      { path: 'finish-setup', element: <FinishSetup /> },
      { path: 'price', element: <Price /> },
    ],
  },

  // hosting (chỉ cho host hoặc admin)
  {
    path: '/hosting',
    element: (
      <ProtectedRoute requiredRole={['staff', 'admin']}>
        <HostLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Hosting /> },
      { path: 'listings', element: <Listing /> },
      { path: 'messages', element: <Messages /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/forgot-password',
    element: <AdminForgotPasswordPage />,
  },

  // admin routes (chỉ cho admin và staff, không cho guest)
  {
    path: '/admin',
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <DashboardContent /> },
      //listing
      { path: 'listings', element: <ListingsPage /> },
      { path: 'listings/create', element: <CreateListingPage /> },
      { path: 'listings/edit/:id', element: <EditListingPage /> },
      { path: 'listings/:id', element: <ListingDetailPage /> },

      // booking
      { path: 'bookings', element: <BookingManagementPage /> },
      { path: 'bookings/calendar', element: <BookingCalendarPage /> },
      {
        path: 'bookings/:propertyId/:bookingId',
        element: <BookingDetailPage />,
      },
      //properties
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'listings/deleted', element: <DeleteListingsPage /> },
      { path: 'properties/create', element: <CreatePropertyPage /> },
      { path: 'properties/edit/:id', element: <EditPropertyPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      { path: 'properties/deleted', element: <PropertyDeletedPage /> },
      { path: 'properties/:id/staff', element: <PropertyStaffManagement /> },
      { path: 'property-staff', element: <PropertyStaffOverview /> },
      //amenities
      { path: 'amenities', element: <AmenitiesPage /> },
      { path: 'amenities/create', element: <CreateAmenities /> },
      { path: 'amenities/edit/:id', element: <EditAmenities /> },

      { path: 'messages', element: <Messages /> },

      { path: 'permissions-manager', element: <RoleManagementPage /> },
      { path: 'permissions/create', element: <RoleCreatePage /> },
      { path: 'vouchers', element: <VoucherListPage /> },
      { path: 'services', element: <ServiceListPage /> },
      { path: 'safety-features', element: <SafetyFeatureListPage /> },
      { path: 'house-rules', element: <HouseRuleListPage /> },
      { path: 'reviews', element: <ReviewManagementPage /> },
      { path: 'users', element: <AdminUserPage /> },
      { path: 'staff', element: <StaffManagementPage /> },
      { path: 'wishlists', element: <AdminWishlistPage /> },
    ],
  },

  // Unauthorized page
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // Catch-all route for 404 errors
  {
    path: '*',
    element: <ErrorPage />,
  },
];

export const router = createBrowserRouter(routes);
