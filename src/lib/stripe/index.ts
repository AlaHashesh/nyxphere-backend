import Stripe from 'stripe';

export const getCustomerByEmail = async (email: string) => {
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  throw new Error("Customer not found");
}

export const createOrGetCustomer = async (email: string) => {
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1
  });

  let customer;
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: email
    });
  }

  return customer;
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY!);
