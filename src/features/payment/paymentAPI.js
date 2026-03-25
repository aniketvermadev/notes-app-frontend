import API from "../../services/api";

export const createPaymentIntent = async () => {
    const res = await API.post("/payment/create-payment-intent");
    return res.data;
};