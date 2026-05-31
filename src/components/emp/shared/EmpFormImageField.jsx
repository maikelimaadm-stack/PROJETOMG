import React from "react";
import { Image } from "lucide-react";

export default function EmpFormImageField({
  value = "",
  readOnly = false,
  uploading = false,
  accept = "image/*",
  onUpload,
  onClear,
  alt = "Imagem"
}) {
  const hasImage = Boolean(value);

  return (
    <div className="emp-form-image-field relative flex h-full w-full items-center justify-center">
      {hasImage ? (
        <img src={value} alt={alt} className="max-h-[20px] max-w-[calc(100%-8px)] object-contain" />
      ) : (
        <Image className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
      )}

      {!readOnly && (
        <label className={`absolute inset-0 ${uploading ? "cursor-wait" : "cursor-pointer"}`} title={hasImage ? "Trocar imagem" : "Selecionar imagem"}>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>
      )}

      {!readOnly && hasImage && onClear && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClear();
          }}
          className="absolute right-0.5 top-0.5 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-white text-[9px] leading-none text-red-500 ring-1 ring-slate-200"
          title="Remover imagem"
          aria-label="Remover imagem"
        >
          ×
        </button>
      )}
    </div>
  );
}
