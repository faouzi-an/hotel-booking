import SearchBar from './SearchBar';

const Hero = () => (
  <section className="hero">
    <div className="hero-bg" aria-hidden="true" />
    <div className="hero-overlay" aria-hidden="true" />

    <div className="hero-content">
      <div className="hero-badge">✦ Voyagez avec Élégance</div>

      <h1 className="hero-title">
        Trouvez l&apos;Hôtel <span>Parfait</span><br />
        pour Votre Escapade
      </h1>

      <p className="hero-subtitle">
        Des milliers d&apos;hôtels d&apos;exception à travers le monde entier.
        Réservez en quelques clics et vivez une expérience inoubliable.
      </p>

      <SearchBar />

      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-number">5 000+</div>
          <div className="stat-label">Hôtels partenaires</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">120+</div>
          <div className="stat-label">Destinations</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1M+</div>
          <div className="stat-label">Clients satisfaits</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.9★</div>
          <div className="stat-label">Note moyenne</div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
