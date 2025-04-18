import { redirect } from "next/navigation";
import { Stripe } from "stripe";
import { Card } from "@/components/ui/card";
import Link from "next/link";

async function getCheckoutSession(sessionId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    return session;
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  if (!searchParams.session_id) {
    redirect("/");
  }

  const session = await getCheckoutSession(searchParams.session_id);
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Thank you for your purchase!</h1>
          <p className="text-gray-600">Your order has been confirmed.</p>
        </div>

        {session.metadata?.productImage && (
          <img
            src={session.metadata.productImage}
            alt={session.metadata.productName || "Product"}
            className="w-32 h-32 object-contain mx-auto mb-4"
          />
        )}

        <div className="mb-8">
          <p className="font-medium">{session.metadata?.productName}</p>
          <p className="text-gray-600">
            Total: ${(session.amount_total! / 100).toFixed(2)}
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-black/80"
        >
          Continue Shopping
        </Link>
      </Card>
    </div>
  );
} 