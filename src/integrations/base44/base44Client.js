import { createClient } from '@base44/sdk';

const appId = import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID || "";
const serverUrl = import.meta.env.VITE_BASE44_SERVER_URL || "https://app.base44.com";
const token = import.meta.env.VITE_BASE44_TOKEN || "";
const functionsVersion = "v3";

const base44Client = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});

export const base44 = base44Client;