"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

const TOTAL_STEPS = 6;

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Collectibles",
  "Books",
  "Toys",
  "Vehicles",
  "Art",
  "Other",
] as const;

interface OnboardingFormData {
  displayName: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string;
  paymentMethods: string[];
  deliveryMethods: string[];
  deliveryFee: string;
  categories: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    displayName: "",
    bio: "",
    avatarFile: null,
    avatarPreview: "",
    paymentMethods: [],
    deliveryMethods: [],
    deliveryFee: "",
    categories: [],
  });

  function goTo(next: number) {
    setDirection(next > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  }

  function handleNext() {
    setError("");
    if (step === 1 && !formData.displayName.trim()) {
      setError("Display name is required");
      return;
    }
    goTo(step + 1);
  }

  function handleBack() {
    setError("");
    goTo(step - 1);
  }

  const [avatarError, setAvatarError] = useState("");

  async function handleFinish() {
    setError("");
    setAvatarError("");
    setSubmitting(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("[Onboarding] No Firebase user logged in.");
        setError("You must be logged in to complete onboarding.");
        setSubmitting(false);
        return;
      }

      // Refresh the Firebase token so the backend gets a valid Bearer token
      let freshToken: string;
      try {
        freshToken = await user.getIdToken(true);
        localStorage.setItem("token", freshToken);
      } catch (tokenErr) {
        console.error("[Onboarding] Failed to refresh Firebase token:", tokenErr);
        const detail = tokenErr instanceof Error ? tokenErr.message : String(tokenErr);
        setError(`Authentication error — could not refresh token: ${detail}`);
        setSubmitting(false);
        return;
      }

      console.log("[Onboarding] Firebase user:", user.uid, user.email);
      console.log("[Onboarding] API base URL:", API_BASE);
      console.log("[Onboarding] Token present:", Boolean(freshToken));
      console.log("[Onboarding] Token (first 20 chars):", freshToken.substring(0, 20) + "…");

      // ── Step 1: Save basic profile (without avatar) via backend API ──
      const profilePayload = {
        firebase_uid: user.uid,
        email: user.email || "",
        display_name: formData.displayName.trim(),
        bio: formData.bio.trim(),
        avatar_url: "",
        payment_methods: formData.paymentMethods,
        delivery_methods: formData.deliveryMethods,
        delivery_fee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : 0,
        category_interests: formData.categories,
        onboarding_completed: true,
      };

      const profileUrl = `${API_BASE}/api/profile`;
      console.log("[Onboarding] Step 1 — Saving profile via backend API...");
      console.log("[Onboarding]   URL:", profileUrl);
      console.log("[Onboarding]   Method: POST");
      console.log("[Onboarding]   Headers: Content-Type: application/json, Authorization: Bearer <token>");
      console.log("[Onboarding]   Payload:", JSON.stringify(profilePayload, null, 2));

      try {
        const profileResult = await api.post("/api/profile", profilePayload);
        console.log("[Onboarding] ✅ Profile saved successfully. Response:", JSON.stringify(profileResult));
      } catch (saveErr) {
        console.error("[Onboarding] ❌ Profile save FAILED:", saveErr);
        const detail = saveErr instanceof Error ? saveErr.message : String(saveErr);
        const isNetworkError = detail === "Failed to fetch" || detail.includes("NetworkError") || detail.includes("ERR_CONNECTION");
        if (isNetworkError) {
          console.error(`[Onboarding] Network error — backend at ${profileUrl} may be unreachable.`);
          setError(`Cannot reach backend at ${API_BASE}. Ensure the backend server is running and NEXT_PUBLIC_API_URL is set correctly. (${detail})`);
        } else {
          setError(`Profile save failed: ${detail}`);
        }
        setSubmitting(false);
        return;
      }

      // ── Step 2: Optional avatar upload via backend API ──
      if (formData.avatarFile) {
        const avatarUrl = `${API_BASE}/api/upload-avatar`;
        console.log("[Onboarding] Step 2 — Uploading avatar via backend API...");
        console.log("[Onboarding]   URL:", avatarUrl);
        console.log("[Onboarding]   Method: POST (multipart/form-data)");
        console.log("[Onboarding]   File name:", formData.avatarFile.name);
        console.log("[Onboarding]   File size:", formData.avatarFile.size, "bytes");
        console.log("[Onboarding]   File type:", formData.avatarFile.type);

        try {
          const uploadData = new FormData();
          uploadData.append("file", formData.avatarFile);
          const { url } = await api.upload<{ url: string }>("/api/upload-avatar", uploadData);
          console.log("[Onboarding] ✅ Avatar uploaded. Public URL:", url);
        } catch (uploadErr) {
          // Avatar upload failure is non-blocking — profile is already saved
          console.error("[Onboarding] ⚠️ Avatar upload failed (non-blocking):", uploadErr);
          const detail = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
          console.warn(`[Onboarding] Continuing without avatar. Error: ${detail}`);
          setAvatarError(`Avatar upload failed: ${detail}. Your profile was saved without a photo.`);
        }
      } else {
        console.log("[Onboarding] Step 2 — No avatar selected, skipping upload.");
      }

      console.log("[Onboarding] ✅ Onboarding complete! Redirecting to /listings...");
      router.push("/listings");
    } catch (err) {
      console.error("[Onboarding] Unexpected error:", err);
      const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      setError(`Unexpected error: ${detail}`);
      setSubmitting(false);
    }
  }

  function toggle(field: "paymentMethods" | "deliveryMethods" | "categories", value: string) {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  const transitionClass = animating
    ? direction === "forward"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col items-center px-4 py-8 lg:px-8 lg:py-16">
        {/* Progress bar */}
        <div className="mb-6 w-full max-w-md lg:mb-8 lg:max-w-xl">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-500">
            <span>Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className={`w-full max-w-md lg:max-w-xl rounded-2xl bg-white p-6 lg:p-10 shadow-sm transition-all duration-200 ${transitionClass}`}
        >
          {step === 1 && (
            <StepProfile
              displayName={formData.displayName}
              onChange={(v) => setFormData((p) => ({ ...p, displayName: v }))}
              avatarPreview={formData.avatarPreview}
              onAvatarChange={(file, preview) =>
                setFormData((p) => ({ ...p, avatarFile: file, avatarPreview: preview }))
              }
              error={error}
            />
          )}

          {step === 2 && (
            <StepBio
              bio={formData.bio}
              onChange={(v) => setFormData((p) => ({ ...p, bio: v }))}
            />
          )}

          {step === 3 && (
            <StepPayment
              selected={formData.paymentMethods}
              onToggle={(v) => toggle("paymentMethods", v)}
            />
          )}

          {step === 4 && (
            <StepDelivery
              selected={formData.deliveryMethods}
              onToggle={(v) => toggle("deliveryMethods", v)}
            />
          )}

          {step === 5 && (
            <StepDeliveryFee
              fee={formData.deliveryFee}
              onChange={(v) => setFormData((p) => ({ ...p, deliveryFee: v }))}
              deliveryEnabled={formData.deliveryMethods.includes("Delivery")}
            />
          )}

          {step === 6 && (
            <StepCategories
              selected={formData.categories}
              onToggle={(v) => toggle("categories", v)}
            />
          )}

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-between gap-3 lg:mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-11 items-center justify-center rounded-xl border-2 border-gray-300 px-5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98] lg:h-12 lg:px-7 lg:text-base"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] lg:h-12 lg:px-8 lg:text-base"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="flex h-11 items-center justify-center rounded-xl bg-[var(--success)] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50 lg:h-12 lg:px-8 lg:text-base"
              >
                {submitting ? "Saving…" : "Finish"}
              </button>
            )}
          </div>

          {/* Submission error — visible on final step */}
          {error && step === TOTAL_STEPS && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[var(--danger)]">
              {error}
            </p>
          )}
          {avatarError && step === TOTAL_STEPS && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              {avatarError}
            </p>
          )}
        </div>
      </div>

      {/* Ad banner at very bottom */}
      <div className="px-4 pb-6">
        <AdBanner />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step sub-components                                                */
