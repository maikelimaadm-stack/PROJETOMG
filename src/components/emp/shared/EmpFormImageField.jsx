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
  emptyLabel = "Nenhuma imagem selecionada"
}) {
  const hasImage = Boolean(value);

  return (
    <div className="emp-form-image-field relative h-full w-full">
      {hasImage ? (
        <div className="flex h-full w-full items-center px-1.5 py-1">
          <div className="emp-form-image-thumb relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#d1d5db] bg-white">
            <img src={value} alt={alt} className="h-full w-full object-contain p-1" />
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center gap-2 px-2">
          <Image className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate text-[11px] leading-none text-slate-500">{uploading ? "Enviando imagem..." : emptyLabel}</span>
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
          className="absolute right-1 top-1 z-[2] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[10px] leading-none text-red-500 ring-1 ring-slate-200"
          title="Remover imagem"
          aria-label="Remover imagem"
        >
          ×
        </button>
      )}
    </div>
  );
}
