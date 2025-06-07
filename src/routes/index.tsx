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
import Overview from "@/pages/hostRegister/Overview";
import Location from "@/pages/hostRegister/Location";


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
  {
    path: "/overview",
    element: <Overview />
  },
  {
    path: "/location",
    element: <Location />
  },
  {
    path: "*",
    element: <ErrorPage />,
  }
];

export const router = createBrowserRouter(routes);
