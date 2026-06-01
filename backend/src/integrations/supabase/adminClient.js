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
