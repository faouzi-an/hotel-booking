import Stripe from 'stripe';
import { getPool, parseJsonBody, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({ message: 'Stripe non configuré (STRIPE_SECRET_KEY manquant).' });
  }

  try {
    const body = await parseJsonBody(req);
    const { hotel_id, check_in, check_out, guests_count } = body;

    if (!hotel_id || !check_in || !check_out || !guests_count) {
      return res.status(400).json({ message: 'Champs manquants.' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Dates invalides." });
    }

    const pool = await getPool();
    const { rows } = await pool.query('SELECT id, name, city, price_per_night FROM hotels WHERE id = $1', [hotel_id]);
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

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: totalCents,
      nights,
      hotel_name: hotel.name,
      city: hotel.city,
    });
  } catch (error) {
    console.error('PaymentIntent error', error);
    return res.status(500).json({ message: error.message || 'Erreur Stripe.' });
  }
}
