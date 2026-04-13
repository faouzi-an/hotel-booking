import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { Pool } from 'pg';
import { newDb } from 'pg-mem';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// ---------------------------------------------------------------------------
// Database: pg-mem (in-memory) fallback when no real Postgres is available
// ---------------------------------------------------------------------------
async function buildPool() {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }

  const localPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hotel_booking',
  });
  try {
    await localPool.query('SELECT 1');
    console.log('Connected to local PostgreSQL.');
    return localPool;
  } catch (_err) {
    await localPool.end().catch(() => {});
    console.log('Local PostgreSQL unavailable — using in-memory database (pg-mem).');
  }

  const db = newDb();
  db.public.none(`
    CREATE TABLE hotels (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      city VARCHAR(80) NOT NULL,
      country VARCHAR(80) NOT NULL,
      property_type VARCHAR(30) NOT NULL,
      price_per_night NUMERIC(10,2) NOT NULL,
      rating NUMERIC(2,1) NOT NULL,
      review_count INT NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      max_guests INT NOT NULL DEFAULT 2
    );
    CREATE TABLE bookings (
      id SERIAL PRIMARY KEY,
      hotel_id INT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests_count INT NOT NULL,
      guest_email VARCHAR(200),
      payment_intent_id VARCHAR(200),
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    INSERT INTO hotels (name,city,country,property_type,price_per_night,rating,review_count,image_url,max_guests) VALUES
      ('Grand Palais Hotel','Paris','France','hotel',189,4.8,1234,'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',2),
      ('Rive Gauche Suites','Paris','France','appartement',149,4.6,846,'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',4),
      ('Villa Lumiere','Nice','France','villa',299,4.9,412,'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80',6),
      ('Azur Stay','Nice','France','hotel',121,4.4,654,'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80',3),
      ('Le Vieux Port Hotel','Marseille','France','hotel',99,4.2,432,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',2),
      ('Canut Loft','Lyon','France','appartement',109,4.5,532,'https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80',4),
      ('Bellecour Residence','Lyon','France','hotel',115,4.3,387,'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',2),
      ('Chateau des Dunes','Bordeaux','France','villa',340,4.9,277,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',8),
      ('Opera Boutique Hotel','Paris','France','hotel',176,4.7,978,'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80',2),
      ('Croisette Palm Villa','Cannes','France','villa',390,4.8,204,'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',7),
      ('Le Confluence Hotel','Lyon','France','hotel',135,4.5,621,'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',2),
      ('Presqu ile Loft','Lyon','France','appartement',98,4.3,408,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',4),
      ('Promenade Riviera Hotel','Nice','France','hotel',145,4.6,733,'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80',2),
      ('Villa des Arenes','Nice','France','villa',265,4.7,319,'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&q=80',5);
    INSERT INTO bookings (hotel_id,check_in,check_out,guests_count,status) VALUES
      (1,'2026-06-10','2026-06-14',2,'paid'),
      (4,'2026-06-11','2026-06-15',2,'confirmed'),
      (9,'2026-06-10','2026-06-12',1,'paid'),
      (3,'2026-07-01','2026-07-08',4,'confirmed'),
      (10,'2026-07-03','2026-07-06',5,'paid');
  `);

  const { Pool: MemPool } = db.adapters.createPg();
  return new MemPool();
}

const pool = await buildPool();

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (_error) {
    res.status(500).json({ ok: false, message: 'Database unavailable' });
  }
});

