import { getPrismaClient } from "../../../database/prismaClient.js";

const EXPORT_BATCH_SIZE = 500;
const CSV_BOM = "\uFEFF";
const KEYSET_SORT_FIELDS = new Set(["codempresa", "id_global"]);

const escapeCsvCell = (value) => {
  const text = value == null ? "" : String(value);
  if (/[",;\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const formatCsvRow = (cells) => cells.map(escapeCsvCell).join(";");

export const streamEmpresasExport = async ({
  reply,
  scope,
  empresaRepository,
  query = {},
}) => {
  const prisma = getPrismaClient();
  const format = String(query.format || "csv").toLowerCase() === "excel" ? "excel" : "csv";
  const search = query.search || "";
  const sortBy = query.sortBy || "codempresa";
  const sortDir = query.sortDir || "asc";
  let filters = {};
  if (query.filters) {
    try {
      filters = typeof query.filters === "string" ? JSON.parse(query.filters) : query.filters;
    } catch {
      filters = {};
    }
  }

  if (query.ids) {
    const ids = String(query.ids)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      filters = { ...filters, ids };
    }
  }

  const where = await empresaRepository.buildListWhere(prisma, scope, { search, filters });
  const orderBy = empresaRepository.resolveOrderBy(sortBy, sortDir);
  const [sortField] = Object.keys(orderBy);
  const sortDirection = orderBy[sortField] === "desc" ? "desc" : "asc";
  const supportsKeyset = KEYSET_SORT_FIELDS.has(sortField);
  const columns = empresaRepository.EXPORT_COLUMNS;

  const extension = format === "excel" ? "xls" : "csv";
  const contentType =
    format === "excel"
      ? "application/vnd.ms-excel; charset=utf-8"
      : "text/csv; charset=utf-8";

  reply.raw.writeHead(200, {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="empresas-${new Date().toISOString().slice(0, 10)}.${extension}"`,
    "Cache-Control": "no-store",
  });

  reply.raw.write(CSV_BOM);
  reply.raw.write(`${formatCsvRow(columns.map((col) => col.label))}\n`);

  const maxRows = empresaRepository.MAX_EXPORT_ROWS;
  let skip = 0;
  let exported = 0;
  let hasMore = true;
  let keysetCursor = null;

  const buildKeysetWhere = () => {
    if (!supportsKeyset || !keysetCursor) return where;
    const comparator = sortDirection === "desc" ? "lt" : "gt";
    return {
      AND: [
        where,
        {
          OR: [
            { [sortField]: { [comparator]: keysetCursor.value } },
            {
              AND: [
                { [sortField]: keysetCursor.value },
                { id: { [comparator]: keysetCursor.id } },
              ],
            },
          ],
        },
      ],
    };
  };

  while (hasMore && exported < maxRows) {
    const take = Math.min(EXPORT_BATCH_SIZE, maxRows - exported);
    const batch = await prisma.empresa.findMany({
      where: buildKeysetWhere(),
      orderBy: supportsKeyset ? [{ [sortField]: sortDirection }, { id: sortDirection }] : orderBy,
      ...(supportsKeyset ? {} : { skip }),
      take,
      select: empresaRepository.EXPORT_SELECT,
    });

    if (batch.length === 0) break;

    for (const row of batch) {
      const cells = columns.map((col) => col.getValue(row));
      reply.raw.write(`${formatCsvRow(cells)}\n`);
      exported += 1;
      if (exported >= maxRows) break;
    }

    if (supportsKeyset) {
      const lastRow = batch[batch.length - 1];
      keysetCursor = lastRow
        ? {
            value: lastRow[sortField],
            id: lastRow.id,
          }
        : keysetCursor;
    } else {
      skip += batch.length;
    }
    hasMore = batch.length === take && exported < maxRows;
  }

  reply.raw.end();
};
