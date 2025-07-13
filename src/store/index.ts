import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import usersReducer from "./slices/userSlice"; // Nên đổi tên file thành usersSlice.ts cho thống nhất
import listingsReducer from "./slices/listingSlice";
import propertiesReducer from "./slices/propertySlice";
import amenityReducer from "./slices/amenitySlice";
import reviewReducer from "./slices/reviewSlice";
import bookingReducer from "./slices/bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    users: usersReducer,
    listings: listingsReducer,
    properties: propertiesReducer,
    amenities: amenityReducer,
    reviews: reviewReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
