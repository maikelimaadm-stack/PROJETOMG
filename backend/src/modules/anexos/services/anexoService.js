import { anexoRepository } from "../repositories/anexoRepository.js";
import {
  createSignedDownloadUrl,
  ensureSupabaseStorageBucket,
  isSupabaseStorageConfigured,
  supabaseAdmin,
  supabaseBucketName,
} from "../../../integrations/supabase/adminClient.js";

export const anexoService = {
  async list(filters) {
    const items = await anexoRepository.list(filters);
    const withSignedUrl = await Promise.all(
      items.map(async (item) => {
        if (!item.storage_path) return item;
        const signedUrl = await createSignedDownloadUrl(item.storage_path);
        return {
          ...item,
          file_url: signedUrl || item.file_url,
        };
      })
    );
    return withSignedUrl;
  },

  create(data, scope) {
    return anexoRepository.create(data, scope);
  },

  remove(id, scope) {
    return anexoRepository.remove(id, scope);
  },

  async uploadFile({ filename, mimeType, buffer, scope }) {
    if (!buffer) throw new Error("Arquivo inválido para upload");
    if (!scope?.clienteId) throw new Error("Escopo de autenticação inválido para upload");

    const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 20 * 1024 * 1024);
    if (buffer.length > maxUploadBytes) {
      throw new Error(`Arquivo excede limite permitido (${maxUploadBytes} bytes).`);
    }

    const safeMimeType = String(mimeType || "application/octet-stream").toLowerCase();
    const allowedMimeTypes = new Set([
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    if (!allowedMimeTypes.has(safeMimeType)) {
      throw new Error("Tipo de arquivo não permitido.");
    }

    if (!isSupabaseStorageConfigured || !supabaseAdmin) {
      throw new Error("Supabase Storage não configurado no backend/.env");
    }

    await ensureSupabaseStorageBucket();

    const safeName = String(filename || "arquivo")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 180);
    const objectPath = `${scope.clienteId}/${scope.selectedEmpresaId || "all"}/${Date.now()}-${safeName}`;
    const { error } = await supabaseAdmin.storage
      .from(supabaseBucketName)
      .upload(objectPath, buffer, {
        contentType: safeMimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha no upload Supabase: ${error.message}`);
    }

    const { data: signedData } = await supabaseAdmin.storage
      .from(supabaseBucketName)
      .createSignedUrl(objectPath, 60 * 60);
    if (signedData?.signedUrl) {
      return {
        file_url: signedData.signedUrl,
        storage_path: objectPath,
        provider: "supabase-signed-url",
      };
    }

    const { data } = supabaseAdmin.storage.from(supabaseBucketName).getPublicUrl(objectPath);
    return { file_url: data.publicUrl, storage_path: objectPath, provider: "supabase-public-url" };
  },
};
