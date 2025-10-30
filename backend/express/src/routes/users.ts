import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/users/:id - fetch single user by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, user_name, created_at')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: data });
});

export default router;


