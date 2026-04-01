
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { BarChart3, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ReportItem {
  label: string;
  href: string;
}

interface ReportsGroup {
  key: string;
  label: string;
  items: ReportItem[];
}

const REPORTS_GROUPS: ReportsGroup[] = [
  {
    key: "fluxo-caixa",
    label: "Fluxo de caixa",
    items: [
      { label: "Contas a pagar", href: "/app/relatorios/contas" },
      { label: "Transações", href: "/app/relatorios/transacoes" },
      { label: "Assinaturas", href: "/app/relatorios/assinaturas" },
    ],
  },
  {
    key: "credito",
    label: "Crédito",
    items: [{ label: "Cartões", href: "/app/relatorios/cartoes" }],
  },
  {
    key: "planejamento",
    label: "Planejamento",
    items: [
      { label: "Orçamentos", href: "/app/relatorios/orcamentos" },
      { label: "Cofrinhos", href: "/app/relatorios/cofrinhos" },
    ],
  },
];

function getInitialOpenGroups(pathname: string): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const group of REPORTS_GROUPS) {
    if (group.items.some((item) => item.href === pathname)) {
      result[group.key] = true;
    }
  }
  return result;
}

export function ReportsSidebarItem() {
  const pathname = usePathname();
  const isInReports = pathname.startsWith("/app/relatorios");

  const [reportsOpen, setReportsOpen] = useState(isInReports);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    () => getInitialOpenGroups(pathname)
  );

  useEffect(() => {
    if (!isInReports) return;
    setReportsOpen(true);
    setOpenGroups((prev) => ({ ...getInitialOpenGroups(pathname), ...prev }));
  }, [pathname, isInReports]);

  const toggleGroup = useCallback((key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const allLeafHrefs = useMemo(
    () => REPORTS_GROUPS.flatMap((g) => g.items.map((i) => i.href)),
    []
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip="Relatórios"
        onClick={() => setReportsOpen((prev) => !prev)}
        isActive={isInReports}
        className="cursor-pointer"
      >
        <BarChart3 />
        <div className="group-data-[collapsible=icon]:hidden flex items-center justify-between w-full">
          
        <span>Relatórios</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
            reportsOpen ? "rotate-180" : ""
          }`}
        />
        </div>
      </SidebarMenuButton>

      {reportsOpen && (
        <SidebarMenuSub>
          {REPORTS_GROUPS.map((group) => {
            const groupIsActive = group.items.some((i) => i.href === pathname);
            const groupIsOpen = openGroups[group.key] ?? false;

            return (
              <SidebarMenuSubItem key={group.key}>
                <SidebarMenuSubButton
                  isActive={groupIsActive && !groupIsOpen}
                  onClick={() => toggleGroup(group.key)}
                  className="cursor-pointer"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                      groupIsOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuSubButton>

                {groupIsOpen && (
                  <SidebarMenuSub className="mt-0.5">
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}