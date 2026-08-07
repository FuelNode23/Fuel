import "./ProtocolComponents.css";

export default function LoadingState() {
  return (
    <div className="protocol-status protocol-status--loading" role="status" aria-live="polite">
      <div className="protocol-spinner" aria-hidden="true" />
      <p className="protocol-status__text">Generating your personalized nutrition protocol...</p>
    </div>
  );
}
