
import image from "../assets/image.png";

export default function Footer() {
  return (
    <footer className="fn-footer">
      <div className="fn-footer-inner">
        <div className="fn-footer-brand">
          <img
            src={image}
            alt="FuelNode"
            className="fn-footer-logo"
          />
        </div>

        <div className="fn-footer-links">
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="mailto:customer@fuelnode.fr">
            customer@fuelnode.fr
          </a>
        </div>
      </div>
    </footer>
  );
}