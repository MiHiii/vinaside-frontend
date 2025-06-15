import { createBrowserRouter, RouteObject } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import Register from "@/pages/auth/RegisterPage";
import Login from "@/pages/auth/LoginPage";
import ForgotPassword from "@/pages/auth/ForgotPasswordPage";
import ResetPassword from "@/pages/auth/ResetPasswordPage";
import ErrorPage from "@/pages/errorPage";
import ClientLayout from "@/components/layouts/client/ClientLayout";
import UserProfilePage from "@/pages/useProfile/ProfilePage";
import PastTrip from "@/components/useProfile/PastTrip";
import Connection from "@/components/useProfile/Connection";
import EditProfile from "@/components/useProfile/EditProfile";
import OtpPage from "@/pages/auth/OtpPage";
import RoomDeatil from "@/pages/RoomDeatil";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
// import BecomeAHost
import Overview from "@/pages/become-a-host/Overview";
import Location from "@/pages/become-a-host/Location";
import AboutYourPlace from "@/pages/become-a-host/AboutYourPlace";
import FloorPlan from "@/pages/become-a-host/FloorPlan";
import StandOut from "@/pages/become-a-host/StandOut";
import Amenities from "@/pages/become-a-host/Amenities";
import UploadPhotos from "@/pages/become-a-host/Photos";
import Title from "@/pages/become-a-host/Title";
import Description from "@/pages/become-a-host/Description";
import FinishSetup from "@/pages/become-a-host/FinishSetup";
import Price from "@/pages/become-a-host/Price";
import HostLayout from "@/components/layouts/host/HostLayout";
import Hosting from "@/pages/hosting/Hosting";
import Listing from "@/pages/hosting/Listing";
import BecomeAHostLayout from "@/components/layouts/become-a-host/BecomeAHostLayout";
import BecomeAHost from "@/pages/become-a-host/BecomeAHost";


const routes: RouteObject[] = [
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "verify-otp", element: <OtpPage /> },
      { path : "verify-email" , element:<VerifyEmailPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "profilepage", element: < UserProfilePage/> },
      { path: "past-trip", element: < PastTrip/> },
      { path: "connection", element: < Connection/> },
      { path: "edit-profile", element: < EditProfile/> },
       { path: "room-detail", element: < RoomDeatil/> },
    ],
  },

  //router Become a host
  {path: "/become-a-host",
    element: <BecomeAHostLayout />,
    children: [
      {index: true, element: <BecomeAHost />},
      {path: "about-your-place",element: <AboutYourPlace />},
      {path: "location",element: <Location />},
      {path: "floor-plan",element: <FloorPlan />},
      {path: "stand-out",element: <StandOut />},
      {path: "amenities",element: <Amenities />},
      {path: "photos",element: <UploadPhotos />},
      {path: "title",element: <Title />},
      {path: "description",element: <Description />},
      {path: "finish-setup",element: <FinishSetup />},
      {path: "price",element: <Price />},
    ]
  },
  {path: "/overview",element: <Overview />},
  
  //hosting
  {path: "/hosting",
    element: <HostLayout />,
    children: [
      {index: true, element: <Hosting />},
      {path: "listings",element: <Listing />},
    ]
  },
  {
    path: "*",
    element: <ErrorPage />,
  }
];

export const router = createBrowserRouter(routes);
