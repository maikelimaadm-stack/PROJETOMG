const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getColumnWidth = (columns, rows, totalRows, index) => {
  const values = [
    columns[index]?.label,
    ...rows.map((row) => row[index]),
    ...totalRows.map((row) => row[index]),
  ];
  const maxLength = values.reduce((max, value) => Math.max(max, String(value ?? "").length), 0);
  return Math.min(260, Math.max(70, maxLength * 7 + 18));
};

export function exportRowsToXlsx({ columns = [], rows = [], totalRows = [], title = "Exportar", fileName = "export" }) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default"><Font ss:FontName="Calibri" ss:Size="10"/></Style>
    <Style ss:ID="Title"><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/></Style>
    <Style ss:ID="Header"><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
    <Style ss:ID="Cell"><Font ss:FontName="Calibri" ss:Size="10"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
    <Style ss:ID="Total"><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
  </Styles>
  <Worksheet ss:Name="${escapeXml(title).slice(0, 31)}">
    <Table>
      ${columns.map((_, i) => `<Column ss:Width="${getColumnWidth(columns, rows, totalRows, i)}"/>`).join("")}
      <Row><Cell ss:MergeAcross="${Math.max(columns.length - 1, 0)}" ss:StyleID="Title"><Data ss:Type="String">${escapeXml(title)}</Data></Cell></Row>
      <Row>${columns.map((col) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>`).join("")}</Row>
      ${rows.map((row) => `<Row>${row.map((cell) => `<Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`).join("")}
      ${totalRows.map((row) => `<Row>${row.map((cell) => `<Cell ss:StyleID="Total"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}