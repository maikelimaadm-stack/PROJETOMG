import { anexoRepository } from "../repositories/anexoRepository.js";
import {
  createSignedDownloadUrl,
  ensureSupabaseStorageBucket,
  isSupabaseStorageConfigured,
  supabaseAdmin,
  supabaseBucketName,
} from "../../../integrations/supabase/adminClient.js";

const hasPdfSignature = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x25 &&
  buffer[1] === 0x50 &&
  buffer[2] === 0x44 &&
  buffer[3] === 0x46;

const hasPngSignature = (buffer) =>
  buffer.length >= 8 &&
  buffer[0] === 0x89 &&
  buffer[1] === 0x50 &&
  buffer[2] === 0x4e &&
  buffer[3] === 0x47 &&
  buffer[4] === 0x0d &&
  buffer[5] === 0x0a &&
  buffer[6] === 0x1a &&
  buffer[7] === 0x0a;

const hasJpegSignature = (buffer) =>
  buffer.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

const hasWebpSignature = (buffer) =>
  buffer.length >= 12 &&
  buffer[0] === 0x52 &&
  buffer[1] === 0x49 &&
  buffer[2] === 0x46 &&
  buffer[3] === 0x46 &&
  buffer[8] === 0x57 &&
  buffer[9] === 0x45 &&
  buffer[10] === 0x42 &&
  buffer[11] === 0x50;

const hasZipSignature = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x50 &&
  buffer[1] === 0x4b &&
  buffer[2] === 0x03 &&
  buffer[3] === 0x04;

const hasOleSignature = (buffer) =>
  buffer.length >= 8 &&
  buffer[0] === 0xd0 &&
  buffer[1] === 0xcf &&
  buffer[2] === 0x11 &&
  buffer[3] === 0xe0 &&
  buffer[4] === 0xa1 &&
  buffer[5] === 0xb1 &&
  buffer[6] === 0x1a &&
  buffer[7] === 0xe1;

const ensureMimeMatchesContent = ({ buffer, mimeType, filename }) => {
  const normalizedMime = String(mimeType || "").toLowerCase();
  const fileName = String(filename || "").toLowerCase();
  if (normalizedMime === "application/pdf" && !hasPdfSignature(buffer)) return false;
  if (normalizedMime === "image/png" && !hasPngSignature(buffer)) return false;
  if (normalizedMime === "image/jpeg" && !hasJpegSignature(buffer)) return false;
  if (normalizedMime === "image/webp" && !hasWebpSignature(buffer)) return false;
  if (normalizedMime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    return hasZipSignature(buffer) && fileName.endsWith(".xlsx");
  }
  if (normalizedMime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return hasZipSignature(buffer) && fileName.endsWith(".docx");
  }
  if (normalizedMime === "application/msword") {
    return hasOleSignature(buffer) && fileName.endsWith(".doc");
  }
  if (normalizedMime === "application/vnd.ms-excel") {
    return hasOleSignature(buffer) && fileName.endsWith(".xls");
  }
  return true;
};

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
    if (!ensureMimeMatchesContent({ buffer, mimeType: safeMimeType, filename })) {
      throw new Error("Conteúdo do arquivo não corresponde ao tipo informado.");
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
