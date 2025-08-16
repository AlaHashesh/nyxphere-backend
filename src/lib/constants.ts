type Product = {
  id: string;
  stripe: {
    productId: string;
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
      productId: "prod_SsWQYqpBHigr9x",
      priceId: "price_1RwlNiQxUkP3ykBz89TRfXq2",
      type: 'product'
    },
  },
  {
    id: productIds.Yearly,
    stripe: {
      productId: "prod_SsWQuVpdcXpGYT",
      priceId: "price_1RwlNLQxUkP3ykBzTDdbxr4k",
      type: 'subscription'
    }
  }
];