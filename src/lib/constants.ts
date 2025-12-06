export type Product = {
  id: string;
  stripe: {
    priceId: string;
    type: "product" | "subscription";
  },
}

export const productIds = {
  Lifetime: "com.nyxphere.app.product.lifetime",
  Yearly: "com.nyxphere.app.subscription.yearly"
} as const;

export const products: Product[] = [
  {
    id: productIds.Lifetime,
    stripe: {
      priceId: process.env.STRIPE_PRICE_LIFETIME as string,
      type: 'product'
    },
  },
  {
    id: productIds.Yearly,
    stripe: {
      priceId: process.env.STRIPE_PRICE_YEARLY as string,
      type: 'subscription'
    }
  }
];