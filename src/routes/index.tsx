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
import Overview from "@/pages/BecomeAHost/Overview";
import Location from "@/pages/BecomeAHost/Location";
import AboutYourPlace from "@/pages/BecomeAHost/AboutYourPlace";
import FloorPlan from "@/pages/BecomeAHost/FloorPlan";
import StandOut from "@/pages/BecomeAHost/StandOut";
import Amenities from "@/pages/BecomeAHost/Amenities";
import UploadPhotos from "@/pages/BecomeAHost/Photos";
import Title from "@/pages/BecomeAHost/Title";
import Description from "@/pages/BecomeAHost/Description";
import FinishSetup from "@/pages/BecomeAHost/FinishSetup";
import Price from "@/pages/BecomeAHost/Price";


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
  {path: "/overview",element: <Overview />},
  {path: "/location",element: <Location />},
  {path: "/about-your-place",element: <AboutYourPlace />},
  {path: "/floor-plan",element: <FloorPlan />},
  {path: "/stand-out",element: <StandOut />},
  {path: "/amenities",element: <Amenities />},
  {path: "/photos",element: <UploadPhotos />},
  {path: "/title",element: <Title />},
  {path: "/description",element: <Description />},
  {path: "/finish-setup",element: <FinishSetup />},
  {path: "/price",element: <Price />},
  {
    path: "*",
    element: <ErrorPage />,
  }
];

export const router = createBrowserRouter(routes);
