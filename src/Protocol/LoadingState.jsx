import "./ProtocolComponents.css";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function LoadingState() {
  const { t } = useLanguage();

  return (
    <div className="protocol-status protocol-status--loading" role="status" aria-live="polite">
      <div className="protocol-spinner" aria-hidden="true" />
      <p className="protocol-status__text">{t("Generating your personalized nutrition protocol...")}</p>
    </div>
  );
}
