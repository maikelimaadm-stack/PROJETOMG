import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, FolderOpen, Home } from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/shared/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import {
  ERP_MENU_SECTIONS,
  isRouteActive,
  shouldMenuGroupBeOpen,
} from "@/shared/navigation/erpMenuConfig";

const ICONS = {
  "folder-open": FolderOpen,
};

function ErpSidebarGroup({ section, pathname, openSections, toggleSection }) {
  const Icon = ICONS[section.icon];
  const isOpen = openSections[section.id] ?? shouldMenuGroupBeOpen(pathname, section);
  const hasActiveChild = section.items?.some((item) => isRouteActive(pathname, item.routePath));

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={`erp-sidebar-group-trigger h-9 rounded-md px-3 text-[13px] font-medium text-slate-700 ${hasActiveChild ? "text-slate-900" : ""}`}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
            <span className="flex-1 truncate text-left">{section.label}</span>
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="erp-sidebar-submenu">
          <SidebarMenuSub className="erp-sidebar-submenu-list mx-0 border-l-0 px-0 py-1">
            {section.items.map((item) => (
              <SidebarMenuSubItem key={item.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isRouteActive(pathname, item.routePath)}
                  className="erp-sidebar-sub-link h-8 rounded-md pl-9 pr-3 text-[13px]"
                >
                  <Link to={item.routePath}>{item.label}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function ErpSidebarNav() {
  const { pathname } = useLocation();
  const initialOpen = useMemo(() => {
    const next = {};
    ERP_MENU_SECTIONS.forEach((section) => {
      if (section.type === "group") {
        next[section.id] = shouldMenuGroupBeOpen(pathname, section);
      }
    });
    return next;
  }, [pathname]);

  const [openSections, setOpenSections] = useState(initialOpen);

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <SidebarContent className="erp-sidebar-content gap-1 px-2 py-3">
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="erp-sidebar-sub-link h-9 rounded-md px-3 text-[13px] font-medium">
                <Link to="/">
                  <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>Business OS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {ERP_MENU_SECTIONS.map((section) => (
              <ErpSidebarGroup
                key={section.id}
                section={section}
                pathname={pathname}
                openSections={openSections}
                toggleSection={toggleSection}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
