interface PageHeaderProps {
  tag: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ tag, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{tag}</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
