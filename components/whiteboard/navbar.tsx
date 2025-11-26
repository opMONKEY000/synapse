"use client";

import Link from "next/link";
import { MarkerButton } from "./marker-button";
import { Doodle } from "./doodle";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Doodle className="absolute inset-0 text-blue-600" />
            </div>
            <span className="font-chalk text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Synapse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            {session ? (
              <>
                <Link href="/dashboard" className="font-chalk text-base md:text-lg text-gray-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/settings" className="font-chalk text-base md:text-lg text-gray-600 hover:text-blue-600 transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link href="#features" className="font-chalk text-base md:text-lg text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="hidden sm:block font-chalk text-base md:text-lg text-gray-600 hover:text-blue-600 transition-colors">
                  How it Works
                </Link>
                <Link href="#pricing" className="font-chalk text-base md:text-lg text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="hidden md:block font-sans text-sm text-gray-500">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <MarkerButton 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-6 py-1.5 text-lg" 
                    variant="secondary"
                  >
                    Sign Out
                  </MarkerButton>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden md:block font-chalk text-lg text-gray-900 hover:text-blue-600 transition-colors">
                  Log in
                </Link>
                <Link href="/signup">
                  <MarkerButton className="px-6 py-1.5 text-lg" variant="primary">
                    Get Started
                  </MarkerButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
