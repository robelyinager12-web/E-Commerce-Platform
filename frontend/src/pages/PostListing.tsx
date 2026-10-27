import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../services/listing.service";
import { fetchCategories } from "../services/category.service";
import { uploadImages } from "../services/upload.service";
import { Category } from "../types/category.types";
import { useLanguage } from "../context/LanguageContext";
import { BoxField, BoxTextarea, PickerField } from "../components/common/BoxField";
import { CategoryPicker } from "../components/listing/CategoryPicker";
import { LocationPicker } from "../components/listing/LocationPicker";
import { PhotoItem, PhotoUploader } from "../components/listing/PhotoUploader";
import { ChevronDownIcon } from "../components/layout/Icons";
import { getErrorMessage } from "../utils/getErrorMessage";

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 2000;

type Picker = "category" | "location" | null;

export function PostListing() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [picker, setPicker] = useState<Picker>(null);

  // Step 1
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Step 2
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"new" | "used">("used");
  const [description, setDescription] = useState("");

  // "This field is required." appears once a field was visited and left empty (like jiji.com.et).
  const [touched, setTouched] = useState({ title: false, category: false, location: false });

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "posting">("idle");

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Release photo preview URLs when leaving the page.
  const photosRef = useRef<PhotoItem[]>([]);
  photosRef.current = photos;
  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
  }, []);

  const step1Valid = title.trim().length > 0 && categoryId !== "" && region !== "" && city !== "";
  const priceNumber = parseFloat(price);
  const step2Valid = price !== "" && Number.isFinite(priceNumber) && priceNumber >= 0;
  const isBusy = status !== "idle";

  function clearAll() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setTitle("");
    setCategoryId("");
    setCategoryLabel("");
    setRegion("");
    setCity("");
    setPhotos([]);
    setPrice("");
    setCondition("used");
    setDescription("");
    setError(null);
    setTouched({ title: false, category: false, location: false });
    setStep(1);
  }

  async function handleSubmit() {
    if (!step1Valid || !step2Valid || isBusy) return;
    setError(null);

    try {
      let imageUrls: string[] | undefined;
      if (photos.length > 0) {
        setStatus("uploading");
        imageUrls = await uploadImages(photos.map((p) => p.file));
      }

      setStatus("posting");
      const listing = await createListing({
        title: title.trim(),
        description: description.trim() || undefined,
        price: priceNumber,
        condition,
        region,
        city,
        categoryId,
        imageUrls,
      });
      navigate(`/listings/${listing.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("idle");
    }
  }

  const primaryButton =
    "h-10 w-full rounded-lg font-sans text-base font-bold transition-colors";
  const enabled = "bg-teal text-white hover:bg-teal-dark";
  const disabled = "cursor-not-allowed bg-form-btnoff text-form-btnofftext";

  return (
    <div className="min-h-[70vh] bg-form-bg px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header card: Post ad + Clear */}
        <div className="relative rounded-lg bg-white px-4 py-4 text-center">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              aria-label={t("postBack")}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full hover:bg-paper"
            >
              <ChevronDownIcon className="rotate-90" />
            </button>
          )}
          <h1 className="font-sans text-base font-medium text-ink">{t("postAd")}</h1>
          <button
            type="button"
            onClick={clearAll}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-sm font-medium text-form-clear hover:text-red-400"
          >
            {t("postClear")}
          </button>
        </div>

        {/* Form card */}
        <div className="mt-5 rounded-lg bg-white px-4 py-8 sm:px-8">
          <div className="mx-auto flex max-w-[400px] flex-col gap-4">
            {step === 1 ? (
              <>
                <div className="mt-2">
                  <BoxField
                    id="post-title"
                    label={t("postTitle")}
                    required
                    value={title}
                    maxLength={TITLE_MAX}
                    counter={`${title.length} / ${TITLE_MAX}`}
                    error={touched.title && title.trim() === "" ? t("postRequired") : undefined}
                    onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <PickerField
                  label={t("postCategory")}
                  required
                  value={categoryLabel}
                  error={touched.category && !categoryId ? t("postRequired") : undefined}
                  onClick={() => setPicker("category")}
                />

                <PickerField
                  label={t("postLocation")}
                  required
                  value={region && city ? `${city}, ${region}` : ""}
                  disabled={!categoryId}
                  error={touched.location && !region ? t("postRequired") : undefined}
                  onClick={() => setPicker("location")}
                />

                <div className="mt-2">
                  <PhotoUploader photos={photos} onChange={setPhotos} />
                </div>

                <button
                  type="button"
                  disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  className={`${primaryButton} ${step1Valid ? enabled : disabled}`}
                >
                  {t("postNext")}
                </button>
              </>
            ) : (
              <>
                <BoxField
                  id="post-price"
                  label={t("postPrice")}
                  required
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <div>
                  <p className="mb-2 font-sans text-sm text-form-label">{t("postCondition")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["new", "used"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCondition(value)}
                        aria-pressed={condition === value}
                        className={`h-14 rounded-lg border font-sans text-base transition-colors ${
                          condition === value
                            ? "border-teal bg-teal-light text-teal-dark"
                            : "border-form-border text-form-label hover:border-teal"
                        }`}
                      >
                        {value === "new" ? t("postNew") : t("postUsed")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <BoxTextarea
                    id="post-description"
                    label={t("postDescription")}
                    value={description}
                    maxLength={DESCRIPTION_MAX}
                    counter={`${description.length} / ${DESCRIPTION_MAX}`}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {error && <p className="font-sans text-sm text-red-600">{error}</p>}

                <button
                  type="button"
                  disabled={!step2Valid || isBusy}
                  onClick={handleSubmit}
                  className={`${primaryButton} ${step2Valid && !isBusy ? enabled : disabled}`}
                >
                  {status === "uploading"
                    ? t("postUploading")
                    : status === "posting"
                      ? t("postPosting")
                      : t("postAd")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {picker === "category" && (
        <CategoryPicker
          categories={categories}
          onClose={() => {
            setTouched((prev) => ({ ...prev, category: true }));
            setPicker(null);
          }}
          onSelect={(id, label) => {
            setCategoryId(id);
            setCategoryLabel(label);
            setPicker(null);
          }}
        />
      )}

      {picker === "location" && (
        <LocationPicker
          onClose={() => {
            setTouched((prev) => ({ ...prev, location: true }));
            setPicker(null);
          }}
          onSelect={(selectedRegion, selectedCity) => {
            setRegion(selectedRegion);
            setCity(selectedCity);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}