/* ------------------------------------------------------------------ */

function StepProfile({
  displayName,
  onChange,
  avatarPreview,
  onAvatarChange,
  error,
}: {
  displayName: string;
  onChange: (v: string) => void;
  avatarPreview: string;
  onAvatarChange: (file: File, preview: string) => void;
  error: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke old preview URL to prevent memory leak
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    const previewUrl = URL.createObjectURL(file);
    onAvatarChange(file, previewUrl);
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Set up your profile</h2>

      {/* Avatar — tap to pick image */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAvatarClick}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300 hover:border-[var(--primary)] transition-colors cursor-pointer group"
          aria-label="Upload profile photo"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <User className="h-7 w-7 text-gray-400 group-hover:text-[var(--primary)]" />
              <span className="text-[9px] font-medium text-gray-400 group-hover:text-[var(--primary)]">
                Tap to add
              </span>
            </div>
          )}
        </button>
        {avatarPreview && (
          <span className="text-xs text-gray-400">Tap photo to change</span>
        )}
      </div>

      {/* Display name */}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your display name"
          className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:outline-none"
        />
        {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}
      </div>
    </div>
  );
}

function StepBio({
  bio,
  onChange,
}: {
  bio: string;
  onChange: (v: string) => void;
}) {
  const maxLen = 200;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Tell us about yourself</h2>
        <span className="text-sm text-gray-400">Optional</span>
      </div>

      <div>
        <textarea
          value={bio}
          onChange={(e) => {
            if (e.target.value.length <= maxLen) onChange(e.target.value);
          }}
          placeholder="Write a short bio…"
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {bio.length}/{maxLen}
        </p>
      </div>
    </div>
  );
}

function ChipSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StepPayment({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Payment preferences</h2>
        <p className="text-sm text-gray-500">How would you like to handle payments?</p>
      </div>
      <ChipSelect options={["Cash", "PayNow"]} selected={selected} onToggle={onToggle} />
    </div>
  );
}

function StepDelivery({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Delivery preferences</h2>
        <p className="text-sm text-gray-500">How would you like to exchange items?</p>
      </div>
      <ChipSelect options={["Meet up", "Delivery"]} selected={selected} onToggle={onToggle} />
    </div>
  );
}

function StepDeliveryFee({
  fee,
  onChange,
  deliveryEnabled,
}: {
  fee: string;
  onChange: (v: string) => void;
  deliveryEnabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Set your delivery fee</h2>

      {deliveryEnabled ? (
        <div>
          <label htmlFor="deliveryFee" className="mb-1 block text-sm font-medium text-gray-700">
            Fee amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
              $
            </span>
            <input
              id="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0.00"
              className="h-11 w-full rounded-lg border border-gray-300 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
          No delivery fee needed — you haven&apos;t selected delivery as a preference.
        </p>
      )}
    </div>
  );
}

function StepCategories({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">What interests you?</h2>
        <p className="text-sm text-gray-500">Select categories to personalize your feed</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3">
        {CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onToggle(cat)}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
