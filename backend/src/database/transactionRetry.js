const RETRYABLE_CODES = new Set(["P2034"]);

const isRetryableMessage = (message = "") => {
  const lower = String(message).toLowerCase();
  return (
    lower.includes("deadlock") ||
    lower.includes("write conflict") ||
    lower.includes("could not serialize") ||
    lower.includes("serialization failure")
  );
};

export const isRetryableTransactionError = (error) => {
  const code = String(error?.code || "");
  if (code === "P2028") return false;
  if (RETRYABLE_CODES.has(code)) return true;
  return isRetryableMessage(error?.message || "");
};

export const runTransactionWithRetry = async (
  prisma,
  operation,
  { attempts = 8, maxWait = 10_000, timeout = 30_000 } = {}
) => {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await prisma.$transaction((tx) => operation(tx), { maxWait, timeout });
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionError(error) || attempt >= attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }

  throw lastError || new Error("Falha na transação com retry.");
};
