const features = [
  {
    icon: '🛡️',
    title: 'Réservation Sécurisée',
    desc: 'Paiement SSL 256 bits. Vos données personnelles et bancaires sont protégées à chaque étape.',
  },
  {
    icon: '💰',
    title: 'Meilleur Prix Garanti',
    desc: 'Trouvez moins cher ailleurs ? Nous remboursons la différence, sans condition.',
  },
  {
    icon: '🌍',
    title: 'Large Choix',
    desc: "Plus de 5 000 hôtels dans 120 destinations à travers le monde, pour tous les budgets.",
  },
  {
    icon: '🎯',
    title: 'Annulation Flexible',
    desc: "Changez vos plans sans stress. Annulation gratuite jusqu'à 48h avant l'arrivée.",
  },
  {
    icon: '💬',
    title: 'Support 24/7',
    desc: "Notre équipe est disponible 24h/24 et 7j/7 pour vous accompagner partout dans le monde.",
  },
  {
    icon: '⭐',
    title: 'Avis Vérifiés',
    desc: 'Tous nos avis sont authentiques et vérifiés après chaque séjour. Zéro faux commentaire.',
  },
];

const WhyUs = () => (
  <section className="section section-light" id="avantages">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">Nos Avantages</div>
        <h2 className="section-title">Pourquoi Nous Choisir ?</h2>
        <p className="section-subtitle">
          Votre satisfaction est notre priorité absolue
        </p>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUs;
