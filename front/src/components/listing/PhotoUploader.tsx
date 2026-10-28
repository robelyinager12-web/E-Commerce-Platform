import { DragEvent, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { CloseIcon, PlusIcon, StarIcon } from "../layout/Icons";

export interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const MAX_PHOTOS = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setMessage(null);

    const added: PhotoItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setMessage(t("postErrType"));
        continue;
      }
      if (file.size > MAX_BYTES) {
        setMessage(t("postErrSize"));
        continue;
      }
      if (photos.length + added.length >= MAX_PHOTOS) {
        setMessage(t("postMaxPhotos"));
        break;
      }
      added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, previewUrl: URL.createObjectURL(file) });
    }

    if (added.length > 0) onChange([...photos, ...added]);
    if (inputRef.current) inputRef.current.value = ""; // allow re-picking the same file
  }

  function remove(id: string) {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
    setMessage(null);
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function onDrop(e: DragEvent, to: number) {
    e.preventDefault();
    if (dragIndex !== null) move(dragIndex, to);
    setDragIndex(null);
  }

  return (
    <div>
      <h3 className="font-sans text-base font-medium text-form-heading">{t("postAddPhoto")}</h3>
      <p className="mt-3 font-sans text-sm text-form-hint">
        <span className="text-form-ok">{t("postFirstPicture")}</span> {t("postDragHint")}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={() => setDragIndex(null)}
            className={`group relative h-[72px] w-[72px] cursor-grab overflow-hidden rounded-xl border border-hairline bg-paper ${
              dragIndex === index ? "opacity-40" : ""
            }`}
          >
            <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" draggable={false} />

            {index === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-teal/90 py-0.5 text-center font-sans text-[10px] text-white">
                {t("postTitlePhoto")}
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(photo.id)}
              aria-label={t("postRemovePhoto")}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
            >
              <CloseIcon width={12} height={12} />
            </button>

            {index > 0 && (
              <button
                type="button"
                onClick={() => move(index, 0)}
                aria-label={t("postMakeTitle")}
                title={t("postMakeTitle")}
                className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white hover:bg-ink"
              >
                <StarIcon />
              </button>
            )}
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={t("postAddPhoto")}
            className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-form-tile text-form-tileicon transition-colors hover:bg-teal-light"
          >
            <PlusIcon width={26} height={26} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {message && <p className="mt-3 font-sans text-sm text-red-600">{message}</p>}
      <p className="mt-4 font-sans text-sm text-form-hint">{t("postFormats")}</p>
    </div>
  );
}