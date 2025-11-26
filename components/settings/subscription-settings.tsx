"use client";

import { CreditCard, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";

interface SubscriptionSettingsProps {
  isPro: boolean;
}

export function SubscriptionSettings({ isPro }: SubscriptionSettingsProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-chalk font-bold text-gray-900">Subscription</h2>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Zap className={`w-6 h-6 ${isPro ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
            </div>
            <div>
              <h3 className="text-xl font-chalk font-bold text-gray-900">
                {isPro ? "Pro Plan" : "Free Plan"}
              </h3>
              <p className="text-sm font-sans text-gray-600">
                {isPro ? "$7.99 / month • Unlimited lessons" : "1 lesson per day"}
              </p>
            </div>
          </div>
          
          {!isPro && (
            <Link href="/pricing">
              <button className="px-6 py-3 bg-blue-500 text-white font-chalk font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                Upgrade to Pro
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
          )}
        </div>

        {/* Subscription Management */}
        {isPro && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-chalk font-bold text-gray-900">Billing Portal</p>
                <p className="text-sm font-sans text-gray-600">Manage billing, invoices, and payment methods</p>
              </div>
              <button className="px-4 py-2 bg-white border-2 border-gray-200 font-chalk font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                Manage
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-sans text-green-800">
                <strong className="font-chalk">Trial Active:</strong> Your 30-day free trial ends on{" "}
                <span className="font-bold">December 25, 2025</span>
              </p>
            </div>
          </div>
        )}

        {/* Usage Stats for Free Users */}
        {!isPro && (
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-chalk font-bold text-gray-900 mb-4">Today's Usage</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-sans text-gray-600">Lessons Created</span>
              <span className="font-chalk font-bold text-gray-900">0 / 1</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }}></div>
            </div>
            <p className="text-xs font-sans text-gray-500 mt-3">
              Resets daily at midnight. Upgrade for unlimited lessons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
