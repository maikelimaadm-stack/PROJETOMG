import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Building2, List, LogOut, Search, Menu, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";

const MENU = [
  { id: "lotes", title: "Cadastro de Lotes", url: "CadastroLotes", icon: List },
  { id: "empresa", title: "Empresa", url: "Empresa", icon: Building2 },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas"],
    queryFn: () => base44.entities.Empresa.list(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [empresaSelecionada, setEmpresaSelecionada] = useState(() => {
    return localStorage.getItem("empresa_selecionada_id") || null;
  });

  const empresaAtual = React.useMemo(() => {
    if (!empresaSelecionada || !empresas.length) return null;
    return empresas.find((e) => e.id === empresaSelecionada) || null;
  }, [empresaSelecionada, empresas]);

  useEffect(() => {
    if (!empresaSelecionada && empresas.length > 0) {
      const id = empresas[0].id;
      setEmpresaSelecionada(id);
      localStorage.setItem("empresa_selecionada_id", id);
    }
  }, [empresas.length]);

  const handleEmpresaChange = (id) => {
    setEmpresaSelecionada(id);
    localStorage.setItem("empresa_selecionada_id", id);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = () => base44.auth.logout();

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-none">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-900 text-base">
              {empresaAtual?.apelido || empresaAtual?.nome || "MakGestão"}
            </span>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {MENU.map((item) => {
                const active = location.pathname === createPageUrl(item.url) || (location.pathname === "/" && item.url === "CadastroLotes");
                return (
                  <Link key={item.id} to={createPageUrl(item.url)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 px-3 text-xs font-medium rounded ${
                        active
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {empresas.length > 0 && (
              <Select value={empresaSelecionada || ""} onValueChange={handleEmpresaChange}>
                <SelectTrigger className="h-8 w-[150px] text-xs hidden md:flex border-slate-300">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-xs">
                      {e.apelido || e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-700 font-semibold text-xs">
                      {user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden lg:block">
                    {user?.full_name?.split(" ")[0] || "Usuário"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">
                  <div className="font-semibold">{user?.full_name}</div>
                  <div className="text-slate-500 font-normal">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-600">
                  <LogOut className="w-3 h-3 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-1">
            {MENU.map((item) => {
              const active = location.pathname === createPageUrl(item.url);
              return (
                <Link
                  key={item.id}
                  to={createPageUrl(item.url)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm rounded ${
                    active
                      ? "bg-emerald-100 text-emerald-800 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
            {empresas.length > 0 && (
              <div className="pt-2">
                <Select value={empresaSelecionada || ""} onValueChange={handleEmpresaChange}>
                  <SelectTrigger className="h-9 text-xs w-full border-slate-300">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="text-xs">
                        {e.apelido || e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden max-w-[1400px] w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full min-h-0 overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export const getEmpresaSelecionada = () => {
  return localStorage.getItem("empresa_selecionada_id");
};