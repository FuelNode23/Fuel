import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { getAdminUsers, updateUserStatus, updateUserRole } from "../../api/client.js";

function formatDate(isoString, language) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(language === "fr" ? "fr-FR" : undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Every action row hides itself on the logged-in admin's own row - mirrors
 * AdminUserService's self-action guards (can't disable or demote yourself)
 * directly in the UI, instead of letting someone click it and see a
 * rejected-request error.
 */
export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
        if (!cancelled) setError(t("Couldn't load users. Please try again."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleStatus = async (targetUser) => {
    setPendingId(targetUser.id);
    setError(null);
    try {
      const updated = await updateUserStatus(targetUser.id, !targetUser.enabled);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Failed to update user status:", err);
      setError(err.response?.data?.message || t("Couldn't update that user's status."));
    } finally {
      setPendingId(null);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === "ADMIN" ? "ATHLETE" : "ADMIN";
    setPendingId(targetUser.id);
    setError(null);
    try {
      const updated = await updateUserRole(targetUser.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Failed to update user role:", err);
      setError(err.response?.data?.message || t("Couldn't update that user's role."));
    } finally {
      setPendingId(null);
    }
  };

  if (loading) {
    return <p className="admin-panel__state">{t("Loading users…")}</p>;
  }

  return (
    <div className="admin-table-wrap">
      {error && <p className="admin-panel__error">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>{t("Name")}</th>
            <th>{t("Email")}</th>
            <th>{t("Role")}</th>
            <th>{t("Status")}</th>
            <th>{t("Joined")}</th>
            <th>{t("Last login")}</th>
            <th aria-label={t("Actions")} />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const busy = pendingId === u.id;
            return (
              <tr key={u.id}>
                <td>
                  {u.fullName}
                  {isSelf && <span className="admin-table__you"> ({t("you")})</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`admin-pill admin-pill--${u.role === "ADMIN" ? "admin" : "athlete"}`}>
                    {u.role === "ADMIN" ? t("Admin") : t("Athlete")}
                  </span>
                </td>
                <td>
                  <span className={`admin-pill admin-pill--${u.enabled ? "enabled" : "disabled"}`}>
                    {u.enabled ? t("Enabled") : t("Disabled")}
                  </span>
                </td>
                <td>{formatDate(u.createdAt, language)}</td>
                <td>{formatDate(u.lastLoginAt, language)}</td>
                <td className="admin-table__actions">
                  {!isSelf && (
                    <>
                      <button
                        type="button"
                        className="admin-table__action"
                        disabled={busy}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.enabled ? t("Disable") : t("Enable")}
                      </button>
                      <button
                        type="button"
                        className="admin-table__action"
                        disabled={busy}
                        onClick={() => handleToggleRole(u)}
                      >
                        {u.role === "ADMIN" ? t("Demote") : t("Promote")}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {users.length === 0 && <p className="admin-panel__state">{t("No users yet.")}</p>}
    </div>
  );
}
