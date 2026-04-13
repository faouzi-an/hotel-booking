DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS hotels;

CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  country VARCHAR(80) NOT NULL,
  property_type VARCHAR(30) NOT NULL CHECK (property_type IN ('hotel', 'appartement', 'villa')),
  price_per_night NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(2, 1) NOT NULL,
  review_count INT NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  max_guests INT NOT NULL DEFAULT 2
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  hotel_id INT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO hotels (name, city, country, property_type, price_per_night, rating, review_count, image_url, max_guests)
VALUES
  ('Grand Palais Hotel', 'Paris', 'France', 'hotel', 189, 4.8, 1234, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', 2),
  ('Rive Gauche Suites', 'Paris', 'France', 'appartement', 149, 4.6, 846, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', 4),
  ('Villa Lumiere', 'Nice', 'France', 'villa', 299, 4.9, 412, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80', 6),
  ('Azur Stay', 'Nice', 'France', 'hotel', 121, 4.4, 654, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80', 3),
  ('Le Vieux Port Hotel', 'Marseille', 'France', 'hotel', 99, 4.2, 432, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80', 2),
  ('Canut Loft', 'Lyon', 'France', 'appartement', 109, 4.5, 532, 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80', 4),
  ('Bellecour Residence', 'Lyon', 'France', 'hotel', 115, 4.3, 387, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80', 2),
  ('Chateau des Dunes', 'Bordeaux', 'France', 'villa', 340, 4.9, 277, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80', 8),
  ('Opera Boutique Hotel', 'Paris', 'France', 'hotel', 176, 4.7, 978, 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80', 2),
  ('Croisette Palm Villa', 'Cannes', 'France', 'villa', 390, 4.8, 204, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80', 7),
  ('Le Confluence Hotel', 'Lyon', 'France', 'hotel', 135, 4.5, 621, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', 2),
  ('Presqu ile Loft', 'Lyon', 'France', 'appartement', 98, 4.3, 408, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80', 4),
  ('Promenade Riviera Hotel', 'Nice', 'France', 'hotel', 145, 4.6, 733, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', 2),
  ('Villa des Arenes', 'Nice', 'France', 'villa', 265, 4.7, 319, 'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=1200&q=80', 5);

INSERT INTO bookings (hotel_id, check_in, check_out, guests_count)
VALUES
  (1, '2026-06-10', '2026-06-14', 2),
  (4, '2026-06-11', '2026-06-15', 2),
  (9, '2026-06-10', '2026-06-12', 1),
  (3, '2026-07-01', '2026-07-08', 4),
  (10, '2026-07-03', '2026-07-06', 5);
