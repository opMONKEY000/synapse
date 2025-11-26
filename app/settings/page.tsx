import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeskMat } from "@/components/dashboard/desk-mat";
import { AccountSettings } from "@/components/settings/account-settings";
import { SubscriptionSettings } from "@/components/settings/subscription-settings";
import { AIPreferences } from "@/components/settings/ai-preferences";
import { checkSubscription } from "@/lib/subscription";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isPro = await checkSubscription();

  return (
    <DeskMat user={session.user}>
      <div className="col-span-12">
        <div className="max-w-4xl mx-auto w-full px-4">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-chalk font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600 font-sans">Manage your account and preferences</p>
          </div>

          <div className="space-y-6 w-full">
            <AccountSettings user={session.user} />
            <SubscriptionSettings isPro={isPro} />
            <AIPreferences />
          </div>
        </div>
      </div>
    </DeskMat>
  );
}
