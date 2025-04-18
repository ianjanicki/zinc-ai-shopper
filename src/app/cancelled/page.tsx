import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function CancelledPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-black/80"
        >
          Return to Shopping
        </Link>
      </Card>
    </div>
  );
} 