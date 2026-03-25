import { useDispatch, useSelector } from "react-redux";
import {
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { createPaymentIntentFunc } from "../features/payment/paymentSlice";

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();

    const { loading } = useSelector((state) => state.payment);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await dispatch(createPaymentIntentFunc()).unwrap();

            const clientSecret = res.clientSecret;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: "User",
                    },
                },
            });

            if (result.error) {
                alert(result.error.message);
            } else if (result.paymentIntent.status === "succeeded") {
                alert("Payment Successful 🎉");
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] mx-auto"
        >
            <CardElement />

            <button
                disabled={!stripe || loading}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
            >
                {loading ? "Processing..." : "Pay ₹500"}
            </button>
        </form>
    );
};

export default CheckoutForm;