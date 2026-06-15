import React, { memo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/shared/ui/table";
import { EMP_TABLE_ROW_HEIGHT } from "@/shared/constants/erpLayout";
import { useTableVirtualizer } from "@/shared/hooks/useTableVirtualizer";

/**
 * Corpo virtual de tabela — posicionamento absoluto para scrollbar 1:1 com o conteúdo.
 */
function EmpVirtualTableBody({
  scrollRef,
  rows,
  enabled = true,
  totalTableWidth,
  bodyTableClass,
  colGroup = null,
  tableHeader = null,
  colCount = 1,
  renderRow,
  getRowClassName,
  onRowClick,
}) {
  const { virtualItems, totalSize } = useTableVirtualizer({
    scrollRef,
    count: rows.length,
    estimateSize: EMP_TABLE_ROW_HEIGHT,
    enabled: enabled && rows.length > 0,
  });

  if (!enabled || rows.length === 0) return null;

  if (tableHeader) {
    const firstVirtualRow = virtualItems[0];
    const lastVirtualRow = virtualItems[virtualItems.length - 1];
    const paddingTop = firstVirtualRow?.start ?? 0;
    const paddingBottom = lastVirtualRow ? Math.max(0, totalSize - lastVirtualRow.end) : 0;

    return (
      <Table
        style={{ width: totalTableWidth, minWidth: totalTableWidth }}
        className={bodyTableClass}
      >
        {colGroup}
        {tableHeader}
        <TableBody>
          {paddingTop > 0 ? (
            <TableRow className="emp-table-virtual-spacer-row border-0 hover:bg-transparent">
              <TableCell
                colSpan={colCount}
                className="border-0 p-0"
                style={{ height: paddingTop, padding: 0 }}
              />
            </TableRow>
          ) : null}
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <TableRow
                key={virtualRow.key}
                data-index={virtualRow.index}
                className={`emp-table-data-row ${getRowClassName?.(row, virtualRow.index) ?? ""} cursor-pointer select-none hover:brightness-[0.98]`}
                style={{ height: EMP_TABLE_ROW_HEIGHT, maxHeight: EMP_TABLE_ROW_HEIGHT }}
                onClick={(event) => onRowClick?.(row, event)}
              >
                {renderRow(row, virtualRow.index)}
              </TableRow>
            );
          })}
          {paddingBottom > 0 ? (
            <TableRow className="emp-table-virtual-spacer-row border-0 hover:bg-transparent">
              <TableCell
                colSpan={colCount}
                className="border-0 p-0"
                style={{ height: paddingBottom, padding: 0 }}
              />
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    );
  }

  return (
    <div
      className="emp-table-virtual-body"
      style={{
        height: totalSize,
        position: "relative",
        width: totalTableWidth,
        minWidth: totalTableWidth,
      }}
    >
      {virtualItems.map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            className="emp-table-virtual-row-wrap"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: totalTableWidth,
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Table
              style={{ width: totalTableWidth, minWidth: totalTableWidth }}
              className={bodyTableClass}
            >
              {colGroup}
              <TableBody>
                <TableRow
                  data-index={virtualRow.index}
                  className={`emp-table-data-row ${getRowClassName?.(row, virtualRow.index) ?? ""} cursor-pointer select-none hover:brightness-[0.98]`}
                  style={{ height: EMP_TABLE_ROW_HEIGHT, maxHeight: EMP_TABLE_ROW_HEIGHT }}
                  onClick={(event) => onRowClick?.(row, event)}
                >
                  {renderRow(row, virtualRow.index)}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}

export default memo(EmpVirtualTableBody);
