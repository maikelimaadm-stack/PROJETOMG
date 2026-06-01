import { anexoRepository } from "../repositories/anexoRepository.js";
import { isSupabaseStorageConfigured, supabaseAdmin, supabaseBucketName } from "../../../integrations/supabase/adminClient.js";

const toDataUrl = (buffer, mimeType = "application/octet-stream") =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;

export const anexoService = {
  list(filters) {
    return anexoRepository.list(filters);
  },

  create(data) {
    return anexoRepository.create(data);
  },

  remove(id) {
    return anexoRepository.remove(id);
  },

  async uploadFile({ filename, mimeType, buffer }) {
    if (!buffer) throw new Error("Arquivo inválido para upload");

    if (isSupabaseStorageConfigured && supabaseAdmin) {
      const objectPath = `${Date.now()}-${filename}`;
      const { error } = await supabaseAdmin.storage
        .from(supabaseBucketName)
        .upload(objectPath, buffer, {
          contentType: mimeType || "application/octet-stream",
          upsert: false,
        });

      if (!error) {
        const { data } = supabaseAdmin.storage.from(supabaseBucketName).getPublicUrl(objectPath);
        return { file_url: data.publicUrl, provider: "supabase" };
      }
    }

    // Fallback local para ambientes sem Storage configurado.
    return { file_url: toDataUrl(buffer, mimeType), provider: "local-data-url" };
  },
};
