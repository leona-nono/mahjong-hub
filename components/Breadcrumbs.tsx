import { Link } from '@/i18n/navigation';
import { breadcrumbJsonLd, type Crumb } from '@/lib/breadcrumb';

export default function Breadcrumbs({ locale, crumbs }: { locale: string; crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-portal-muted">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(locale, crumbs)) }}
      />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.path}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last ? (
                <span className="text-portal-text">{crumb.name}</span>
              ) : (
                <Link href={crumb.path || '/'} className="hover:text-portal-accent hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
