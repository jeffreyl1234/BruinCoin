import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/trades - list open trades, supports ?limit&offset
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const offset = Number(req.query.offset ?? 0);

  const { data, error } = await supabase
    .from('trades')
    .select('id, offerer_user_id, skill_offered, description, accepted, created_at')
    .eq('accepted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ trades: data ?? [] });
});

export default router;


