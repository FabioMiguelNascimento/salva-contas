import { cn } from "@/lib/utils";
import * as React from "react";

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn("bg-card text-card-foreground rounded-xl border shadow-sm", className)}
      {...props}
    />
  );
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn("px-4 py-3 border-b", className)}
      {...props}
    />
  );
}

function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-content"
      className={cn("p-4", className)}
      {...props}
    />
  );
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-footer"
      className={cn("px-4 py-3 border-t flex items-center justify-end", className)}
      {...props}
    />
  );
}

export { Panel, PanelContent, PanelFooter, PanelHeader };

