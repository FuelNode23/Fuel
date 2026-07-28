export default function Nav() {
  return (
    <nav className="fn-nav">
      <div className="fn-nav-inner">
        <div className="fn-nav-spacer" />
        <div className="fn-nav-links">
          <a href="#how" className="fn-nav-link">Comment ça marche</a>
          <a href="#delivery" className="fn-nav-link">Livraison</a>
          <button type="button" className="fn-nav-link fn-nav-button">
            Terminer l'onboarding
          </button>
        </div>
        <div className="fn-nav-actions">
          <a
            href="?lang=en"
            aria-label="Switch to English"
            title="Switch to English"
            className="fn-lang-toggle"
          >
            <span aria-hidden="true">🇬🇧</span>
            <span>EN</span>
          </a>
          <button type="button" className="fn-menu-button" aria-label="Menu">
            <span className="fn-menu-bar" />
            <span className="fn-menu-bar" />
            <span className="fn-menu-bar" />
          </button>
        </div>
      </div>
    </nav>
  );
}
