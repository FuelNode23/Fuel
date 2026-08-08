import "./ProtocolComponents.css";

export default function SpecialistProtocols({ protocols }) {
  if (!protocols || protocols.length === 0) {
    return (
      <section className="protocol-section">
        <h2 className="protocol-section__title">Specialist Protocols</h2>
        <p className="protocol-empty">No specialist protocols are active.</p>
      </section>
    );
  }

  return (
    <section className="protocol-section">
      <h2 className="protocol-section__title">Specialist Protocols</h2>
      <div className="card-grid card-grid--specialist">
        {protocols.map((protocol, index) => (
          <div className="card specialist-card" key={protocol?.name || index}>
            <div className="specialist-card__header">
              <h3 className="specialist-card__title">{protocol?.name || "Untitled Protocol"}</h3>
              {protocol?.active && <span className="badge badge--active">Active</span>}
            </div>
            {protocol?.rationale && (
              <p className="specialist-card__rationale">
                <strong>Why:</strong> {protocol.rationale}
              </p>
            )}
            {protocol?.instructions && (
              <p className="specialist-card__instructions">
                <strong>How:</strong> {protocol.instructions}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
