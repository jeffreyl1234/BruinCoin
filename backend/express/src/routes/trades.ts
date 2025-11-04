import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/trades - list trades with optional filters
// Query params: limit, offset, offerer_user_id, accepted (true/false)
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const offset = Number(req.query.offset ?? 0);
  const offererUserId = typeof req.query.offerer_user_id === 'string' ? req.query.offerer_user_id : undefined;
  const acceptedParam = typeof req.query.accepted === 'string' ? req.query.accepted : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const priceMin = typeof req.query.price_min === 'string' ? Number(req.query.price_min) : undefined;
  const priceMax = typeof req.query.price_max === 'string' ? Number(req.query.price_max) : undefined;
  const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;

  let query = supabase
    .from('Trades')
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted');

  if (offererUserId) {
    query = query.eq('offerer_user_id', offererUserId);
  }
  if (acceptedParam === 'true' || acceptedParam === 'false') {
    query = query.eq('accepted', acceptedParam === 'true');
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (search) {
    // Simple text search on title and description
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (priceMin !== undefined && !isNaN(priceMin)) {
    query = query.gte('price', priceMin);
  }
  if (priceMax !== undefined && !isNaN(priceMax)) {
    query = query.lte('price', priceMax);
  }
  if (tag) {
    // Filter by tag if tags array contains the tag
    query = query.contains('tags', [tag]);
  }

  query = query.order('id', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ trades: data ?? [] });
});

// POST /api/trades - create a trade
router.post('/', async (req, res) => {
  const { offerer_user_id, skill_offered, description } = req.body ?? {};

  if (!offerer_user_id || typeof offerer_user_id !== 'string') {
    return res.status(400).json({ error: 'offerer_user_id (uuid string) is required' });
  }
  if (!skill_offered || typeof skill_offered !== 'string') {
    return res.status(400).json({ error: 'skill_offered (string) is required' });
  }
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'description (string) is required' });
  }

  const title = req.body?.title;
  const category = req.body?.category ?? null;
  const price = req.body?.price ?? null;
  const tags = req.body?.tags ?? null;
  const image_urls = req.body?.image_urls ?? null;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title (string) is required' });
  }

  if (category !== null && typeof category !== 'string') {
    return res.status(400).json({ error: 'category must be a string when provided' });
  }

  if (price !== null && typeof price !== 'number') {
    return res.status(400).json({ error: 'price must be a number when provided' });
  }

  if (tags !== null && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array when provided' });
  }

  if (image_urls !== null && !Array.isArray(image_urls)) {
    return res.status(400).json({ error: 'image_urls must be an array when provided' });
  }

  const { data, error } = await supabase
    .from('Trades')
    .insert([{ offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted: false }])
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ trade: data });
});

// GET /api/trades/:id - fetch a single trade
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Trades')
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Trade not found' });
  return res.json({ trade: data });
});

// PATCH /api/trades/:id - update description or skill_offered
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, skill_offered, title, category, price, tags, image_urls } = req.body ?? {};

  const update: Record<string, unknown> = {};
  if (typeof description === 'string') update.description = description;
  if (typeof skill_offered === 'string') update.skill_offered = skill_offered;
  if (typeof title === 'string') update.title = title;
  if (typeof category === 'string') update.category = category;
  if (typeof price === 'number') update.price = price;
  if (Array.isArray(tags)) update.tags = tags;
  if (Array.isArray(image_urls)) update.image_urls = image_urls;
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const { data, error } = await supabase
    .from('Trades')
    .update(update)
    .eq('id', id)
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Trade not found' });
  return res.json({ trade: data });
});

// POST /api/trades/:id/accept - mark as accepted
router.post('/:id/accept', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Trades')
    .update({ accepted: true })
    .eq('id', id)
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Trade not found' });
  return res.json({ trade: data });
});

// POST /api/trades/:id/cancel - mark as not accepted
router.post('/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Trades')
    .update({ accepted: false })
    .eq('id', id)
    .select('id, offerer_user_id, skill_offered, title, description, price, category, tags, image_urls, accepted')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Trade not found' });
  return res.json({ trade: data });
});

// DELETE /api/trades/:id - delete a trade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('Trades')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

export default router;


