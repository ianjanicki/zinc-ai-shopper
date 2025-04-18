import { Result } from "@/types/zinc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/stripe";
import { loadStripe } from "@stripe/stripe-js";

// Make sure to use NEXT_PUBLIC prefix for client-side env vars
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export function ProductCard({ product }: { product: Result }) {
  console.log("Product:", product);
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking button
    try {
      const stripe = await stripePromise;
      if (!stripe || !product.price) return;

      console.log("Sending to checkout with product:", {
        price: product.price,
        title: product.title,
        image: product.image,
        productId: product.product_id,
      });

      const { sessionId } = await createCheckoutSession({
        price: product.price,
        title: product.title,
        image: product.image,
        productId: product.product_id,
      });

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <Card className="p-2 bg-white w-[200px] relative group/card cursor-pointer">
      <div className="flex flex-col gap-2 group-hover/card:blur-sm">
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[180px] object-contain rounded bg-white"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-ellipsis overflow-hidden whitespace-nowrap">
            {product.title}
          </p>
          {product.price && (
            <p className="text-sm font-bold">
              ${(product.price / 100).toFixed(2)}
            </p>
          )}
        </div>
      </div>
      <Button
        onClick={handleBuyNow}
        className="absolute inset-0 m-auto w-24 h-10 opacity-0 group-hover/card:opacity-100 transition-opacity bg-black text-white hover:bg-black/80"
      >
        Buy Now
      </Button>
    </Card>
  );
}
