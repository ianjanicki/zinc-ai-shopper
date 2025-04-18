import type { Stripe } from "stripe";

interface ZincShippingAddress {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  phone_number: string;
}

interface ZincOrderRequest {
  retailer: string;
  products: Array<{
    product_id: string;
    quantity: number;
  }>;
  shipping_address: ZincShippingAddress;
  shipping: {
    order_by: string;
    max_days: number;
    max_price: number;
  };
  addax: boolean;
  addax_queue_timeout: number;
}

interface ShippingDetails {
  name: string | null;
  address: Stripe.Address | null;
}

export async function createZincOrder(
  productId: string,
  shippingAddress: ShippingDetails,
  maxPrice: number
) {
  const order: ZincOrderRequest = {
    retailer: "amazon",
    products: [
      {
        product_id: productId,
        quantity: 1,
      },
    ],
    shipping_address: {
      first_name: shippingAddress.name?.split(" ")[0] || "",
      last_name: shippingAddress.name?.split(" ").slice(1).join(" ") || "",
      address_line1: shippingAddress.address?.line1 || "",
      address_line2: shippingAddress.address?.line2 || "",
      zip_code: shippingAddress.address?.postal_code || "",
      city: shippingAddress.address?.city || "",
      state: shippingAddress.address?.state || "",
      country: shippingAddress.address?.country || "",
      phone_number: "5555555555", // Default as Stripe doesn't provide phone
    },
    shipping: {
      order_by: "price",
      max_days: 5,
      max_price: 1000,
    },
    addax: true,
    addax_queue_timeout: 14400,
  };

  console.log("Sending Zinc order:", order);

  const response = await fetch("https://api.zinc.io/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        process.env.ZINC_API_KEY + ":"
      ).toString("base64")}`,
    },
    body: JSON.stringify(order),
  });

  const data = await response.json();
  console.log("Zinc API response:", {
    status: response.status,
    statusText: response.statusText,
    data,
  });

  if (!response.ok) {
    throw new Error(
      `Zinc API error: ${response.status} ${JSON.stringify(data)}`
    );
  }

  return data;
}
