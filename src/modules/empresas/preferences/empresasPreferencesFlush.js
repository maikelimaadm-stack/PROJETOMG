let activeFlushHandler = null;

export const registerEmpPreferencesFlushHandler = (handler) => {
  activeFlushHandler = typeof handler === "function" ? handler : null;
};

export const flushEmpPreferencesNow = async () => {
  if (!activeFlushHandler) return;
  await activeFlushHandler();
};
