"use client";

import Link from "next/link";
import {
  User,
  ChevronRight,
  Package,
  Trophy,
  FileText,
  Shield,
  CreditCard,
  Truck,
  DollarSign,
  Tag,
  LogOut,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

interface SettingsRow {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
}

function SettingsItem({ icon, label, value, href }: SettingsRow) {
  const inner = (
    <div className="flex items-center justify-between py-3.5 px-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {value && <span className="text-sm text-gray-400">{value}</span>}
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return <button type="button" className="w-full text-left">{inner}</button>;
}

export default function ProfilePage() {
  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
          <User size={32} className="text-gray-400" />
        </div>
        <h1 className="font-bold text-xl">John Doe</h1>
        <p className="text-sm text-gray-500 mb-3">
          Collector of vintage tech and rare finds
        </p>
        <button
          type="button"
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600"
        >
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 rounded-2xl bg-white shadow-sm mb-5">
        <div className="flex flex-col items-center py-4">
          <span className="font-bold text-lg">12</span>
          <span className="text-xs text-gray-500">Listings</span>
        </div>
        <div className="flex flex-col items-center py-4 border-x border-gray-100">
          <span className="font-bold text-lg">8</span>
          <span className="text-xs text-gray-500">Won</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <span className="font-bold text-lg">4.9</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
      </div>

      {/* Account section */}
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        <SettingsItem
          icon={<CreditCard size={18} />}
          label="Payment Methods"
          value="Cash, PayNow"
        />
        <SettingsItem
          icon={<Truck size={18} />}
          label="Delivery Preferences"
          value="Meet up, Delivery"
        />
        <SettingsItem
          icon={<DollarSign size={18} />}
          label="Delivery Fee"
          value="$5.00"
        />
        <SettingsItem
          icon={<Tag size={18} />}
          label="Category Interests"
          value="Electronics, Fashion, +3"
        />
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        <SettingsItem
          icon={<Package size={18} />}
          label="My Listings"
          href="/my-listings"
        />
        <SettingsItem
          icon={<Trophy size={18} />}
          label="Won Auctions"
          href="/won"
        />
      </div>

      {/* Legal */}
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        <SettingsItem
          icon={<FileText size={18} />}
          label="Terms & Conditions"
          href="/terms"
        />
        <SettingsItem
          icon={<Shield size={18} />}
          label="Privacy Policy"
          href="/privacy"
        />
      </div>

      {/* Log Out */}
      <button
        type="button"
        className="w-full rounded-2xl bg-white shadow-sm py-3.5 text-red-500 font-semibold text-sm mb-6"
      >
        <LogOut size={16} className="inline mr-2" />
        Log Out
      </button>

      <AdBanner className="mb-3" />

      <p className="text-xs text-gray-400 text-center">V0.1</p>
    </div>
  );
}
