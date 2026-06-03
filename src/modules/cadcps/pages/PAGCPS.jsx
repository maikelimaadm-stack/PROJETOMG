import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/AuthContext";
import { exportCadastroTableToExcel, printCadastroTable } from "@/framework/cadastro/exports/tableExportUtils";
import repCps from "@/modules/cadcps/repositories/repCps";
import TABCPS from "@/modules/cadcps/components/TABCPS";
import FRMCPS from "@/modules/cadcps/components/FRMCPS";
import { CADCPS_TIPOS } from "@/modules/cadcps/config/cadcpsConstants";

const QUERY_KEY = ["cadcps-campos"];

export default function PAGCPS() {
  const { empresas } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [sort, setSort] = useState({ key: "codigo", dir: "asc" });
  const [filters, setFilters] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      search,
      sortBy: sort.key,
      sortDir: sort.dir,
      ...filters,
    }),
    [page, pageSize, search, sort, filters]
  );

  const { data: listData, isLoading } = useQuery({
    queryKey: [...QUERY_KEY, listParams],
    queryFn: () => repCps.listPage(listParams),
  });

  const { data: telas = [] } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
  });

  const items = listData?.items || [];

  const formulaFields = useMemo(
    () =>
      items
        .filter((c) => c.tipo !== "formula")
        .map((c) => ({ id: c.field_name, field_name: c.field_name, label: c.nome })),
    [items]
  );

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingItem?.id ? repCps.update(editingItem.id, payload) : repCps.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setShowForm(false);
      setEditingItem(null);
      toast.success("Campo salvo com sucesso.");
    },
    onError: (error) => {
      toast.error(error?.message || "Falha ao salvar campo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => repCps.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSelectedIds([]);
      toast.success("Campo excluído.");
    },
    onError: (error) => toast.error(error?.message || "Falha ao excluir."),
  });

  const handleSort = (key) => {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const exportRows = items.map((item) => ({
    Código: item.codigo,
    Nome: item.nome,
    Tipo: item.tipo,
    Telas: (item.telas || []).map((t) => t.nome).join(", "),
    Aplicação: item.aplicacao_modo,
    Empresas: item.quantidade_empresas ?? "Todas",
    Obrigatório: item.obrigatorio ? "Sim" : "Não",
    Ativo: item.ativo ? "Sim" : "Não",
    Criado: item.createdAt,
    Atualizado: item.updatedAt,
  }));

  return (
    <div className="cadastro-emp-scope flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#dce3eb] bg-white px-3">
        <h1 className="text-sm font-semibold text-[#1a1f26]">Cadastro de Campos Personalizados</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 rounded border border-[#c5ced8] px-3 text-xs"
            onClick={() => printCadastroTable(exportRows, "Campos Personalizados")}
          >
            Imprimir
          </button>
          <button
            type="button"
            className="h-8 rounded border border-[#c5ced8] px-3 text-xs"
            onClick={() =>
              exportCadastroTableToExcel(exportRows, "campos-personalizados.xlsx", "Campos")
            }
          >
            Exportar
          </button>
          <button
            type="button"
            className="h-8 rounded bg-[#4fafff] px-3 text-xs font-semibold text-white"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            Novo campo
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <div className="flex flex-wrap items-end gap-2 rounded border border-[#dce3eb] bg-white p-2">
          <label className="text-xs">
            Pesquisa
            <input
              className="ml-1 h-8 rounded border border-[#c5ced8] px-2 text-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="text-xs">
            Tipo
            <select
              className="ml-1 h-8 rounded border border-[#c5ced8] px-2 text-xs"
              value={filters.tipo || ""}
              onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value || undefined }))}
            >
              <option value="">Todos</option>
              {CADCPS_TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Ativo
            <select
              className="ml-1 h-8 rounded border border-[#c5ced8] px-2 text-xs"
              value={filters.ativo === undefined ? "" : filters.ativo ? "1" : "0"}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  ativo: e.target.value === "" ? undefined : e.target.value === "1",
                }))
              }
            >
              <option value="">Todos</option>
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </label>
        </div>

        <div className="flex min-h-0 flex-1 gap-2">
          <div className={`flex min-h-0 flex-col ${showForm ? "w-1/2" : "w-full"}`}>
            {isLoading ? (
              <div className="p-4 text-xs text-slate-500">Carregando...</div>
            ) : (
              <TABCPS
                items={items}
                selectedIds={selectedIds}
                onToggleSelect={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  )
                }
                onToggleSelectAll={(checked) =>
                  setSelectedIds(checked ? items.map((i) => i.id) : [])
                }
                onRowClick={(item) => {
                  setEditingItem(item);
                  setShowForm(true);
                }}
                sortBy={sort.key}
                sortDir={sort.dir}
                onSort={handleSort}
              />
            )}
            <div className="flex shrink-0 items-center justify-between border-t border-[#dce3eb] bg-white px-2 py-1 text-xs">
              <span>
                Total: {listData?.total ?? 0} | Página {listData?.page ?? 1} de{" "}
                {listData?.totalPages ?? 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  className="rounded border px-2 py-0.5 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= (listData?.totalPages || 1)}
                  className="rounded border px-2 py-0.5 disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </button>
                {selectedIds.length > 0 ? (
                  <button
                    type="button"
                    className="rounded border border-red-300 px-2 py-0.5 text-red-600"
                    onClick={() => {
                      if (!window.confirm(`Excluir ${selectedIds.length} campo(s)?`)) return;
                      void Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
                    }}
                  >
                    Excluir selecionados
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          {showForm ? (
            <div className="flex min-h-0 w-1/2 flex-col overflow-hidden rounded border border-[#dce3eb]">
              <FRMCPS
                open={showForm}
                editingItem={editingItem}
                telas={telas}
                empresas={empresas || []}
                formulaFields={formulaFields}
                saving={saveMutation.isPending}
                onSubmit={(payload) => saveMutation.mutate(payload)}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
