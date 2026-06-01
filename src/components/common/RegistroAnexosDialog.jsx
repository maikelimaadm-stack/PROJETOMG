import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  EMP_CONFIG_DIALOG_BADGE,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_HEADER,
  EMP_CONFIG_DIALOG_ICON_BTN,
  EMP_CONFIG_DIALOG_TITLE,
} from "@/components/emp/dialogs/empConfigDialogStyles";

const formatSize = (bytes = 0) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const titleCase = (value) => String(value || "")
  .toLowerCase()
  .replace(/(^|\s)([a-záàâãéèêíóôõúç])/g, (match) => match.toUpperCase());

export default function RegistroAnexosDialog({ open, onOpenChange, entityName, recordId, title, pendingAnexos = [], onPendingChange }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const queryKey = ["registro-anexos", entityName, recordId];

  const { data: savedAnexos = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.RegistroAnexo.filter({ entity_name: entityName, record_id: recordId }, "-created_date"),
    enabled: open && !!entityName && !!recordId,
    initialData: []
  });

  const anexos = recordId ? savedAnexos : pendingAnexos;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RegistroAnexo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Anexo removido.");
    }
  });

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!attachmentName.trim()) {
      toast.error("Informe o nome do arquivo antes de anexar.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    const novosAnexos = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const anexoData = {
        entity_name: entityName,
        record_id: recordId,
        attachment_name: attachmentName.trim(),
        file_name: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size
      };
      if (recordId) {
        await base44.entities.RegistroAnexo.create(anexoData);
      } else {
        novosAnexos.push({ ...anexoData, id: `pending-${Date.now()}-${file.name}` });
      }
    }
    if (!recordId && novosAnexos.length) {
      onPendingChange?.([...pendingAnexos, ...novosAnexos]);
    }
    setUploading(false);
    setAttachmentName("");
    event.target.value = "";
    queryClient.invalidateQueries({ queryKey });
    toast.success(files.length === 1 ? "Arquivo anexado." : "Arquivos anexados.");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange(nextOpen)}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => event.preventDefault()} className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[760px] overflow-x-hidden overflow-y-auto [&>button:last-child]:hidden`}>
        <div className="space-y-1 p-1">
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
          <div className="border border-[#dce3eb] bg-white">
            <div className={EMP_CONFIG_DIALOG_HEADER}>
              <span className={`${EMP_CONFIG_DIALOG_BADGE} w-[90px]`}>Anexos</span>
              <span className={EMP_CONFIG_DIALOG_TITLE}>{title || "Lote"}</span>
              <Button type="button" onClick={() => onOpenChange(false)} title="Fechar" className={EMP_CONFIG_DIALOG_ICON_BTN}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-4 md:px-8 py-2 w-full space-y-1">
              <div className="grid items-center gap-1 grid-cols-[210px_minmax(0,1fr)]">
                <label className="text-[12px] text-[#1a1f26] text-right leading-none">
                  Nome do arquivo:<span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_28px] h-6 border-[0.5px] border-[#c5ced8] bg-white focus-within:border-[#21c45d] transition-colors overflow-hidden">
                  <Input
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="EX: CONTRATO, NOTA FISCAL, GTA..."
                    className="h-[22px] text-xs uppercase border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent px-1"
                    style={{ textTransform: "uppercase" }} />
                  
                  <Button type="button" variant="outline" size="icon" onClick={() => inputRef.current?.click()} disabled={uploading || !attachmentName.trim()} className="h-[23px] w-7 rounded-none border-y-0 border-r-0 border-l-[0.5px] border-[#c5ced8] bg-white hover:bg-slate-50 text-slate-500 shadow-none p-0" title="Anexar arquivo">
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="border border-[#dce3eb] rounded-none max-h-80 overflow-auto bg-white">
            <div className="grid grid-cols-[1fr_1.4fr_28px] bg-white border-b border-[#dce3eb] text-[11px] font-semibold text-[#5b6b80]">
              <div className="px-2 py-1 border-r border-[#dce3eb]">Nome do arquivo:</div>
              <div className="px-2 py-1 border-r border-[#dce3eb]">Arquivo</div>
              <div className="h-7 flex items-center justify-center"></div>
            </div>
            {anexos.length === 0 ?
              <div className="p-6 text-center text-xs text-[#5b6b80]">Nenhum arquivo anexado.</div> :
              anexos.map((anexo) =>
              <div key={anexo.id} className="grid grid-cols-[1fr_1.4fr_28px] items-center border-b last:border-b-0 border-[#dce3eb] text-xs">
              <div className="h-7 px-2 flex items-center border-r border-[#dce3eb] overflow-hidden">
                <span className="truncate font-medium text-[#1a1f26]">{anexo.attachment_name || anexo.file_name}</span>
              </div>
              <a href={anexo.file_url} target="_blank" rel="noreferrer" className="h-7 min-w-0 flex items-center gap-1.5 text-[#1a1f26] hover:text-[#1a1f26] px-2 border-r border-[#dce3eb] overflow-hidden">
                <span className="truncate">{anexo.file_name}</span>
                <span className="shrink-0 text-slate-400">{formatSize(anexo.file_size)}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <div className="h-7 flex items-center justify-center overflow-hidden">
                <Button type="button" variant="ghost" size="icon" className="h-5 w-5 rounded-none border-0 bg-white text-slate-500 hover:bg-slate-50 shadow-none p-0" onClick={() => recordId ? deleteMutation.mutate(anexo.id) : onPendingChange?.(pendingAnexos.filter((item) => item.id !== anexo.id))}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

}