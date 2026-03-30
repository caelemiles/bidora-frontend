"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ChevronRight,
  FileText,
  Shield,
  CreditCard,
  Truck,
  DollarSign,
  Tag,
  LogOut,
  Download,
  HelpCircle,
  Mail,
} from "lucide-react";

interface SettingsRow {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  accent?: boolean;
}

function SettingsItem({ icon, label, value, href, onClick, accent }: SettingsRow) {
  const inner = (
    <div className="flex items-center justify-between py-3.5 px-4">
      <div className="flex items-center gap-3">
        <span className={accent ? "text-indigo-600" : "text-gray-400"}>{icon}</span>
        <span className={`text-sm font-medium ${accent ? "text-indigo-600" : ""}`}>{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {value && <span className="text-sm text-gray-400">{value}</span>}
        <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-colors active:bg-gray-50">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="w-full text-left transition-colors active:bg-gray-50"
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

export default function SettingsPage() {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-3 shadow-sm">
          <User size={32} className="text-indigo-500" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your account &amp; preferences
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        <SettingsItem
          icon={<User size={18} />}
          label="Edit Profile"
          href="/profile"
        />
        <SettingsItem
          icon={<CreditCard size={18} />}
          label="Payment Methods"
        />
        <SettingsItem
          icon={<Truck size={18} />}
          label="Delivery Preferences"
        />
        <SettingsItem
          icon={<DollarSign size={18} />}
          label="Delivery Fee"
        />
        <SettingsItem
          icon={<Tag size={18} />}
          label="Category Interests"
        />
      </div>

      {/* Support */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
        Support
      </p>
      <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
        <SettingsItem
          icon={<HelpCircle size={18} />}
          label="Help & FAQ"
        />
        <SettingsItem
          icon={<Mail size={18} />}
          label="Contact Support"
        />
      </div>

      {/* Legal */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
        Legal
      </p>
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

      {/* Install App */}
      {showInstallBanner && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
            App
          </p>
          <div className="rounded-2xl bg-white shadow-sm divide-y divide-gray-100 mb-4">
            <SettingsItem
              icon={<Download size={18} />}
              label="Install Bidora App"
              accent
              onClick={handleInstall}
            />
          </div>
        </>
      )}

      {/* Log Out */}
      <button
        type="button"
        className="w-full rounded-2xl bg-white shadow-sm py-3.5 text-red-500 font-semibold text-sm mb-6 transition-colors active:bg-red-50"
      >
        <LogOut size={16} className="inline mr-2" />
        Log Out
      </button>

      <p className="text-xs text-gray-300 text-center">Bidora v0.2</p>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
