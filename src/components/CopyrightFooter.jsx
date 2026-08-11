import "./CopyrightFooter.css";

export default function CopyrightFooter() {
  return (
    <footer className="copyright-footer">
      <p>&copy; {new Date().getFullYear()} FuelNode. All rights reserved.</p>
    </footer>
  );
}
