import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeskMat } from "@/components/dashboard/desk-mat";
import { MarkerButton } from "@/components/whiteboard/marker-button";
import { Check, X } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe";
import { checkSubscription } from "@/lib/subscription";

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isPro = await checkSubscription();

  return (
    <DeskMat user={session.user}>
      <div className="col-span-12 max-w-5xl mx-auto w-full py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-chalk font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 font-sans">
            Start with a 30-day free trial. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 relative overflow-hidden">
            <div className="mb-8">
              <h3 className="text-2xl font-chalk font-bold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$0</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-500 font-sans">
                Perfect for getting started with AI learning.
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-600 font-sans">1 AI lesson per day</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-600 font-sans">Basic learning methods</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-gray-400 font-sans">Advanced analytics</span>
              </li>
            </ul>

            <MarkerButton
              variant="secondary"
              className="w-full justify-center"
              disabled={true}
            >
              {isPro ? "Downgrade" : "Current Plan"}
            </MarkerButton>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative overflow-hidden transform scale-105">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl font-chalk font-bold text-sm">
              MOST POPULAR
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-chalk font-bold text-gray-900">Pro</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$7.99</span>
                <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
              </div>
              <p className="mt-4 text-gray-500 font-sans">
                Unlimited power for serious learners.
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-900 font-sans font-medium">Unlimited AI tokens</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-600 font-sans">All learning methods</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-600 font-sans">Priority support</span>
              </li>
            </ul>

            <form action={async () => {
              "use server";
              const { url } = await createCheckoutSession();
              if (url) redirect(url);
            }}>
              <MarkerButton
                variant="primary"
                className="w-full justify-center text-lg py-4"
                type="submit"
              >
                {isPro ? "Manage Subscription" : "Start 30-Day Free Trial"}
              </MarkerButton>
            </form>
          </div>
        </div>
      </div>
    </DeskMat>
  );
}
