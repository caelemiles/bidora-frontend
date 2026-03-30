"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Check, Loader2 } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

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

const CONDITIONS = [
  "New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
] as const;

const DURATIONS = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "5", label: "5 Days" },
  { value: "7", label: "7 Days" },
] as const;

const MAX_IMAGES = 8;

interface ImageItem {
  file: File;
  preview: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  startingBid?: string;
}

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<string>(CONDITIONS[0]);
  const [startingBid, setStartingBid] = useState("");
  const [buyNowEnabled, setBuyNowEnabled] = useState(false);
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [duration, setDuration] = useState("7");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!description.trim()) next.description = "Description is required";
    if (!category) next.category = "Category is required";
    if (!startingBid || Number(startingBid) <= 0)
      next.startingBid = "Starting bid must be greater than $0";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePublish() {
    if (!validate()) return;
    setSubmitError("");
    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setSubmitError("You must be logged in to create a listing.");
        setSubmitting(false);
        return;
      }

      // Look up the Supabase user ID from firebase_uid
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", user.uid)
        .single();

      if (userError || !userData) {
        console.error("[Sell] User lookup error:", userError);
        setSubmitError("Could not find your profile. Please complete onboarding first.");
        setSubmitting(false);
        return;
      }

      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const fileExt = img.file.name.split(".").pop();
        const filePath = `listings/${user.uid}/${Date.now()}-${i}.${fileExt}`;

        console.log(`[Sell] Uploading image ${i + 1}:`, filePath);
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, img.file);

        if (uploadError) {
          console.error(`[Sell] Image ${i + 1} upload error:`, uploadError);
          setSubmitError(`Image upload failed: ${uploadError.message}`);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath);
        imageUrls.push(urlData.publicUrl);
      }

      // Calculate ends_at
      const durationDays = Number(duration);
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + durationDays);

      const listingData = {
        seller_id: userData.id,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        starting_bid: Number(startingBid),
        current_bid: Number(startingBid),
        buy_now_price: buyNowEnabled && buyNowPrice ? Number(buyNowPrice) : null,
        duration_days: durationDays,
        ends_at: endsAt.toISOString(),
        status: "active",
        images: imageUrls,
      };

      console.log("[Sell] Creating listing:", listingData);

      const { error: insertError } = await supabase
        .from("listings")
        .insert(listingData);

      if (insertError) {
        console.error("[Sell] Listing insert error:", insertError);
        setSubmitError(`Failed to create listing: ${insertError.message}`);
        setSubmitting(false);
        return;
      }

      console.log("[Sell] Listing created successfully!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/my-listings");
      }, 1500);
    } catch (err) {
      console.error("[Sell] Unexpected error:", err);
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddImages() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    const newFiles = Array.from(files).slice(0, remaining);

    const newImages: ImageItem[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    // Reset input so same file can be selected again
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="px-4 pt-4 max-w-2xl mx-auto lg:max-w-3xl lg:px-8 lg:pt-8">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check size={16} />
          Listing published successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 lg:mb-8">
        <Link
          href="/listings"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to listings"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold">Create Listing</h1>
      </div>

      {/* Form card */}
      <div className="rounded-2xl bg-white shadow-sm p-5 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you selling?"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1.5">
            Condition
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Starting Bid */}
        <div>
          <label htmlFor="startingBid" className="block text-sm font-medium text-gray-700 mb-1.5">
            Starting Bid
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              $
            </span>
            <input
              id="startingBid"
              type="number"
              min={1}
              value={startingBid}
              onChange={(e) => setStartingBid(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {errors.startingBid && (
            <p className="mt-1 text-xs text-red-500">{errors.startingBid}</p>
          )}
        </div>

        {/* Buy Now Price */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <input
              id="buyNowToggle"
              type="checkbox"
              checked={buyNowEnabled}
              onChange={(e) => setBuyNowEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="buyNowToggle" className="text-sm font-medium text-gray-700">
              Buy Now Price (Optional)
            </label>
          </div>
          {buyNowEnabled && (
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                $
              </span>
              <input
                id="buyNowPrice"
                type="number"
                min={1}
                value={buyNowPrice}
                onChange={(e) => setBuyNowPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Auction Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
            Auction Duration
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Images</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Previews */}
          {images.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img.preview}
                    alt={`Upload ${i + 1}`}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white"
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area */}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={handleAddImages}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-8 text-gray-400 transition-colors hover:border-indigo-400 hover:text-indigo-500"
            >
              <Camera size={28} />
              <span className="text-sm font-medium">Tap to add photos</span>
              <span className="text-xs" aria-live="polite">{images.length}/{MAX_IMAGES} images</span>
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-3">
        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={handlePublish}
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Publishing…" : "Publish Listing"}
        </button>
      </div>

      {/* Ad */}
      <div className="mt-6 mb-4">
        <AdBanner />
      </div>
    </div>
  );
}
