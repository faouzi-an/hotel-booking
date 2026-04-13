const destinations = [
  {
    name: 'Paris',
    hotels: '1 200+ hôtels',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80',
  },
  {
    name: 'Barcelone',
    hotels: '850+ hôtels',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=700&q=80',
  },
  {
    name: 'Dubaï',
    hotels: '700+ hôtels',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80',
  },
  {
    name: 'Rome',
    hotels: '600+ hôtels',
    image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=700&q=80',
  },
];

const Destinations = () => (
  <section className="section" id="destinations">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">Explorer</div>
        <h2 className="section-title">Destinations Populaires</h2>
        <p className="section-subtitle">
          Les villes les plus demandées par nos voyageurs cette saison
        </p>
      </div>
      <div className="destinations-grid">
        {destinations.map((dest) => (
          <div key={dest.name} className="dest-card">
            <img src={dest.image} alt={dest.name} loading="lazy" />
            <div className="dest-overlay" aria-hidden="true" />
            <div className="dest-info">
              <div className="dest-name">{dest.name}</div>
              <div className="dest-hotels">{dest.hotels}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Destinations;
