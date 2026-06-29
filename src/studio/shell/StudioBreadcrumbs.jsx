export function StudioBreadcrumbs({ segments = [] }) {
  if (!segments.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="flex items-center gap-1">
          {index > 0 && <span aria-hidden="true">›</span>}
          <span className={index === segments.length - 1 ? "font-medium text-foreground" : ""}>
            {segment}
          </span>
        </span>
      ))}
    </nav>
  );
}

export default StudioBreadcrumbs;
