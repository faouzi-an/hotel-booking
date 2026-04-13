import { getPool, setCors } from '../_db.js';

const typeMap = {
  hotel: 'hotel',
  appartement: 'appartement',
  villa: 'villa',
};

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const destination = (req.query.destination || '').toString().trim().toLowerCase();
  const guests = Number.parseInt(req.query.guests, 10) || 1;
  const type = typeMap[(req.query.type || 'hotel').toString()] || 'hotel';

  const values = [type, guests];
  const escaped = destination.replace(/'/g, "''");
  const destFilter = destination
    ? `AND (LOWER(h.city) LIKE '%${escaped}%' OR LOWER(h.name) LIKE '%${escaped}%')`
    : '';

  const query = `
    SELECT
      h.id,
      h.name,
      h.city,
      h.country,
      h.property_type AS type,
      h.price_per_night,
      h.rating,
      h.review_count,
      h.image_url,
      h.max_guests
    FROM hotels h
    WHERE h.property_type = $1
      AND h.max_guests >= $2
      ${destFilter}
    ORDER BY h.rating DESC, h.price_per_night ASC
    LIMIT 20
  `;

  try {
    const pool = await getPool();
    const result = await pool.query(query, values);
    return res.status(200).json({ hotels: result.rows });
  } catch (_error) {
    return res.status(500).json({ message: 'Search failed.' });
  }
}
