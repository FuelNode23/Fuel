import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from "../../api/client.js";
import { useSearchAndPaginate } from "./useSearchAndPaginate.js";
import Pagination from "./Pagination.jsx";
import SortableHeader from "./SortableHeader.jsx";

function matchesProductQuery(product, q) {
  return (
    (product.brand || "").toLowerCase().includes(q) ||
    (product.productName || "").toLowerCase().includes(q) ||
    (product.category || "").toLowerCase().includes(q) ||
    (product.protocolSlot || "").toLowerCase().includes(q)
  );
}

function getProductSortValue(product, key) {
  switch (key) {
    case "brand":
      return product.brand || "";
    case "product":
      return product.productName || "";
    case "category":
      return product.category || "";
    case "protocolSlot":
      return product.protocolSlot || "";
    case "stock":
      return product.stockQuantity;
    case "price":
      return product.retailPriceEur;
    default:
      return "";
  }
}

// Operational fields (shown in the table + the form's primary section) vs.
// the innovation/elite research metadata (collapsed under "Advanced") - the
// former is what running the business day to day actually needs; the
// latter exists because CatalogProduct carries the full sourcing-research
// spreadsheet, not because most edits touch it.
const EMPTY_FORM = {
  brand: "",
  productName: "",
  category: "",
  protocolSlot: "",
  stockQuantity: "",
  retailPriceEur: "",
  catalogTier: "",
  format: "",
  phase: "",
  athleteLevel: "",
  brandOrigin: "",
  sportFit: "",
  targetDemographic: "",
  marketRole: "",
  innovationScore: "",
  innovativenessBand: "",
  marketFitParisScore: "",
  parisMarketViability: "",
  premiumPerceptionScore: "",
  premiumBand: "",
  eliteTierFitScore: "",
  eliteRecommendation: "",
  marginStatus: "",
  innovationRationale: "",
};

const NUMERIC_FIELDS = [
  "stockQuantity",
  "retailPriceEur",
  "innovationScore",
  "marketFitParisScore",
  "premiumPerceptionScore",
  "eliteTierFitScore",
];

const LOW_STOCK_THRESHOLD = 10; // matches InventoryService.LOW_STOCK_THRESHOLD

function toFormState(product) {
  const state = { ...EMPTY_FORM };
  Object.keys(state).forEach((key) => {
    const value = product[key];
    state[key] = value === null || value === undefined ? "" : String(value);
  });
  return state;
}

function toPayload(formState) {
  const payload = {};
  Object.entries(formState).forEach(([key, value]) => {
    if (value === "") {
      payload[key] = null;
      return;
    }
    payload[key] = NUMERIC_FIELDS.includes(key) ? Number(value) : value;
  });
  return payload;
}

