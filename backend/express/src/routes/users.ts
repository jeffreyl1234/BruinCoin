import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/users - list users with optional search
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const offset = Number(req.query.offset ?? 0);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  let query = supabase
    .from('users')
    .select('id, email, user_name, created_at, bio, rating')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`user_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ users: data ?? [] });
});

// GET /api/users/:id - fetch single user by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, user_name, created_at, bio, rating')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: data });
});

// PATCH /api/users/:id - update user profile
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_name, email, bio } = req.body ?? {};

  const update: Record<string, unknown> = {};
  if (typeof user_name === 'string') update.user_name = user_name;
  if (typeof email === 'string') update.email = email;
  if (typeof bio === 'string') update.bio = bio;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const { data, error } = await supabase
    .from('users')
    .update(update)
    .eq('id', id)
    .select('id, email, user_name, created_at, bio, rating')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: data });
});

export default router;


