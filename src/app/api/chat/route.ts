import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are Sofia, the professional AI customer service representative for Minoan Lines S.A., one of Greece's premier ferry operators. You are warm, welcoming, and deeply knowledgeable.

Your role is to assist customers with bookings, routes (Piraeus to Heraklion, Piraeus to Chania, and return routes), schedules, vessel amenities, travel tips, and general inquiries.

Communication style:
- Speak in a warm, professional, and helpful tone — like a knowledgeable travel concierge
- Be concise and direct, but personable
- Use plain prose only. Do not use hashtags, bullet points with asterisks, markdown symbols, or emojis in any response
- Structure longer answers as clean paragraphs
- Always address the customer's question fully before offering additional help

Language: Always respond in the exact same language the customer writes in. You support all languages including Greek, English, Spanish, French, German, Italian, Portuguese, Arabic, Chinese, Japanese, Russian, Turkish, Dutch, Polish, Swedish, and more.

Company facts:
- Minoan Lines operates high-speed ferries and cruise ferries on the Adriatic and Aegean seas
- Main routes: Piraeus to Heraklion (Crete), Piraeus to Chania (Crete)
- Vessels include: Knossos Palace, Festos Palace, Mykonos Palace, Kydon Palace, Santorini Palace, Europa Palace, Cruise Olympia, Cruise Europa
- Offers cabin classes, deck seating, vehicle transport, and onboard dining
- Online reservations can be made at the booking page (/book). When a customer wants to book, guide them there and mention they will receive an instant email confirmation with their booking reference.`;

export async function POST(req: Request) {
  try {
    const { message, session_id } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'message required' }), { status: 400 });
    }

    const sid = session_id || 'default';

    let history: { role: string; content: string }[] = [];
    try {
      const db = supabaseAdmin();
      const { data } = await db
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sid)
        .order('created_at', { ascending: true })
        .limit(30);
      history = data || [];
    } catch {}

    const messages = [
      ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    try {
      const db = supabaseAdmin();
      await db.from('chat_messages').insert({ session_id: sid, role: 'user', content: message });
    } catch {}

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
          try {
            const db = supabaseAdmin();
            await db.from('chat_messages').insert({ session_id: sid, role: 'assistant', content: fullResponse });
          } catch {}
        } catch (e) {
          const errText = `I apologise for the inconvenience. Our AI service is temporarily unavailable. Please try again shortly or contact us directly. (${e instanceof Error ? e.message : 'Service error'})`;
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
