import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Checkbox } from "@/shared/ui/checkbox";
import { aplicacaoLabel, tipoLabel } from "@/modules/cadcps/config/cadcpsConstants";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
};

export default function TABCPS({
  items = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
}) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const sortableHead = (key, label) => (
    <TableHead
      className="emp-th cursor-pointer select-none"
      onClick={() => onSort?.(key)}
    >
      <span className="emp-th-label-wrap">
        {label}
        {sortBy === key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
      </span>
    </TableHead>
  );

  return (
    <div className="emp-table-shell flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <Table className="emp-table-pro w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="emp-th w-8">
              <Checkbox checked={allSelected} onCheckedChange={(v) => onToggleSelectAll?.(!!v)} />
            </TableHead>
            {sortableHead("codigo", "Código")}
            {sortableHead("nome", "Nome do Campo")}
            {sortableHead("tipo", "Tipo")}
            <TableHead className="emp-th">Tela</TableHead>
            <TableHead className="emp-th">Aplicação</TableHead>
            <TableHead className="emp-th">Qtd. Empresas</TableHead>
            <TableHead className="emp-th">Obrigatório</TableHead>
            {sortableHead("ativo", "Ativo")}
            {sortableHead("createdAt", "Criado Em")}
            {sortableHead("updatedAt", "Atualizado Em")}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="emp-td text-center text-xs text-slate-500">
                Nenhum campo encontrado.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const selected = selectedIds.includes(item.id);
              const telasLabel = (item.telas || []).map((t) => t.nome).join(", ") || "-";
              return (
                <TableRow
                  key={item.id}
                  className={selected ? "emp-row-selected" : ""}
                  onClick={(event) => onRowClick?.(item, event)}
                >
                  <TableCell className="emp-td w-8" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggleSelect?.(item.id)}
                    />
                  </TableCell>
                  <TableCell className="emp-td">{item.codigo}</TableCell>
                  <TableCell className="emp-td font-semibold">{item.nome}</TableCell>
                  <TableCell className="emp-td">{tipoLabel(item.tipo)}</TableCell>
                  <TableCell className="emp-td">{telasLabel}</TableCell>
                  <TableCell className="emp-td">
                    {aplicacaoLabel(item.aplicacao_modo, item.quantidade_empresas)}
                  </TableCell>
                  <TableCell className="emp-td">
                    {item.aplicacao_modo === "todas" ? "Todas" : item.quantidade_empresas ?? 0}
                  </TableCell>
                  <TableCell className="emp-td">{item.obrigatorio ? "Sim" : "Não"}</TableCell>
                  <TableCell className="emp-td">{item.ativo ? "Sim" : "Não"}</TableCell>
                  <TableCell className="emp-td">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="emp-td">{formatDate(item.updatedAt)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