app.get('/api/hotels/search', async (req, res) => {
  const destination = (req.query.destination || '').toString().trim().toLowerCase();
  const guests = Number.parseInt(req.query.guests, 10) || 1;
  const typeMap = { hotel: 'hotel', appartement: 'appartement', villa: 'villa' };
  const type = typeMap[(req.query.type || 'hotel').toString()] || 'hotel';

  const values = [type, guests];
  const destFilter = destination
    ? `AND (LOWER(h.city) LIKE '%${destination.replace(/'/g, "''")}%' OR LOWER(h.name) LIKE '%${destination.replace(/'/g, "''")}%')`
    : '';

  const query = `
    SELECT h.id, h.name, h.city, h.country,
           h.property_type AS type, h.price_per_night, h.rating,
           h.review_count, h.image_url, h.max_guests
    FROM hotels h
    WHERE h.property_type = $1 AND h.max_guests >= $2 ${destFilter}
    ORDER BY h.rating DESC, h.price_per_night ASC
    LIMIT 20
  `;

  try {
    const result = await pool.query(query, values);
    res.json({ hotels: result.rows });
  } catch (error) {
    console.error('Search failed', error);
    res.status(500).json({ message: 'Search failed.' });
  }
});

app.get('/api/bookings', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT b.id, b.check_in, b.check_out, b.guests_count,
             b.guest_email, b.payment_intent_id, b.status, b.created_at,
             h.name AS hotel_name, h.city, h.country, h.image_url, h.price_per_night
      FROM bookings b
      JOIN hotels h ON h.id = b.hotel_id
      ORDER BY b.created_at DESC
      LIMIT 50
    `);
    res.json({ bookings: rows });
  } catch (error) {
    console.error('Get bookings failed', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
  }
});

app.post('/api/create-payment-intent', async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ message: 'Stripe non configuré (STRIPE_SECRET_KEY manquant).' });
  }

  const { hotel_id, check_in, check_out, guests_count } = req.body;
  if (!hotel_id || !check_in || !check_out || !guests_count) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return res.status(400).json({ message: 'Dates invalides.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, city, price_per_night FROM hotels WHERE id = $1',
      [hotel_id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Hôtel introuvable.' });

    const hotel = rows[0];
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalCents = Math.round(nights * Number.parseFloat(hotel.price_per_night) * 100);

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      metadata: {
        hotel_id: String(hotel_id),
        hotel_name: hotel.name,
        city: hotel.city,
        check_in,
        check_out,
        guests_count: String(guests_count),
        nights: String(nights),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: totalCents,
      nights,
      hotel_name: hotel.name,
      city: hotel.city,
    });
  } catch (error) {
    console.error('PaymentIntent error', error);
    res.status(500).json({ message: error.message || 'Erreur Stripe.' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { hotel_id, check_in, check_out, guests_count, guest_email, payment_intent_id } = req.body;

  if (!hotel_id || !check_in || !check_out || !guests_count) {
    return res.status(400).json({ message: 'Champs manquants : hotel_id, check_in, check_out, guests_count.' });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return res.status(400).json({ message: "Dates invalides." });
  }

  try {
    const hotelResult = await pool.query(
      'SELECT id, name, city, price_per_night FROM hotels WHERE id = $1',
      [hotel_id]
    );
    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Hôtel introuvable.' });
    }

    const hotel = hotelResult.rows[0];
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const total = (nights * Number.parseFloat(hotel.price_per_night)).toFixed(2);

    let status = 'confirmed';
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (payment_intent_id && stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-04-10' });
      const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
      if (pi.status !== 'succeeded') {
        return res.status(400).json({ message: 'Paiement non confirmé par Stripe.' });
      }
      status = 'paid';
    }

    await pool.query(
      `INSERT INTO bookings (hotel_id, check_in, check_out, guests_count, guest_email, payment_intent_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [hotel_id, check_in, check_out, guests_count, guest_email || null, payment_intent_id || null, status]
    );

    res.status(201).json({
      message: 'Réservation confirmée !',
      hotel_name: hotel.name,
      city: hotel.city,
      check_in,
      check_out,
      nights,
      guests_count,
      total_price: Number.parseFloat(total),
      status,
    });
  } catch (error) {
    console.error('Booking failed', error);
    res.status(500).json({ message: 'Erreur lors de la réservation.' });
  }
});

app.listen(PORT, () => {
  console.log(`Hotel API running on http://localhost:${PORT}`);
});
