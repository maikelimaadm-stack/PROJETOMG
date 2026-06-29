import { UniversalBreadcrumb } from "@/studio/components/index.js";

/** @deprecated Use UniversalBreadcrumb via BreadcrumbProvider */
export function StudioBreadcrumbs(props) {
  if (props.segments) {
    return (
      <nav
        aria-label="Breadcrumb"
        className="hidden items-center gap-1 text-xs text-muted-foreground md:flex"
      >
        {props.segments.map((segment, index) => (
          <span key={`${segment}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden="true">›</span>}
            <span className={index === props.segments.length - 1 ? "font-medium text-foreground" : ""}>
              {segment}
            </span>
          </span>
        ))}
      </nav>
    );
  }
  return <UniversalBreadcrumb />;
}

export default StudioBreadcrumbs;
