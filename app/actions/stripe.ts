"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

const settingsUrl = absoluteUrl("/dashboard");

export const createCheckoutSession = async () => {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userSubscription = await prisma.userSubscription.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (userSubscription && userSubscription.stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripeCustomerId,
      return_url: settingsUrl,
    });

    return { url: stripeSession.url };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: settingsUrl,
    cancel_url: settingsUrl,
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: session.user.email,
    line_items: [
      {
        price_data: {
          currency: "USD",
          product_data: {
            name: "Synapse Pro",
            description: "Unlimited AI generations",
          },
          unit_amount: 799, // $7.99
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 30,
    },
    metadata: {
      userId: session.user.id,
    },
  });

  return { url: stripeSession.url };
};
