import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Pagination({ page, totalPages, totalResults, onPageChange }) {
  const { t } = useLanguage();

  if (totalResults === 0) return null;

  return (
    <div className="admin-pagination">
      <span className="admin-pagination__count">
        {t("{count} result(s)", { count: totalResults })}
      </span>
      <div className="admin-pagination__controls">
        <button
          type="button"
          className="admin-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("Previous")}
        </button>
        <span className="admin-pagination__page">
          {t("Page {page} of {total}", { page, total: totalPages })}
        </span>
        <button
          type="button"
          className="admin-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("Next")}
        </button>
      </div>
    </div>
  );
}
