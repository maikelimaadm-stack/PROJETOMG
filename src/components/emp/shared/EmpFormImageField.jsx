import React from "react";
import { Image } from "lucide-react";

export default function EmpFormImageField({
  value = "",
  readOnly = false,
  uploading = false,
  accept = "image/*",
  onUpload,
  onClear,
  alt = "Imagem",
  emptyLabel = "Nenhuma Imagem",
}) {
  const hasImage = Boolean(value);

  return (
    <div className="emp-form-image-field relative h-full w-full">
      {hasImage ? (
        <div className="flex h-full w-full items-center justify-center p-1.5">
          <div className="emp-form-image-thumb relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[6px] border border-[#d1d5db] bg-white">
            <img src={value} alt={alt} className="max-h-full max-w-full object-contain p-0.5" />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 py-2 text-center">
          <Image className="h-5 w-5 shrink-0 text-[#64748b]" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-[12px] leading-tight text-[#334155]">{uploading ? "Enviando imagem..." : emptyLabel}</span>
        </div>
      )}

      {!readOnly && (
        <label className={`absolute inset-0 z-[1] ${uploading ? "cursor-wait" : "cursor-pointer"}`} title={hasImage ? "Trocar imagem" : "Selecionar imagem"}>
          <input type="file" accept={accept} className="hidden" onChange={onUpload} disabled={uploading} />
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
          className="absolute right-1 top-1 z-[2] flex h-4 w-4 items-center justify-center rounded-full bg-white text-[11px] leading-none text-red-500 ring-1 ring-slate-200"
          title="Remover imagem"
          aria-label="Remover imagem"
        >
          ×
        </button>
      )}
    </div>
  );
}
