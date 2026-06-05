import React, { useMemo } from "react";
import { Image, Loader2 } from "lucide-react";

export default function EmpFormImageField({
  value = "",
  readOnly = false,
  uploading = false,
  accept = "image/*",
  onUpload,
  onClear,
  alt = "Imagem",
}) {
  const hasImage = Boolean(value);
  const captureMode = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return window.matchMedia("(max-width: 640px)").matches ? "environment" : undefined;
  }, []);

  return (
    <div className="emp-form-image-field emp-form-image-field-corp relative h-full w-full min-h-0">
      {hasImage ? (
        <div className="flex h-full w-full items-center justify-center p-1.5">
          <div className="emp-form-image-thumb relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[6px] border border-[#d1d5db] bg-white">
            <img
              src={value}
              alt={alt}
              className={`max-h-full max-w-full object-contain p-0.5 ${uploading ? "opacity-40" : ""}`}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            className="emp-form-image-empty-icon emp-form-image-empty-icon-corp shrink-0 text-[#64748b]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      )}

      {uploading ? (
        <div
          className="absolute inset-0 z-[3] flex items-center justify-center rounded-[6px] bg-white/70"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-5 w-5 animate-spin text-[#2899f5]" aria-hidden="true" />
          <span className="sr-only">Enviando imagem...</span>
        </div>
      ) : null}

      {!readOnly && (
        <label
          className={`absolute inset-0 z-[1] ${uploading ? "cursor-wait pointer-events-none" : "cursor-pointer"}`}
          title={uploading ? "Enviando imagem..." : hasImage ? "Trocar imagem" : "Selecionar imagem"}
        >
          <input
            type="file"
            accept={accept}
            capture={captureMode}
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      )}

      {!readOnly && hasImage && onClear && !uploading ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClear();
          }}
          className="absolute right-1 top-1 z-[2] flex h-4 w-4 items-center justify-center rounded-full bg-white text-[11px] leading-none text-red-500 ring-1 ring-slate-200"
          title="Remover imagem"
          aria-label="Remover imagem"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
