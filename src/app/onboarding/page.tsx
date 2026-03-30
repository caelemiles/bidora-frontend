"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

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

interface FormData {
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

  const [formData, setFormData] = useState<FormData>({
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

  async function handleFinish() {
    setError("");
    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to complete onboarding.");
        setSubmitting(false);
        return;
      }

      let avatarUrl = "";

      // Upload avatar if selected
      if (formData.avatarFile) {
        const fileExt = formData.avatarFile.name.split(".").pop();
        const filePath = `avatars/${user.uid}.${fileExt}`;

        console.log("[Onboarding] Uploading avatar:", filePath);
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, formData.avatarFile, { upsert: true });

        if (uploadError) {
          console.error("[Onboarding] Avatar upload error:", uploadError);
          setError(`Avatar upload failed: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
        console.log("[Onboarding] Avatar URL:", avatarUrl);
      }

      // Save profile to Supabase
      const profileData = {
        firebase_uid: user.uid,
        email: user.email || "",
        display_name: formData.displayName.trim(),
        bio: formData.bio.trim(),
        avatar_url: avatarUrl,
        payment_methods: formData.paymentMethods,
        delivery_methods: formData.deliveryMethods,
        delivery_fee: formData.deliveryFee ? parseFloat(formData.deliveryFee) : 0,
        category_interests: formData.categories,
      };

      console.log("[Onboarding] Saving profile:", profileData);

      const { error: insertError } = await supabase
        .from("users")
        .upsert(profileData, { onConflict: "firebase_uid" });

      if (insertError) {
        console.error("[Onboarding] Profile save error:", insertError);
        setError(`Failed to save profile: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      console.log("[Onboarding] Profile saved successfully!");
      router.push("/listings");
    } catch (err) {
      console.error("[Onboarding] Unexpected error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
      <div className="flex flex-1 flex-col items-center px-4 py-8 lg:py-16">
        {/* Progress bar */}
        <div className="mb-6 w-full max-w-md lg:max-w-lg">
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
          className={`w-full max-w-md lg:max-w-lg rounded-2xl bg-white p-6 lg:p-8 shadow-sm transition-all duration-200 ${transitionClass}`}
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
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-11 items-center justify-center rounded-xl border-2 border-gray-300 px-5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 active:scale-[0.98]"
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
                className="flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="flex h-11 items-center justify-center rounded-xl bg-[var(--success)] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Finish"}
              </button>
            )}
          </div>

          {/* Submission error */}
          {error && step === TOTAL_STEPS && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[var(--danger)]">
              {error}
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
    const previewUrl = URL.createObjectURL(file);
    onAvatarChange(file, previewUrl);
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold text-gray-900">Set up your profile</h2>

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
        <h2 className="text-xl font-bold text-gray-900">Tell us about yourself</h2>
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
        <h2 className="text-xl font-bold text-gray-900">Payment preferences</h2>
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
        <h2 className="text-xl font-bold text-gray-900">Delivery preferences</h2>
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
      <h2 className="text-xl font-bold text-gray-900">Set your delivery fee</h2>

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
        <h2 className="text-xl font-bold text-gray-900">What interests you?</h2>
        <p className="text-sm text-gray-500">Select categories to personalize your feed</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
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
