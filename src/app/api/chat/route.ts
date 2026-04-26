import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the AI customer service assistant for Minoan Lines S.A.,
a premier Greek ferry operator. You help customers with bookings, routes (Piraeus↔Heraklion,
Piraeus↔Chania), schedules, vessel info, and travel tips.
IMPORTANT: Always respond in the SAME language the customer writes in.
You support ALL languages including Greek, English, Spanish, French, German, Italian,
Portuguese, Arabic, Chinese, Japanese, Russian, Turkish, Dutch, Polish, Swedish, and more.
Be friendly, concise, and professional.`;

export async function POST(req: Request) {
  try {
    const { message, session_id } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'message required' }), { status: 400 });
    }

    const sid = session_id || 'default';

    // Load history — non-fatal if Supabase unavailable
    let history: { role: string; content: string }[] = [];
    try {
      const db = supabaseAdmin();
      const { data } = await db
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sid)
        .order('created_at', { ascending: true })
        .limit(20);
      history = data || [];
    } catch {}

    const messages = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    // Save user message — non-fatal
    try {
      const db = supabaseAdmin();
      await db.from('chat_messages').insert({ session_id: sid, role: 'user', content: message });
    } catch {}

    // Start DeepSeek stream
    const stream = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1024,
    });

    let fullResponse = '';

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          // Save assistant response — non-fatal
          try {
            const db = supabaseAdmin();
            await db.from('chat_messages').insert({ session_id: sid, role: 'assistant', content: fullResponse });
          } catch {}
        } catch (e) {
          const errText = `Sorry, AI service error: ${e instanceof Error ? e.message : 'unknown error'}`;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: errText })}\n\n`));
        } finally {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
