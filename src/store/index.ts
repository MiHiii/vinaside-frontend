import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import listingsReducer from "./slices/listingSlice";
import propertiesReducer from "./slices/propertySlice";
import amenityReducer from "./slices/amenitySlice";
import reviewReducer from "./slices/reviewSlice";
import bookingReducer from "./slices/bookingSlice";
import rbacReducer from "./slices/rbacSlice";
import voucherReducer from "./slices/voucherSlice";
import serviceReducer from "./slices/serviceSlice";
import safetyFeatureReducer from "./slices/safetyFeatureSlice";
import houseRuleReducer from "./slices/houseRuleSlice";
import uploadReducer from "./slices/uploadSlice";
import userReducer from "./slices/userSlice";
import notificationReducer from "./slices/notificationSlice";
import wishlistReducer from "./slices/wishlistSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    listings: listingsReducer,
    properties: propertiesReducer,
    amenities: amenityReducer,
    reviews: reviewReducer,
    booking: bookingReducer,
    rbac: rbacReducer,
    voucher: voucherReducer,
    service: serviceReducer,
    safetyFeature: safetyFeatureReducer,
    houseRule: houseRuleReducer,
    upload: uploadReducer,
    users: userReducer,
    notification: notificationReducer,
    wishlist: wishlistReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
