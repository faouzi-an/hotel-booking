const Footer = () => (
  <footer className="footer" id="contact">
    <div className="footer-top">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="navbar-logo">
              <span className="logo-icon">🏨</span>
              <span className="logo-text">LuxeStay</span>
            </div>
            <p className="footer-desc">
              Votre partenaire de confiance pour des séjours d&apos;exception.
              Des milliers d&apos;hôtels soigneusement sélectionnés à travers
              le monde entier.
            </p>
            <div className="footer-social">
              <button className="social-btn" aria-label="Facebook">f</button>
              <button className="social-btn" aria-label="Instagram">in</button>
              <button className="social-btn" aria-label="Twitter">tw</button>
              <button className="social-btn" aria-label="YouTube">▶</button>
            </div>
          </div>

          {/* Column 1 */}
          <div className="footer-column">
            <h4>Compagnie</h4>
            <ul className="footer-links">
              <li><a href="#">À propos</a></li>
              <li><a href="#">Carrières</a></li>
              <li><a href="#">Presse</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Investisseurs</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#">Centre d&apos;aide</a></li>
              <li><a href="#">Politique d&apos;annulation</a></li>
              <li><a href="#">Contactez-nous</a></li>
              <li><a href="#">Partenaires hôteliers</a></li>
              <li><a href="#">Programme fidélité</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-column">
            <h4>Légal</h4>
            <ul className="footer-links">
              <li><a href="#">Confidentialité</a></li>
              <li><a href="#">CGU</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Mentions légales</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="footer-bottom-inner">
        <span>© 2026 LuxeStay. Tous droits réservés.</span>
        <div className="footer-bottom-links">
          <a href="#">Confidentialité</a>
          <a href="#">CGU</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
