import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Helper to normalize participant pair
function normalizePair(a: string, b: string) {
  return a < b ? { a, b } : { a: b, b: a };
}

// POST /api/conversations - find or create a conversation between two users
router.post('/', async (req, res) => {
  const { participant_a, participant_b } = req.body ?? {};
  if (!participant_a || !participant_b || typeof participant_a !== 'string' || typeof participant_b !== 'string') {
    return res.status(400).json({ error: 'participant_a and participant_b (uuid strings) are required' });
  }
  const { a, b } = normalizePair(participant_a, participant_b);

  // Try to find existing
  const existing = await supabase
    .from('Conversations')
    .select('id, participant_a, participant_b, last_message_at, last_message_preview')
    .or(`and(participant_a.eq.${a},participant_b.eq.${b}),and(participant_a.eq.${b},participant_b.eq.${a})`)
    .maybeSingle();

  if (existing.error) return res.status(500).json({ error: existing.error.message });
  if (existing.data) return res.json({ conversation: existing.data });

  // Create new
  const created = await supabase
    .from('Conversations')
    .insert([{ participant_a: a, participant_b: b }])
    .select('id, participant_a, participant_b, last_message_at, last_message_preview')
    .single();

  if (created.error) return res.status(500).json({ error: created.error.message });
  return res.status(201).json({ conversation: created.data });
});

// GET /api/conversations?user_id=...&limit=&offset= - list a user's conversations
router.get('/', async (req, res) => {
  const userId = typeof req.query.user_id === 'string' ? req.query.user_id : undefined;
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const offset = Number(req.query.offset ?? 0);
  if (!userId) return res.status(400).json({ error: 'user_id is required' });

  const { data, error } = await supabase
    .from('Conversations')
    .select('id, participant_a, participant_b, last_message_at, last_message_preview')
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ conversations: data ?? [] });
});

// GET /api/conversations/:id - get a single conversation
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Conversations')
    .select('id, participant_a, participant_b, last_message_at, last_message_preview')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Conversation not found' });
  return res.json({ conversation: data });
});

export default router;


