import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erp-anexos";

export const isSupabaseStorageConfigured = Boolean(url && serviceRoleKey);
export const supabaseBucketName = bucket;

export const supabaseAdmin = isSupabaseStorageConfigured
  ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
  : null;

let bucketReady = false;

export const ensureSupabaseStorageBucket = async () => {
  if (!supabaseAdmin || !isSupabaseStorageConfigured) {
    throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes");
  }
  if (bucketReady) return true;

  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    throw new Error(`Falha ao listar buckets Supabase: ${listError.message}`);
  }

  const exists = (buckets || []).some((item) => item.name === supabaseBucketName);
  if (!exists) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(supabaseBucketName, {
      public: true,
      fileSizeLimit: "20MB",
    });
    if (createError) {
      throw new Error(`Falha ao criar bucket ${supabaseBucketName}: ${createError.message}`);
    }
  }

  bucketReady = true;
  return true;
};

export const verifySupabaseStorageConnection = async () => {
  if (!supabaseAdmin || !isSupabaseStorageConfigured) {
    return { configured: false, connected: false, error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes" };
  }

  const { error } = await supabaseAdmin.storage.listBuckets();
  return {
    configured: true,
    connected: !error,
    error: error?.message || null,
  };
};
