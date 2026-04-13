import { useState } from 'react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">🏨</span>
          <span className="logo-text">LuxeStay</span>
        </div>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#" onClick={() => setMenuOpen(false)}>Accueil</a></li>
          <li><a href="#hotels" onClick={() => setMenuOpen(false)}>Hôtels</a></li>
          <li><a href="#destinations" onClick={() => setMenuOpen(false)}>Destinations</a></li>
          <li><a href="#avantages" onClick={() => setMenuOpen(false)}>Offres</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
        </ul>

        <div className="navbar-actions">
          <button className="btn-login">Connexion</button>
          <button className="btn-book">Réserver maintenant</button>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
