import React, { useRef, useState } from "react";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Plus, X, ExternalLink, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/shared/feedback";
import {
  EMP_CONFIG_DIALOG_CLOSE_BUTTON,
  EMP_CONFIG_DIALOG_CLOSE_ROW,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_FIELD_WRAP,
  EMP_CONFIG_DIALOG_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL,
  EMP_CONFIG_DIALOG_TABLE_WRAP,
  EMP_CONFIG_DIALOG_TOOLBAR,
  EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN,
} from "@/framework/cadastro/styles/empConfigDialogStyles";
import EmpBubbleCounter from "@/framework/cadastro/toolbars/EmpBubbleCounter";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/framework/cadastro/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

const formatSize = (bytes = 0) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function RegistroAnexosDialog({ open, onOpenChange, entityName, recordId, title, pendingAnexos = [], onPendingChange }) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const queryKey = ["registro-anexos", entityName, recordId];

  const { data: savedAnexos = [] } = useQuery({
    queryKey,
    queryFn: () => AnexosApi.list(entityName, recordId),
    enabled: open && !!entityName && !!recordId,
    initialData: []
  });

  const anexos = recordId ? savedAnexos : pendingAnexos;

  const deleteMutation = useMutation({
    mutationFn: (id) => AnexosApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      showSuccess("Anexo removido.");
    }
  });

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!attachmentName.trim()) {
      showError("Informe o nome do arquivo antes de anexar.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    const novosAnexos = [];
    for (const file of files) {
      const { file_url, storage_path } = await AnexosApi.uploadFile(file);
      const anexoData = {
        entity_name: entityName,
        record_id: recordId,
        empresa_id: entityName === "EmpresaCadastro" ? recordId : undefined,
        attachment_name: attachmentName.trim(),
        file_name: file.name,
        file_url,
        storage_path,
        file_type: file.type,
        file_size: file.size
      };
      if (recordId) {
        await AnexosApi.create(anexoData);
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
    showSuccess(files.length === 1 ? "Arquivo anexado." : "Arquivos anexados.");
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange(nextOpen)}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()} onEscapeKeyDown={(event) => event.preventDefault()} className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[760px]`}>
        <DialogTitle className="sr-only">Anexos</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button type="button" onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_CLOSE_BUTTON} title="Fechar" aria-label="Fechar">
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

          <EmpSplitToolbarLayout
            toolbar={
              <div className={EMP_CONFIG_DIALOG_TOOLBAR}>
                <ToolbarBtn onClick={() => inputRef.current?.click()} disabled={uploading || !attachmentName.trim()} className={`${EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} emp-toolbar-btn-new`} title="Anexar arquivo">
                  {uploading ? <Loader2 className="emp-toolbar-action-icon h-3.5 w-3.5 animate-spin" /> : <EmpToolbarIcon icon={Plus} strokeWidth={2.5} />}
                  <span>Anexar</span>
                </ToolbarBtn>
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <EmpBubbleCounter value={String(anexos.length)} title="Total de anexos" className="emp-toolbar-bubble-counter" />
                </div>
              </div>
            }
          >
          <EmpToolbarInfoBar badgeLabel="Anexos" title={title || "Lote"} operationLabel="Configuração" className="!border-b-[0.5px]" />

          <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
            <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
              <CardContent className="p-0">
                <div className="grid grid-cols-[210px_minmax(0,1fr)] items-center border-b-[0.5px] border-[#c5ced8] px-1 py-1">
                  <label className="pr-2 text-right text-xs font-semibold text-[#1a1f26]">
                    Nome do arquivo:<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <Input
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="EX: CONTRATO, NOTA FISCAL, GTA..."
                    className={`${EMP_CONFIG_FIELD_WRAP} uppercase`}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>

                <div className="max-h-80 erp-scroll-y overflow-y-auto">
                  <div className="grid grid-cols-[1fr_1.4fr_28px] bg-white border-b-[0.5px] border-[#c5ced8] text-xs font-semibold text-[#1a1f26]">
                    <div className="h-[26px] px-1 flex items-center border-r-[0.5px] border-[#c5ced8]">Nome do arquivo:</div>
                    <div className="h-[26px] px-1 flex items-center border-r-[0.5px] border-[#c5ced8]">Arquivo</div>
                    <div className="h-[26px] flex items-center justify-center"></div>
                  </div>
                  {anexos.length === 0 ?
                    <div className="p-6 text-center text-xs text-[#5b6b80]">Nenhum arquivo anexado.</div> :
                    anexos.map((anexo, index) => {
                      const rowClass = index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
                      return (
                        <div key={anexo.id} className={`grid grid-cols-[1fr_1.4fr_28px] items-center border-b-[0.5px] last:border-b-0 border-[#c5ced8] text-xs ${rowClass}`}>
                          <div className="h-[26px] px-1 flex items-center border-r-[0.5px] border-[#c5ced8] overflow-hidden">
                            <span className="truncate font-medium text-[#1a1f26]">{anexo.attachment_name || anexo.file_name}</span>
                          </div>
                          <a href={anexo.file_url} target="_blank" rel="noreferrer" className="h-[26px] min-w-0 flex items-center gap-1.5 text-[#5b6b80] hover:text-[#1a1f26] px-1 border-r-[0.5px] border-[#c5ced8] overflow-hidden">
                            <span className="truncate">{anexo.file_name}</span>
                            <span className="shrink-0 text-[#5b6b80]">{formatSize(anexo.file_size)}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          <div className="h-[26px] flex items-center justify-center overflow-hidden">
                            <Button type="button" variant="ghost" size="icon" className="emp-toolbar-btn h-[24px] w-[24px] rounded-[5px] border-0 bg-[#eaf2ff] text-[#334155] hover:bg-[#dde9fb] shadow-none p-0" onClick={() => recordId ? deleteMutation.mutate(anexo.id) : onPendingChange?.(pendingAnexos.filter((item) => item.id !== anexo.id))}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
          </EmpSplitToolbarLayout>
        </div>
      </DialogContent>
    </Dialog>);

}