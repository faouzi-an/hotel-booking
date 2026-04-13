import { getPool, parseJsonBody, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = await parseJsonBody(req);
    const { hotel_id, check_in, check_out, guests_count } = body;

    if (!hotel_id || !check_in || !check_out || !guests_count) {
      return res.status(400).json({ message: 'Champs manquants : hotel_id, check_in, check_out, guests_count.' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Dates invalides. La date de depart doit etre apres la date d'arrivee." });
    }

    const pool = await getPool();
    const hotelResult = await pool.query('SELECT id, name, city, price_per_night FROM hotels WHERE id = $1', [hotel_id]);
    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Hotel introuvable.' });
    }

    const hotel = hotelResult.rows[0];
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const total = (nights * Number.parseFloat(hotel.price_per_night)).toFixed(2);

    await pool.query(
      'INSERT INTO bookings (hotel_id, check_in, check_out, guests_count) VALUES ($1, $2, $3, $4)',
      [hotel_id, check_in, check_out, guests_count]
    );

    return res.status(201).json({
      message: 'Reservation confirmee !',
      hotel_name: hotel.name,
      city: hotel.city,
      check_in,
      check_out,
      nights,
      guests_count,
      total_price: Number.parseFloat(total),
    });
  } catch (_error) {
    return res.status(500).json({ message: 'Erreur lors de la reservation.' });
  }
}
