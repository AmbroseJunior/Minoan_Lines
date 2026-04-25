import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the AI customer service assistant for Minoan Lines S.A.,
a premier Greek ferry operator. You help customers with bookings, routes (Piraeus↔Heraklion,
Piraeus↔Chania), schedules, vessel info, and travel tips. Respond in the same language as the
customer (Greek or English). Be friendly, concise, and professional.`;

export async function POST(req: Request) {
  const { message, session_id } = await req.json();

  if (!message) {
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400 });
  }

  const db = supabaseAdmin();

  // Load history
  const { data: history } = await db
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session_id || 'default')
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = [
    ...(history || []).map((h: { role: string; content: string }) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ];

  // Save user message
  await db.from('chat_messages').insert({
    session_id: session_id || 'default',
    role: 'user',
    content: message,
  });

  const stream = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    max_tokens: 1024,
  });

  let fullResponse = '';

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          fullResponse += text;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      // Save assistant response
      await db.from('chat_messages').insert({
        session_id: session_id || 'default',
        role: 'assistant',
        content: fullResponse,
      });
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
