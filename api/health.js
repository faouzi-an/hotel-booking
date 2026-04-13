import { getPool, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const pool = await getPool();
    const result = await pool.query('SELECT NOW() AS now');
    return res.status(200).json({ ok: true, dbTime: result.rows[0].now });
  } catch (_error) {
    return res.status(500).json({ ok: false, message: 'Database unavailable' });
  }
}
