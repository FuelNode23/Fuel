import "./ProtocolComponents.css";

export default function AthleteSummary({ summary, generatedDate, language, version }) {
  if (!summary) return null;

  return (
    <section className="protocol-section athlete-summary">
      <div className="athlete-summary__meta">
        {generatedDate && (
          <span className="badge badge--muted">Generated {generatedDate}</span>
        )}
        {version != null && <span className="badge badge--muted">v{version}</span>}
        {language && <span className="badge badge--muted">{language.toUpperCase()}</span>}
      </div>
      <p className="athlete-summary__text">{summary}</p>
    </section>
  );
}
