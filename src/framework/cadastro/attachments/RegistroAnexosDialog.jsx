import React, { useRef, useState } from "react";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Plus, X } from "lucide-react";
import { showSuccess, showError } from "@/shared/feedback";
import {
  EmpConfigDialogFrame,
  EmpConfigListTable,
  EmpConfigGhostIconBtn,
  EmpConfigPlainIconBtn,
  EMP_CONFIG_LIST_DIALOG_CLASS,
} from "@/framework/cadastro/configurators/EmpConfigDialogKit";

const formatSize = (bytes = 0) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function RegistroAnexosDialog({
  open,
  onOpenChange,
  entityName,
  recordId,
  title,
  pendingAnexos = [],
  onPendingChange,
}) {
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const queryKey = ["registro-anexos", entityName, recordId];

  const { data: savedAnexos = [] } = useQuery({
    queryKey,
    queryFn: () => AnexosApi.list(entityName, recordId),
    enabled: open && !!entityName && !!recordId,
    initialData: [],
  });

  const anexos = recordId ? savedAnexos : pendingAnexos;

  const deleteMutation = useMutation({
    mutationFn: (id) => AnexosApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      showSuccess("Anexo removido.");
    },
  });

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!attachmentName.trim()) {
      showError("Informe o nome do anexo antes de anexar.");
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
        file_size: file.size,
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
    <EmpConfigDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      title={`Anexos - ${title || "Lote"}`}
      badgeLabel="Anexos"
      infoTitle={title || "Lote"}
      dialogClassName={EMP_CONFIG_LIST_DIALOG_CLASS}
    >
      <EmpConfigListTable
        tableVariant="launch"
        formRow={{
          variant: "launch",
          fieldName: "attachment-name",
          fieldClassName: "emp-config-anexos-field",
          label: "Nome do anexo",
          required: true,
          hasValue: Boolean(attachmentName.trim()),
          control: (
            <div className="emp-config-anexos-field__surface">
              <input
                type="text"
                className="emp-config-anexos-field__input"
                value={attachmentName}
                onChange={(event) => setAttachmentName(event.target.value)}
                placeholder=" "
              />
              <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
              <EmpConfigGhostIconBtn
                className="emp-config-anexos-attach-btn"
                onClick={() => inputRef.current?.click()}
                disabled={uploading || !attachmentName.trim()}
                title="Anexar arquivo"
                aria-label="Anexar arquivo"
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.2} />
                ) : (
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                )}
              </EmpConfigGhostIconBtn>
            </div>
          ),
        }}
        columns={[
          { key: "name", label: "Nome do anexo", width: "1fr", tableWidth: "38%" },
          { key: "file", label: "Arquivo", width: "1.4fr", tableWidth: "calc(62% - 36px)" },
          { key: "action", label: "", width: "36px", tableWidth: "36px", align: "center" },
        ]}
        emptyMessage="Nenhum arquivo anexado."
        rows={anexos.map((anexo) => ({
          key: anexo.id,
          cells: [
            anexo.attachment_name || anexo.file_name,
            <a
              key="file"
              href={anexo.file_url}
              target="_blank"
              rel="noreferrer"
              className="emp-config-list-table__link flex min-w-0 items-center gap-1.5 text-inherit no-underline"
            >
              <span className="truncate">{anexo.file_name}</span>
              {anexo.file_size ? (
                <span className="shrink-0 text-[#94a3b8]">{formatSize(anexo.file_size)}</span>
              ) : null}
              <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
            </a>,
            <div key="action" className="emp-config-list-table__action flex w-full items-center justify-center">
              <EmpConfigPlainIconBtn
                className="emp-config-anexos-remove-btn"
                onClick={() =>
                  recordId
                    ? deleteMutation.mutate(anexo.id)
                    : onPendingChange?.(pendingAnexos.filter((item) => item.id !== anexo.id))
                }
                title="Remover anexo"
                aria-label="Remover anexo"
              >
                <X className="h-3 w-3" />
              </EmpConfigPlainIconBtn>
            </div>,
          ],
        }))}
      />
    </EmpConfigDialogFrame>
  );
}
