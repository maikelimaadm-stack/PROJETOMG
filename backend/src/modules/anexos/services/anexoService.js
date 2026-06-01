import { anexoRepository } from "../repositories/anexoRepository.js";
import { isSupabaseStorageConfigured, supabaseAdmin, supabaseBucketName } from "../../../integrations/supabase/adminClient.js";

export const anexoService = {
  list(filters) {
    return anexoRepository.list(filters);
  },

  create(data, tenantId) {
    return anexoRepository.create(data, tenantId);
  },

  remove(id, tenantId) {
    return anexoRepository.remove(id, tenantId);
  },

  async uploadFile({ filename, mimeType, buffer, tenantId = "default" }) {
    if (!buffer) throw new Error("Arquivo inválido para upload");

    if (!isSupabaseStorageConfigured || !supabaseAdmin) {
      throw new Error("Supabase Storage não configurado no backend/.env");
    }

    const objectPath = `${tenantId}/${Date.now()}-${filename}`;
    const { error } = await supabaseAdmin.storage
      .from(supabaseBucketName)
      .upload(objectPath, buffer, {
        contentType: mimeType || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha no upload Supabase: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(supabaseBucketName).getPublicUrl(objectPath);
    return { file_url: data.publicUrl, provider: "supabase" };
  },
};
