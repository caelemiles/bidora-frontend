import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdBanner from "@/components/AdBanner";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-400">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold mt-6 mb-2">1. Welcome to Bidora</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Bidora is an online auction marketplace platform that connects buyers
          and sellers. By using Bidora, you agree to these terms.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">2. Platform Role</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Bidora acts as a marketplace facilitator. We connect buyers and sellers
          but are not a direct party to any transaction. All purchases, sales,
          and exchanges are between users. Bidora does not guarantee the quality,
          safety, or legality of listed items.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          3. Account Responsibilities
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You are responsible for maintaining the security of your account. You
          agree to provide accurate information during registration and keep your
          profile up to date. You must not create multiple accounts or
          impersonate others.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">4. Auction Rules</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          All bids are binding commitments to purchase the item at the bid price.
          Placing a bid means you agree to complete the transaction if you win.
          Auction end times may be extended automatically if bids are placed in
          the final moments.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          5. Winner Confirmation
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          When you win an auction, you have 24 hours to confirm whether you want
          to proceed with the deal. If you choose to pass, the item may be
          offered to the next highest bidder. Repeatedly passing on won auctions
          may result in temporary restrictions on your account.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          6. Payments and Delivery
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          All payments and deliveries are arranged directly between buyers and
          sellers. Bidora does not process payments or handle shipping. Users are
          encouraged to use safe payment methods and meet in public locations.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          7. Prohibited Items
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You may not list illegal items, counterfeit goods, stolen property, or
          items that violate intellectual property rights. Bidora reserves the
          right to remove any listing that violates these guidelines.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">8. Liability</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Bidora is provided &ldquo;as is&rdquo; without warranties of any kind.
          We are not liable for any disputes, losses, or damages arising from
          transactions between users.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">
          9. Changes to Terms
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          We may update these terms from time to time. Continued use of Bidora
          after changes constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">10. Contact</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          If you have questions about these terms, please contact us through the
          app.
        </p>
      </div>

      {/* Ad */}
      <div className="mt-5">
        <AdBanner />
      </div>
    </div>
  );
}
