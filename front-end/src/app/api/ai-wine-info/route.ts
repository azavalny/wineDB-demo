import OpenAI from 'openai';
export const runtime = 'edge';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const encoder = new TextEncoder();

export async function POST(req: Request) {
  const { wineName } = await req.json();

  const systemPrompt = `
You are an expert sommelier. Given the wine "${wineName}", return detailed advice in **valid JSON**.

Format:
{
  "storage": {
    "temperature_celsius": "10-15",
    "humidity_percent": "60-70",
    "position": "horizontal",
    "ageing_potential": "drink now or store up to 3 years"
  },
  "serving": {
    "drink_temp_celsius": "8-10",
    "needs_decanting": "no",
    "decant_time_minutes": 0
  },
  "pairings": ["seafood", "light pasta", "soft cheeses"],
  "tasting_notes": "Aromatic and crisp, with notes of lemon, apple, and mineral finish."
}
`;

  const chatStream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Tell me about ${wineName}` },
    ],
    max_tokens: 300,
  });

  const stream = new ReadableStream({
    async start(controller) {
      let fullJson = '';

      for await (const chunk of chatStream) {
        // In JSON mode the assistant's delta comes in `content`
        const piece = chunk.choices[0]?.delta?.content ?? '';
        fullJson += piece;

        /** Optional: push a "partial" event for live typing effect */
        controller.enqueue(
          encoder.encode(JSON.stringify({ partial: piece }) + '\n')
        );
      }

      /* ─── end of stream: send the final structured object ─── */
      try {
        const parsed = JSON.parse(fullJson);        // will succeed because of json_mode
        controller.enqueue(
          encoder.encode(JSON.stringify({ wineInfo: parsed }) + '\n')
        );
      } catch {
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: 'Invalid JSON from model' }) + '\n')
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-store',
    },
  });
}
