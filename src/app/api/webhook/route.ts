import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createZincOrder } from "@/services/zinc";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Log the event
    console.log("Stripe event received:", {
      type: event.type,
      id: event.id,
      data: event.data.object,
    });

    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Webhook received session:", {
          id: session.id,
          metadata: session.metadata,
          raw: event.data.object,
        });

        if (session.customer_details?.address && session.metadata?.productId) {
          try {
            console.log("Attempting to create Zinc order with:", {
              productId: session.metadata.productId,
              address: session.customer_details.address,
              name: session.customer_details.name,
            });
            const zincOrder = await createZincOrder(
              session.metadata.productId,
              {
                name: session.customer_details.name || "",
                address: session.customer_details.address,
              },
              session.amount_total || 0
            );
            console.log("Zinc order created:", zincOrder);
          } catch (error) {
            console.error("Failed to create Zinc order:", error);
          }
        } else {
          console.log("Missing required data for Zinc order:", {
            hasAddress: !!session.customer_details?.address,
            hasProductId: !!session.metadata?.productId,
          });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
