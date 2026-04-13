import Stripe from 'stripe';
import { getPool, parseJsonBody, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pool = await getPool();

  // GET – list bookings
  if (req.method === 'GET') {
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
      return res.status(200).json({ bookings: rows });
    } catch (_error) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des réservations.' });
    }
  }

  // POST – create booking
  if (req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { hotel_id, check_in, check_out, guests_count, guest_email, payment_intent_id } = body;

      if (!hotel_id || !check_in || !check_out || !guests_count) {
        return res.status(400).json({ message: 'Champs manquants : hotel_id, check_in, check_out, guests_count.' });
      }

      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
        return res.status(400).json({ message: "Dates invalides." });
      }

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

      return res.status(201).json({
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
    } catch (_error) {
      return res.status(500).json({ message: 'Erreur lors de la réservation.' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
