import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  to: string | null;
  active?: boolean;
}

interface BreadcrumbsProps {
  breadcrumbs: Breadcrumb[];
}

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-5">
      {breadcrumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="hover:text-black transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className={
                crumb.active
                  ? "text-neutral-900 font-medium truncate max-w-[150px]"
                  : ""
              }
            >
              {crumb.label}
            </span>
          )}
          {idx < breadcrumbs.length - 1 && (
            <ChevronRight size={10} className="text-neutral-300" />
          )}
        </div>
      ))}
    </nav>
  );
};
