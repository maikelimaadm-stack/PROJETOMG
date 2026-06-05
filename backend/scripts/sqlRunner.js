/**
 * Divide SQL em statements respeitando blocos DO $$ ... END $$;
 * (split simples por ";" quebra PL/pgSQL e causa falha no deploy)
 */
export const splitSqlStatements = (sql) => {
  const cleaned = sql.replace(/--[^\n]*/g, "");
  const statements = [];
  let buffer = "";
  let inDollarBlock = false;

  for (const line of cleaned.split("\n")) {
    const trimmed = line.trim();

    if (!inDollarBlock && /^DO\s+\$\$/i.test(trimmed)) {
      inDollarBlock = true;
    }

    buffer += `${line}\n`;

    if (inDollarBlock) {
      if (/END\s+\$\$\s*;?\s*$/i.test(trimmed)) {
        statements.push(buffer.trim());
        buffer = "";
        inDollarBlock = false;
      }
      continue;
    }

    if (trimmed.endsWith(";")) {
      statements.push(buffer.trim());
      buffer = "";
    }
  }

  if (buffer.trim()) {
    statements.push(buffer.trim());
  }

  return statements.filter(Boolean);
};

export const IGNORED_SQL_ERROR_CODES = new Set(["42P07", "42710", "42P16", "42701"]);

export const runSqlStatement = async (prisma, statement, options = {}) => {
  const { ignoreMissingDrop = true } = options;
  try {
    await prisma.$executeRawUnsafe(statement.endsWith(";") ? statement : `${statement};`);
  } catch (error) {
    const code = error?.code || error?.meta?.code;
    if (IGNORED_SQL_ERROR_CODES.has(code)) return;
    const message = String(error?.message || "");
    if (message.includes("already exists")) return;
    if (ignoreMissingDrop && message.includes("does not exist") && message.includes("DROP")) return;
    throw error;
  }
};

export const runSqlFile = async (prisma, filePath, fs) => {
  const sql = fs.readFileSync(filePath, "utf8");
  const statements = splitSqlStatements(sql);
  for (const statement of statements) {
    await runSqlStatement(prisma, statement);
  }
  return statements.length;
};
