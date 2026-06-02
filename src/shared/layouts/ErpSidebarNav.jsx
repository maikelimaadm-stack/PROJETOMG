import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
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
  ERP_SUPPORT_LINK,
  isRouteActive,
  shouldMenuGroupBeOpen,
} from "@/shared/navigation/erpMenuConfig";

const ICONS = {
  "layout-dashboard": LayoutDashboard,
  "folder-open": FolderOpen,
  wallet: Wallet,
  boxes: Boxes,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "file-text": FileText,
  "bar-chart-3": BarChart3,
  settings: Settings,
  "help-circle": HelpCircle,
};

function MenuIcon({ name, className = "h-4 w-4 shrink-0" }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={1.75} />;
}

function DisabledMenuItem({ children, className = "" }) {
  return (
    <span
      className={`erp-sidebar-link erp-sidebar-link-disabled flex h-8 items-center rounded-md px-3 text-[13px] text-slate-400 ${className}`}
      aria-disabled="true"
    >
      {children}
    </span>
  );
}

function ErpSidebarGroup({ section, pathname, openSections, toggleSection }) {
  const Icon = ICONS[section.icon];
  const isOpen = openSections[section.id] ?? shouldMenuGroupBeOpen(pathname, section);
  const hasActiveChild = section.items?.some((item) => isRouteActive(pathname, item.routePath));

  if (section.disabled && !section.items?.length) {
    return (
      <SidebarMenuItem>
        <DisabledMenuItem className="inline-flex w-full items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
          {section.label}
        </DisabledMenuItem>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={`erp-sidebar-group-trigger h-9 rounded-md px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-100 ${hasActiveChild ? "text-slate-900" : ""}`}
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
        <CollapsibleContent>
          <SidebarMenuSub className="mx-0 border-l-0 px-0 py-1">
            {section.items.map((item) => (
              <SidebarMenuSubItem key={item.id}>
                {item.disabled ? (
                  <DisabledMenuItem className="pl-9">{item.label}</DisabledMenuItem>
                ) : (
                  <SidebarMenuSubButton
                    asChild
                    isActive={isRouteActive(pathname, item.routePath)}
                    className="erp-sidebar-sub-link h-8 rounded-md pl-9 pr-3 text-[13px]"
                  >
                    <Link to={item.routePath}>{item.label}</Link>
                  </SidebarMenuSubButton>
                )}
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
    <>
      <SidebarContent className="erp-sidebar-content gap-1 px-2 py-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ERP_MENU_SECTIONS.map((section) => {
                if (section.type === "link") {
                  const Icon = ICONS[section.icon];
                  return (
                    <SidebarMenuItem key={section.id}>
                      {section.disabled ? (
                        <DisabledMenuItem className="inline-flex w-full items-center gap-2">
                          {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
                          {section.label}
                        </DisabledMenuItem>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          isActive={isRouteActive(pathname, section.routePath)}
                          className="erp-sidebar-link h-9 rounded-md px-3 text-[13px] font-medium"
                        >
                          <Link to={section.routePath}>
                            {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
                            <span>{section.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <ErpSidebarGroup
                    key={section.id}
                    section={section}
                    pathname={pathname}
                    openSections={openSections}
                    toggleSection={toggleSection}
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="erp-sidebar-footer mt-auto border-t border-slate-200 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DisabledMenuItem className="inline-flex w-full items-center gap-2">
              <MenuIcon name={ERP_SUPPORT_LINK.icon} />
              {ERP_SUPPORT_LINK.label}
            </DisabledMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
