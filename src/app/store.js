import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import notesReducer from "../features/notes/notesSlice";
import paymentReducer from "../features/payment/paymentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    payment: paymentReducer
  }
});