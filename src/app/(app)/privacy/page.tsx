import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdBanner from "@/components/AdBanner";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to settings"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold mt-6 mb-2">1. Introduction</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This Privacy Policy explains how Bidora collects, uses, and protects
          your personal information when you use our platform.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          2. Information We Collect
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We collect information you provide directly, including your name, email
          address, profile picture, bio, payment preferences, delivery
          preferences, and category interests. We also collect information about
          your activity on the platform, such as listings created, bids placed,
          chats sent, and auction outcomes.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          3. How We Use Your Information
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We use your information to provide and improve our services,
          personalize your experience, facilitate transactions between users,
          send notifications about auction activity, and maintain the safety and
          security of our platform.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">4. Data Sharing</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We do not sell your personal information. We may share limited
          information with other users as necessary to facilitate transactions
          (such as your display name and delivery preferences). We may share data
          with service providers who help us operate the platform.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">5. Data Storage</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your data is stored securely using industry-standard practices. We use
          Firebase for authentication and data storage. Chat messages, listing
          data, and profile information are stored for as long as your account is
          active.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">6. Your Rights</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You have the right to access, update, or delete your personal
          information at any time through your profile settings. You may also
          request a copy of your data or ask us to delete your account entirely.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          7. Cookies and Analytics
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We may use cookies and similar technologies to improve your experience
          and analyze platform usage. You can manage cookie preferences through
          your browser settings.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          8. Children&apos;s Privacy
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Bidora is not intended for users under the age of 13. We do not
          knowingly collect information from children.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          9. Changes to This Policy
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We may update this policy periodically. We will notify you of
          significant changes through the app.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">10. Contact</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          For privacy-related inquiries, please contact us through the app.
        </p>
      </div>

      {/* Ad */}
      <div className="mt-5">
        <AdBanner />
      </div>
    </div>
  );
}
