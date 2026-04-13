import './App.css';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const offers = [
  {
    title: 'Évasion de printemps',
    text: 'Profitez de 15% de réduction sur une sélection de séjours urbains.',
    cta: 'Activer l\'offre',
  },
  {
    title: 'Week-end en duo',
    text: 'Réservez 2 nuits et bénéficiez du petit-déjeuner inclus.',
    cta: 'Voir les hôtels',
  },
];

const destinations = [
  { city: 'Paris', stays: '3 412 établissements', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { city: 'Marrakech', stays: '1 298 établissements', image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80' },
  { city: 'Barcelone', stays: '2 044 établissements', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80' },
  { city: 'Istanbul', stays: '1 775 établissements', image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800&q=80' },
  { city: 'Rome', stays: '2 683 établissements', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
];

const propertyTypes = [
  { name: 'Hôtels', count: '897 122 hôtels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' },
  { name: 'Appartements', count: '1 321 842 appartements', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
  { name: 'Resorts', count: '18 402 resorts', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80' },
  { name: 'Villas', count: '782 501 villas', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80' },
];

const homesGuestsLove = [
  { name: 'Riad Atlas', city: 'Marrakech', price: 'A partir de 92 EUR', score: '9,1 Fabuleux' },
  { name: 'Canal Loft', city: 'Amsterdam', price: 'A partir de 130 EUR', score: '8,8 Superbe' },
  { name: 'Casa Aurora', city: 'Lisbonne', price: 'A partir de 88 EUR', score: '9,3 Exceptionnel' },
  { name: 'Blue Harbor', city: 'Athènes', price: 'A partir de 77 EUR', score: '8,7 Superbe' },
];

function App() {
  const [searchForm, setSearchForm] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    type: 'hotel',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Booking modal state
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null); // { ok, message, detail }

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

  const onFieldChange = (field) => (event) => {
    const value = field === 'guests' ? Number.parseInt(event.target.value, 10) : event.target.value;
    setSearchForm((previous) => ({ ...previous, [field]: value }));
  };

  const openBooking = (hotel) => {
    setSelectedHotel(hotel);
    setBookingForm({ checkIn: searchForm.checkIn, checkOut: searchForm.checkOut, guests: searchForm.guests });
    setBookingResult(null);
  };

  const closeBooking = () => {
    setSelectedHotel(null);
    setBookingResult(null);
  };

  const onBookingFieldChange = (field) => (e) => {
    const value = field === 'guests' ? Number.parseInt(e.target.value, 10) : e.target.value;
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingResult(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: selectedHotel.id,
          check_in: bookingForm.checkIn,
          check_out: bookingForm.checkOut,
          guests_count: bookingForm.guests,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message);
      setBookingResult({ ok: true, data });
    } catch (err) {
      setBookingResult({ ok: false, message: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  const runSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        destination: searchForm.destination,
        checkIn: searchForm.checkIn,
        checkOut: searchForm.checkOut,
        guests: String(searchForm.guests),
        type: searchForm.type,
      });

      const response = await fetch(`${API_BASE_URL}/api/hotels/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Impossible de recuperer les hotels.');
      }

      const payload = await response.json();
      setSearchResults(payload.hotels || []);
    } catch (_err) {
      setError('Recherche indisponible. Verifiez que l\'API est accessible.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="wrap topbar-row">
          <div className="brand">bookingclone</div>
          <div className="topbar-actions">
            <button className="text-btn">EUR</button>
            <button className="text-btn">FR</button>
            <button className="ghost-btn">Inscrire votre hebergement</button>
            <button className="outline-btn">S'inscrire</button>
            <button className="outline-btn">Se connecter</button>
          </div>
        </div>
        <div className="wrap nav-row">
          <button className="chip active">Sejours</button>
          <button className="chip">Vols</button>
          <button className="chip">Vol + Hotel</button>
          <button className="chip">Voitures</button>
          <button className="chip">Attractions</button>
          <button className="chip">Taxis aeroport</button>
        </div>

        <div className="hero wrap">
          <h1>Trouvez votre prochain sejour</h1>
          <p>Recherchez des offres sur des hotels, des appartements et bien plus encore...</p>
          <form className="search-box" role="search" onSubmit={runSearch}>
            <input
              type="text"
              placeholder="Ou allez-vous ?"
              value={searchForm.destination}
              onChange={onFieldChange('destination')}
            />
            <input
              type="date"
              aria-label="Date d'arrivee"
              value={searchForm.checkIn}
              onChange={onFieldChange('checkIn')}
            />
            <input
              type="date"
              aria-label="Date de depart"
              value={searchForm.checkOut}
              onChange={onFieldChange('checkOut')}
            />
            <select
              className="search-select"
              value={searchForm.guests}
              onChange={onFieldChange('guests')}
              aria-label="Nombre de voyageurs"
            >
              <option value={1}>1 voyageur</option>
              <option value={2}>2 voyageurs</option>
              <option value={3}>3 voyageurs</option>
              <option value={4}>4 voyageurs</option>
              <option value={6}>6 voyageurs</option>
            </select>
            <select
              className="search-select"
              value={searchForm.type}
              onChange={onFieldChange('type')}
              aria-label="Type d'hebergement"
            >
              <option value="hotel">Hotel</option>
              <option value="appartement">Appartement</option>
              <option value="villa">Villa</option>
            </select>
            <button className="search-btn" type="submit" disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </div>
      </header>

      <main className="content wrap">
        <section className="section">
          <h2>Resultats de recherche</h2>
          <p className="muted">Ces resultats proviennent de PostgreSQL (donnees bidon).</p>
          {error && <p className="search-error">{error}</p>}
          {!error && searchResults.length === 0 && !loading && (
            <p className="muted">Lancez une recherche pour afficher des hotels disponibles.</p>
          )}
          <div className="search-results-grid">
            {searchResults.map((hotel) => (
              <article className="search-result-card" key={hotel.id}>
                <img src={hotel.image_url} alt={hotel.name} loading="lazy" />
                <div className="search-result-body">
                  <h3>{hotel.name}</h3>
                  <p className="muted">{hotel.city}, {hotel.country}</p>
                  <p>Type : {hotel.type} &nbsp;·&nbsp; Max {hotel.max_guests} voyageurs</p>
                  <p>⭐ {hotel.rating} ({hotel.review_count} avis)</p>
                  <div className="search-result-footer">
                    <strong>{formatPrice(hotel.price_per_night)} / nuit</strong>
                    <button className="btn-reserver" onClick={() => openBooking(hotel)}>Réserver</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Booking modal */}
          {selectedHotel && (
            <div className="modal-overlay" onClick={closeBooking}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeBooking} aria-label="Fermer">✕</button>

                {bookingResult?.ok ? (
                  <div className="booking-success">
                    <div className="booking-success-icon">✅</div>
                    <h2>Réservation confirmée !</h2>
                    <p><strong>{bookingResult.data.hotel_name}</strong> — {bookingResult.data.city}</p>
                    <p>📅 {bookingResult.data.check_in} → {bookingResult.data.check_out} ({bookingResult.data.nights} nuit{bookingResult.data.nights > 1 ? 's' : ''})</p>
                    <p>👥 {bookingResult.data.guests_count} voyageur{bookingResult.data.guests_count > 1 ? 's' : ''}</p>
                    <p className="booking-total">Total : {formatPrice(bookingResult.data.total_price)}</p>
                    <button className="btn-reserver" onClick={closeBooking}>Fermer</button>
                  </div>
                ) : (
                  <>
                    <img src={selectedHotel.image_url} alt={selectedHotel.name} className="modal-img" />
                    <div className="modal-body">
                      <h2>{selectedHotel.name}</h2>
                      <p className="muted">📍 {selectedHotel.city}, {selectedHotel.country} &nbsp;·&nbsp; ⭐ {selectedHotel.rating}</p>
                      <p className="modal-price">{formatPrice(selectedHotel.price_per_night)} <span>/ nuit</span></p>

                      {bookingResult && !bookingResult.ok && (
                        <p className="search-error">{bookingResult.message}</p>
                      )}

                      <form className="booking-form" onSubmit={submitBooking}>
                        <div className="booking-fields">
                          <label>
                            Arrivée
                            <input type="date" required value={bookingForm.checkIn} onChange={onBookingFieldChange('checkIn')} />
                          </label>
                          <label>
                            Départ
                            <input type="date" required value={bookingForm.checkOut} onChange={onBookingFieldChange('checkOut')} />
                          </label>
                          <label>
                            Voyageurs
                            <select value={bookingForm.guests} onChange={onBookingFieldChange('guests')}>
                              {[1,2,3,4,5,6,7,8].map((n) => (
                                <option key={n} value={n}>{n} voyageur{n > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <button className="btn-reserver btn-full" type="submit" disabled={bookingLoading}>
                          {bookingLoading ? 'Réservation en cours...' : 'Confirmer la réservation'}
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="section">
          <h2>Offres</h2>
          <p className="muted">Promotions, reductions et offres speciales pour vous</p>
          <div className="offers-grid">
            {offers.map((offer) => (
              <article className="offer-card" key={offer.title}>
                <h3>{offer.title}</h3>
                <p>{offer.text}</p>
                <button>{offer.cta}</button>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Destinations tendance</h2>
          <div className="destinations-grid">
            {destinations.map((item) => (
              <article className="destination-card" key={item.city}>
                <img src={item.image} alt={item.city} loading="lazy" />
                <div className="card-overlay" />
                <div className="card-text">
                  <h3>{item.city}</h3>
                  <p>{item.stays}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Par type d'hebergement</h2>
          <div className="type-grid">
            {propertyTypes.map((item) => (
              <article className="type-card" key={item.name}>
                <img src={item.image} alt={item.name} loading="lazy" />
                <h3>{item.name}</h3>
                <p>{item.count}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Les logements que les voyageurs adorent</h2>
          <div className="homes-grid">
            {homesGuestsLove.map((home) => (
              <article className="home-card" key={home.name}>
                <div className="home-photo" />
                <h3>{home.name}</h3>
                <p className="muted">{home.city}</p>
                <p>{home.price}</p>
                <span className="rating">{home.score}</span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-links">
          <a href="#">Pays</a>
          <a href="#">Regions</a>
          <a href="#">Villes</a>
          <a href="#">A propos</a>
          <a href="#">Service client</a>
        </div>
        <p>Copyright 2026 bookingclone.com. Tous droits reserves.</p>
      </footer>
    </div>
  );
}

export default App;