export default function ProductManagement() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // null = closed, "new" = create form, else the product id being edited
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const { query, setQuery, page, setPage, totalPages, pageItems, totalResults, sortKey, sortDir, toggleSort } =
    useSearchAndPaginate(products, matchesProductQuery, getProductSortValue);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) setError(t("Couldn't load products. Please try again."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowAdvanced(false);
    setFormError(null);
    setEditingId("new");
  };

  const openEdit = (product) => {
    setForm(toFormState(product));
    setShowAdvanced(false);
    setFormError(null);
    setEditingId(product.id);
  };

  const closeForm = () => {
    if (saving) return;
    setEditingId(null);
    setFormError(null);
  };

  const handleFieldChange = (key) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = toPayload(form);
      if (editingId === "new") {
        const created = await createAdminProduct(payload);
        setProducts((prev) => [...prev, created]);
      } else {
        const updated = await updateAdminProduct(editingId, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save product:", err);
      setFormError(
        err.response?.data?.message || t("Couldn't save this product. Check the fields and try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError(null);
    try {
      await deleteAdminProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(t("Couldn't delete this product. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="admin-panel__state">{t("Loading products…")}</p>;
  }

  return (
    <div className="admin-table-wrap">
      {error && <p className="admin-panel__error">{error}</p>}

      <div className="admin-panel__toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder={t("Search by brand, product, category, or slot…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          {t("Add product")}
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <SortableHeader column="brand" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Brand")}
            </SortableHeader>
            <SortableHeader column="product" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Product")}
            </SortableHeader>
            <SortableHeader column="category" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Category")}
            </SortableHeader>
            <SortableHeader column="protocolSlot" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Protocol slot")}
            </SortableHeader>
            <SortableHeader column="stock" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Stock")}
            </SortableHeader>
            <SortableHeader column="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>
              {t("Price (EUR)")}
            </SortableHeader>
            <th aria-label={t("Actions")} />
          </tr>
        </thead>
        <tbody>
          {pageItems.map((p) => {
            const lowStock = p.stockQuantity != null && p.stockQuantity < LOW_STOCK_THRESHOLD;
            return (
              <tr key={p.id}>
                <td>{p.brand}</td>
                <td>{p.productName}</td>
                <td>{p.category || "—"}</td>
                <td>{p.protocolSlot || "—"}</td>
                <td className={lowStock ? "admin-table__cell--low-stock" : undefined}>
                  {p.stockQuantity ?? "—"}
                </td>
                <td>{p.retailPriceEur != null ? `€${p.retailPriceEur.toFixed(2)}` : "—"}</td>
                <td className="admin-table__actions">
                  <button type="button" className="admin-table__action" onClick={() => openEdit(p)}>
                    {t("Edit")}
                  </button>
                  {confirmDeleteId === p.id ? (
                    <>
                      <button
                        type="button"
                        className="admin-table__action admin-table__action--danger"
                        disabled={saving}
                        onClick={() => handleDelete(p.id)}
                      >
                        {t("Confirm delete")}
                      </button>
                      <button
                        type="button"
                        className="admin-table__action"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        {t("Cancel")}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-table__action"
                      onClick={() => setConfirmDeleteId(p.id)}
                    >
                      {t("Delete")}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalResults === 0 && (
        <p className="admin-panel__state">
          {products.length === 0 ? t("No products yet.") : t("No products match your search.")}
        </p>
      )}
      <Pagination page={page} totalPages={totalPages} totalResults={totalResults} onPageChange={setPage} />

      {editingId !== null && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <h2 className="admin-modal__title">
              {editingId === "new" ? t("Add product") : t("Edit product")}
            </h2>
            <form onSubmit={handleSubmit}>
              {formError && <p className="admin-panel__error">{formError}</p>}

              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>{t("Brand")} *</span>
                  <input value={form.brand} onChange={handleFieldChange("brand")} required />
                </label>
                <label className="admin-field">
                  <span>{t("Product name")} *</span>
                  <input value={form.productName} onChange={handleFieldChange("productName")} required />
                </label>
                <label className="admin-field">
                  <span>{t("Category")}</span>
                  <input value={form.category} onChange={handleFieldChange("category")} />
                </label>
                <label className="admin-field">
                  <span>{t("Protocol slot")}</span>
                  <input value={form.protocolSlot} onChange={handleFieldChange("protocolSlot")} />
                </label>
                <label className="admin-field">
                  <span>{t("Stock quantity")}</span>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={handleFieldChange("stockQuantity")}
                    placeholder="20"
                  />
                </label>
                <label className="admin-field">
                  <span>{t("Retail price (EUR)")}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.retailPriceEur}
                    onChange={handleFieldChange("retailPriceEur")}
                  />
                </label>
              </div>

              <button
                type="button"
                className="admin-advanced-toggle"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? t("Hide advanced fields") : t("Show advanced fields")}
              </button>

              {showAdvanced && (
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>{t("Catalog tier")}</span>
                    <input value={form.catalogTier} onChange={handleFieldChange("catalogTier")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Format")}</span>
                    <input value={form.format} onChange={handleFieldChange("format")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Phase")}</span>
                    <input value={form.phase} onChange={handleFieldChange("phase")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Athlete level")}</span>
                    <input value={form.athleteLevel} onChange={handleFieldChange("athleteLevel")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Brand origin")}</span>
                    <input value={form.brandOrigin} onChange={handleFieldChange("brandOrigin")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Sport fit")}</span>
                    <input value={form.sportFit} onChange={handleFieldChange("sportFit")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Target demographic")}</span>
                    <input value={form.targetDemographic} onChange={handleFieldChange("targetDemographic")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Market role")}</span>
                    <input value={form.marketRole} onChange={handleFieldChange("marketRole")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Innovation score")}</span>
                    <input type="number" value={form.innovationScore} onChange={handleFieldChange("innovationScore")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Innovativeness band")}</span>
                    <input value={form.innovativenessBand} onChange={handleFieldChange("innovativenessBand")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Market fit (Paris) score")}</span>
                    <input
                      type="number"
                      value={form.marketFitParisScore}
                      onChange={handleFieldChange("marketFitParisScore")}
                    />
                  </label>
                  <label className="admin-field">
                    <span>{t("Paris market viability")}</span>
                    <input value={form.parisMarketViability} onChange={handleFieldChange("parisMarketViability")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Premium perception score")}</span>
                    <input
                      type="number"
                      value={form.premiumPerceptionScore}
                      onChange={handleFieldChange("premiumPerceptionScore")}
                    />
                  </label>
                  <label className="admin-field">
                    <span>{t("Premium band")}</span>
                    <input value={form.premiumBand} onChange={handleFieldChange("premiumBand")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Elite tier fit score")}</span>
                    <input
                      type="number"
                      value={form.eliteTierFitScore}
                      onChange={handleFieldChange("eliteTierFitScore")}
                    />
                  </label>
                  <label className="admin-field">
                    <span>{t("Elite recommendation")}</span>
                    <input value={form.eliteRecommendation} onChange={handleFieldChange("eliteRecommendation")} />
                  </label>
                  <label className="admin-field">
                    <span>{t("Margin status")}</span>
                    <input value={form.marginStatus} onChange={handleFieldChange("marginStatus")} />
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span>{t("Innovation rationale")}</span>
                    <textarea
                      value={form.innovationRationale}
                      onChange={handleFieldChange("innovationRationale")}
                      rows={3}
                    />
                  </label>
                </div>
              )}

              <div className="admin-modal__actions">
                <button type="button" className="admin-btn" onClick={closeForm} disabled={saving}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? t("Saving…") : t("Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
