import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// POST /api/messages - create a message
router.post('/', async (req, res) => {
  const { sender_id, receiver_id, content, conversation_id } = req.body ?? {};

  if (!sender_id || typeof sender_id !== 'string') {
    return res.status(400).json({ error: 'sender_id (uuid string) is required' });
  }
  if (!receiver_id || typeof receiver_id !== 'string') {
    return res.status(400).json({ error: 'receiver_id (uuid string) is required' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content (string) is required' });
  }
  if (!conversation_id || typeof conversation_id !== 'string') {
    return res.status(400).json({ error: 'conversation_id (uuid string) is required' });
  }

  const insertRes = await supabase
    .from('Messages')
    .insert([{ sender_id, receiver_id, content, conversation_id }])
    .select('id, sender_id, receiver_id, content, created_at, conversation_id')
    .single();
  if (insertRes.error) return res.status(500).json({ error: insertRes.error.message });

  // Update conversation summary
  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;
  const updateConv = await supabase
    .from('Conversations')
    .update({ last_message_at: new Date().toISOString(), last_message_preview: preview })
    .eq('id', conversation_id);
  if (updateConv.error) return res.status(500).json({ error: updateConv.error.message });

  return res.status(201).json({ message: insertRes.data });
});

// GET /api/messages - list messages between two users or by conversation_id
// Query: sender_id, receiver_id, conversation_id, limit, offset
router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);
  const senderId = typeof req.query.sender_id === 'string' ? req.query.sender_id : undefined;
  const receiverId = typeof req.query.receiver_id === 'string' ? req.query.receiver_id : undefined;
  const conversationId = typeof req.query.conversation_id === 'string' ? req.query.conversation_id : undefined;

  let query = supabase
    .from('Messages')
    .select('id, sender_id, receiver_id, content, created_at, conversation_id')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (conversationId) {
    query = query.eq('conversation_id', conversationId);
  } else if (senderId && receiverId) {
    // messages where (sender_id=a AND receiver_id=b) OR (sender_id=b AND receiver_id=a)
    query = query.or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);
  } else if (senderId) {
    query = query.eq('sender_id', senderId);
  } else if (receiverId) {
    query = query.eq('receiver_id', receiverId);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ messages: data ?? [] });
});

// GET /api/messages/:id - fetch a single message
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Messages')
    .select('id, sender_id, receiver_id, content, created_at, conversation_id')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Message not found' });
  return res.json({ message: data });
});

export default router;


