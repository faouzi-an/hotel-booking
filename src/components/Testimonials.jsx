const testimonials = [
  {
    id: 1,
    text: "Une expérience de réservation incroyablement simple et rapide. L'hôtel était exactement comme les photos, et le service client a été exceptionnel du début à la fin !",
    author: 'Sophie Martin',
    stay: 'Séjour à Paris — Grand Palais Hôtel',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
  },
  {
    id: 2,
    text: "J'utilise LuxeStay depuis 3 ans. Les prix sont imbattables et les hôtels sont toujours à la hauteur de mes attentes. Je recommande vivement à tous mes proches !",
    author: 'Pierre Dubois',
    stay: "Séjour à Nice — Azure Beach Resort",
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 5,
  },
  {
    id: 3,
    text: "Annulation de dernière minute gérée sans aucun problème. Le support client a été réactif, professionnel et très humain. LuxeStay, c'est la confiance !",
    author: 'Léa Bernard',
    stay: 'Séjour à Chamonix — Château des Alpes',
    avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 5,
  },
];

const Testimonials = () => (
  <section className="section">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">Témoignages</div>
        <h2 className="section-title">Ce Que Disent Nos Clients</h2>
        <p className="section-subtitle">
          Des milliers de voyageurs nous font confiance chaque année
        </p>
      </div>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t.id} className="testimonial-card">
            <div className="testimonial-quote">"</div>
            <p className="testimonial-text">{t.text}</p>
            <div className="testimonial-stars">
              {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
            </div>
            <div className="testimonial-author">
              <img src={t.avatar} alt={t.author} className="author-avatar" />
              <div>
                <div className="author-name">{t.author}</div>
                <div className="author-stay">{t.stay}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
