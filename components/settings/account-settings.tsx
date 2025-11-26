"use client";

import { useState } from "react";
import { User, Mail, Lock, Trash2 } from "lucide-react";

interface AccountSettingsProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change logic
    console.log("Password change requested");
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-chalk font-bold text-gray-900">Account</h2>
      </div>

      <div className="space-y-6">
        {/* Email Display */}
        <div>
          <label className="block text-sm font-bold text-gray-700 font-chalk mb-2">
            Email Address
          </label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="font-sans text-gray-900">{user.email || "No email set"}</span>
          </div>
        </div>

        {/* Name Display */}
        <div>
          <label className="block text-sm font-bold text-gray-700 font-chalk mb-2">
            Display Name
          </label>
          <input
            type="text"
            defaultValue={user.name || ""}
            className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        {/* Password Change Form */}
        <form onSubmit={handlePasswordChange} className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-chalk font-bold text-gray-900">Change Password</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 font-chalk mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 font-chalk mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 font-chalk mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white font-chalk font-bold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-chalk font-bold text-red-900">Danger Zone</h3>
          </div>
          <p className="text-sm text-gray-600 font-sans mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-6 py-2.5 bg-red-50 text-red-600 font-chalk font-bold rounded-lg border-2 border-red-200 hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
