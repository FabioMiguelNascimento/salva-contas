"use client";

import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Home } from "lucide-react";

export function WorkspaceSwitcher() {
  const { isAuthenticated } = useAuth();
  const { currentWorkspace, workspaces, setCurrentWorkspace, isLoading } = useWorkspace();

  if (!isAuthenticated || isLoading || !currentWorkspace) {
    return (
      <Button variant="outline" disabled className="gap-2 min-w-[200px] justify-between">
        <span className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          <span className="truncate">Carregando...</span>
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
          <span className="flex items-center gap-2 truncate">
            <Home className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentWorkspace.name}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setCurrentWorkspace(workspace.id)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentWorkspace.id === workspace.id && "bg-accent"
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <Home className="h-4 w-4 shrink-0" />
              <span className="truncate">{workspace.name}</span>
            </span>
            {currentWorkspace.id === workspace.id && (
              <Check className="h-4 w-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2">
          {/* Dialog trigger inside the dropdown — opens the create workspace dialog */}
          <CreateWorkspaceDialog />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
