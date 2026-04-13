import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const offers = [
  {
    title: 'Évasion de printemps',
    text: 'Profitez de 15% de réduction sur une sélection de séjours urbains.',
    cta: "Activer l'offre",
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

function StripePaymentForm({ paymentData, bookingForm, selectedHotel, onSuccess, onError, formatPrice }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [email, setEmail] = useState('');

  const handlePay = async (event) => {
    event.preventDefault();
    onError('');

    if (!stripe || !elements) {
      onError('Stripe non initialisé.');
      return;
    }

    setPaying(true);
    try {
      const card = elements.getElement(CardElement);
      const confirmation = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card,
          billing_details: {
            email: email || undefined,
          },
        },
      });

      if (confirmation.error) {
        onError(confirmation.error.message || 'Paiement refusé.');
        setPaying(false);
        return;
      }

      if (!confirmation.paymentIntent || confirmation.paymentIntent.status !== 'succeeded') {
        onError('Paiement non confirmé.');
        setPaying(false);
        return;
      }

      const bookingResp = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: selectedHotel.id,
          check_in: bookingForm.checkIn,
          check_out: bookingForm.checkOut,
          guests_count: bookingForm.guests,
          guest_email: email || null,
          payment_intent_id: paymentData.payment_intent_id,
        }),
      });

      const bookingData = await bookingResp.json();
      if (!bookingResp.ok) {
        throw new Error(bookingData.message || 'Erreur lors de la confirmation.');
      }

      onSuccess(bookingData);
    } catch (error) {
      onError(error.message || 'Paiement impossible.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={handlePay}>
      <div className="booking-fields">
        <label>
          Email (reçu)
          <input
            type="email"
            placeholder="vous@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>

      <div className="stripe-summary">
        <strong>Total à payer :</strong> {formatPrice((paymentData.amount || 0) / 100)}
      </div>

      <div className="stripe-card-element">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <p className="stripe-test-hint">Carte test Stripe : 4242 4242 4242 4242 · date future · CVC au choix</p>

      <button className="btn-reserver btn-full" type="submit" disabled={!stripe || paying}>
        {paying ? 'Paiement en cours...' : 'Payer et confirmer la réservation'}
      </button>
    </form>
  );
}

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

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [paymentData, setPaymentData] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  const [showReservations, setShowReservations] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);

  const onFieldChange = (field) => (event) => {
    const value = field === 'guests' ? Number.parseInt(event.target.value, 10) : event.target.value;
    setSearchForm((previous) => ({ ...previous, [field]: value }));
  };

  const openBooking = (hotel) => {
    setSelectedHotel(hotel);
    setBookingForm({
      checkIn: searchForm.checkIn,
      checkOut: searchForm.checkOut,
      guests: searchForm.guests,
    });
    setBookingResult(null);
    setPaymentData(null);
    setPaymentError('');
  };

  const closeBooking = () => {
    setSelectedHotel(null);
    setBookingResult(null);
    setPaymentData(null);
    setPaymentError('');
  };

  const onBookingFieldChange = (field) => (event) => {
    const value = field === 'guests' ? Number.parseInt(event.target.value, 10) : event.target.value;
    setBookingForm((previous) => ({ ...previous, [field]: value }));
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
        throw new Error('Impossible de récupérer les hôtels.');
      }

      const payload = await response.json();
      setSearchResults(payload.hotels || []);
    } catch (_err) {
      setError('Recherche indisponible. Vérifiez que l\'API est accessible.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setBookingLoading(true);
    setBookingResult(null);
    setPaymentData(null);
    setPaymentError('');

    try {
      // 1) Create Stripe payment intent
      const intentResp = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: selectedHotel.id,
          check_in: bookingForm.checkIn,
          check_out: bookingForm.checkOut,
          guests_count: bookingForm.guests,
        }),
      });

      if (intentResp.ok) {
        const intentData = await intentResp.json();
        setPaymentData(intentData);
        return;
      }

      const errorPayload = await intentResp.json().catch(() => ({}));
      const message = errorPayload.message || 'Paiement indisponible. Vérifiez la configuration Stripe.';
      setPaymentError(message);
    } catch (error) {
      setPaymentError(error.message || 'Erreur lors de la préparation du paiement.');
    } finally {
      setBookingLoading(false);
    }
  };

  const loadReservations = useCallback(async () => {
    setReservationsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Impossible de charger les réservations.');
      }
      setReservations(data.bookings || []);
    } catch (_error) {
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showReservations) {
      loadReservations();
    }
  }, [showReservations, loadReservations]);

  const statusClass = (status) => {
    if (status === 'paid') return 'resa-status resa-status--paid';
    if (status === 'confirmed') return 'resa-status resa-status--confirmed';
    return 'resa-status resa-status--pending';
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
            <button className="outline-btn" onClick={() => setShowReservations((prev) => !prev)}>
              {showReservations ? 'Masquer mes réservations' : 'Mes réservations'}
            </button>
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
        {showReservations && (
          <section className="reservations-panel">
            <h3>Mes réservations</h3>
            <p className="muted">Historique des 50 dernières réservations enregistrées.</p>
            {reservationsLoading && <p className="muted">Chargement...</p>}
            {!reservationsLoading && reservations.length === 0 && (
              <p className="muted">Aucune réservation pour le moment.</p>
            )}
            <div className="reservations-grid">
              {reservations.map((reservation) => (
                <article className="reservation-card" key={reservation.id}>
                  <img src={reservation.image_url} alt={reservation.hotel_name} loading="lazy" />
                  <div className="reservation-body">
                    <h4>{reservation.hotel_name}</h4>
                    <p>{reservation.city}, {reservation.country}</p>
                    <p>
                      {reservation.check_in} → {reservation.check_out}
                    </p>
                    <p>
                      {reservation.guests_count} voyageur{reservation.guests_count > 1 ? 's' : ''}
                    </p>
                    <p>{formatPrice(Number.parseFloat(reservation.price_per_night))} / nuit</p>
                    <span className={statusClass(reservation.status)}>{reservation.status || 'pending'}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

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
                  <p>Type : {hotel.type} · Max {hotel.max_guests} voyageurs</p>
                  <p>⭐ {hotel.rating} ({hotel.review_count} avis)</p>
                  <div className="search-result-footer">
                    <strong>{formatPrice(hotel.price_per_night)} / nuit</strong>
                    <button className="btn-reserver" onClick={() => openBooking(hotel)}>Réserver</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {selectedHotel && (
            <div className="modal-overlay" onClick={closeBooking}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={closeBooking} aria-label="Fermer">✕</button>

                {bookingResult?.ok ? (
                  <div className="booking-success">
                    <div className="booking-success-icon">✅</div>
                    <h2>Réservation confirmée !</h2>
                    <p>
                      <strong>{bookingResult.data.hotel_name}</strong> — {bookingResult.data.city}
                    </p>
                    <p>
                      {bookingResult.data.check_in} → {bookingResult.data.check_out} ({bookingResult.data.nights} nuit{bookingResult.data.nights > 1 ? 's' : ''})
                    </p>
                    <p>👥 {bookingResult.data.guests_count} voyageur{bookingResult.data.guests_count > 1 ? 's' : ''}</p>
                    <p className="booking-total">Total : {formatPrice(bookingResult.data.total_price)}</p>
                    {bookingResult.data.status === 'paid' && <span className="stripe-paid-badge">Paiement validé</span>}
                    <button className="btn-reserver" onClick={closeBooking}>Fermer</button>
                  </div>
                ) : (
                  <>
                    <img src={selectedHotel.image_url} alt={selectedHotel.name} className="modal-img" />
                    <div className="modal-body">
                      <h2>{selectedHotel.name}</h2>
                      <p className="muted">
                        {selectedHotel.city}, {selectedHotel.country} · ⭐ {selectedHotel.rating}
                      </p>
                      <p className="modal-price">{formatPrice(selectedHotel.price_per_night)} <span>/ nuit</span></p>

                      {bookingResult && !bookingResult.ok && <p className="search-error">{bookingResult.message}</p>}
                      {paymentError && <p className="search-error">{paymentError}</p>}
                      {!stripePublicKey && (
                        <p className="search-error">
                          Paiement Stripe non configuré: variable VITE_STRIPE_PUBLIC_KEY manquante côté frontend.
                        </p>
                      )}

                      {!paymentData && (
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
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                                  <option key={count} value={count}>
                                    {count} voyageur{count > 1 ? 's' : ''}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <button className="btn-reserver btn-full" type="submit" disabled={bookingLoading}>
                            {bookingLoading ? 'Préparation du paiement...' : 'Passer au paiement'}
                          </button>
                        </form>
                      )}

                      {paymentData && (
                        <>
                          {stripePromise ? (
                            <Elements stripe={stripePromise}>
                              <StripePaymentForm
                                paymentData={paymentData}
                                bookingForm={bookingForm}
                                selectedHotel={selectedHotel}
                                onSuccess={(data) => setBookingResult({ ok: true, data })}
                                onError={setPaymentError}
                                formatPrice={formatPrice}
                              />
                            </Elements>
                          ) : (
                            <p className="muted">Paiement Stripe indisponible (VITE_STRIPE_PUBLIC_KEY manquant).</p>
                          )}

                          <button className="btn-back" type="button" onClick={() => setPaymentData(null)}>
                            Retour
                          </button>
                        </>
                      )}
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
