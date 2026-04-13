const Newsletter = () => (
  <section className="cta-section">
    <div className="cta-container">
      <div className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
        Offres Exclusives
      </div>
      <h2 className="cta-title">
        Recevez nos <span>Meilleures Offres</span>
      </h2>
      <p className="cta-subtitle">
        Inscrivez-vous et recevez jusqu&apos;à -30% sur votre première réservation
      </p>
      <form
        className="cta-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          className="cta-input"
          placeholder="votre@email.com"
          aria-label="Adresse email"
        />
        <button type="submit" className="btn-cta">
          S&apos;inscrire
        </button>
      </form>
    </div>
  </section>
);

export default Newsletter;
