"use server";

import Stripe from "stripe";
import { z } from "zod";
import type { Stripe as StripeType } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const CheckoutSchema = z.object({
  price: z.number(),
  title: z.string(),
  image: z.string(),
  productId: z.string(),
});

export async function createCheckoutSession(
  data: z.infer<typeof CheckoutSchema>
) {
  try {
    console.log("Creating Stripe session with raw data:", data);

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://your-production-url.com";

    const sessionData: StripeType.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: data.title, images: [data.image] },
            unit_amount: data.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: data.productId,
        productName: data.title,
        productImage: data.image,
      } as StripeType.MetadataParam,
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancelled`,
    };

    console.log("Session metadata being sent:", sessionData.metadata);
    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("Session created with metadata:", session.metadata);

    return { sessionId: session.id };
  } catch (err) {
    console.error("Stripe error:", err);
    throw new Error("Failed to create checkout session");
  }
}
