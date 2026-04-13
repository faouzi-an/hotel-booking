import { useState } from 'react';

const hotels = [
  {
    id: 1,
    name: 'Grand Palais Hôtel',
    location: 'Paris, France',
    stars: 5,
    rating: 4.9,
    reviews: 1240,
    price: 289,
    badge: 'Coup de cœur',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    amenities: ['Spa', 'Piscine', 'Restaurant', 'Wi-Fi'],
  },
  {
    id: 2,
    name: 'Azure Beach Resort',
    location: "Nice, Côte d'Azur",
    stars: 5,
    rating: 4.8,
    reviews: 892,
    price: 195,
    badge: 'Vue mer',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
    amenities: ['Plage privée', 'Bar', 'Piscine', 'Parking'],
  },
  {
    id: 3,
    name: 'Château des Alpes',
    location: 'Chamonix, Savoie',
    stars: 4,
    rating: 4.7,
    reviews: 543,
    price: 158,
    badge: 'Vue montagne',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
    amenities: ['Ski', 'Sauna', 'Cheminée', 'Wi-Fi'],
  },
];

const renderStars = (count) =>
  '★'.repeat(count) + '☆'.repeat(5 - count);

const HotelCard = ({ hotel }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="hotel-card">
      <div className="hotel-image">
        <img src={hotel.image} alt={hotel.name} loading="lazy" />
        <span className="hotel-badge">{hotel.badge}</span>
        <button
          className="hotel-wishlist"
          onClick={() => setLiked(!liked)}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {liked ? '❤️' : '♡'}
        </button>
      </div>

      <div className="hotel-body">
        <div className="hotel-location">📍 {hotel.location}</div>
        <div className="hotel-name">{hotel.name}</div>

        <div className="hotel-rating">
          <span className="stars">{renderStars(hotel.stars)}</span>
          <span className="rating-score">{hotel.rating}</span>
          <span className="rating-count">({hotel.reviews} avis)</span>
        </div>

        <div className="hotel-amenities">
          {hotel.amenities.map((a) => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
        </div>

        <div className="hotel-footer">
          <div>
            <div className="price-amount">{hotel.price} €</div>
            <div className="price-night">par nuit</div>
          </div>
          <button className="btn-reserve">Réserver</button>
        </div>
      </div>
    </div>
  );
};

const FeaturedHotels = () => (
  <section className="section section-light" id="hotels">
    <div className="section-container">
      <div className="section-header">
        <div className="section-badge">Nos Sélections</div>
        <h2 className="section-title">Hôtels en Vedette</h2>
        <p className="section-subtitle">
          Établissements d&apos;exception soigneusement sélectionnés pour vous
        </p>
      </div>
      <div className="hotels-grid">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedHotels;
