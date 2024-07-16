import { bigPromise } from "../middlewares/bigPromise.middleware.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const sendStripeKey = bigPromise(async (req, res) => {
    res.status(200).json(process.env.STRIPE_PUBLIC_KEY);
});

export const captureStripePayment = bigPromise(async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            integration_check: "accept_a_payment",
        },
    });

    if (paymentIntent.status === "succeeded") {
        res.status(200).json({
            success: true,
            message: "Payment Succeeded",
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Payment Failed",
        });
    }
});
