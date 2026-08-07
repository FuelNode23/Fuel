import "./ProtocolComponents.css";

export default function ErrorState({ message, onRetry, onBack }) {
  return (
    <div className="protocol-status protocol-status--error" role="alert">
      <div className="protocol-status__icon" aria-hidden="true">!</div>
      <h2 className="protocol-status__title">We couldn't load your protocol</h2>
      <p className="protocol-status__text">
        {message || "Something went wrong while generating your nutrition protocol. Please try again."}
      </p>
      <div className="protocol-status__actions">
        {onRetry && (
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry
          </button>
        )}
        {onBack && (
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}
