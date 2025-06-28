import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const encoder = new TextEncoder();

// Helper to stream text to the client
function streamText(controller: ReadableStreamDefaultController, text: string) {
  return new Promise<void>(async (resolve) => {
    for (let i = 0; i < text.length; i++) {
      await new Promise(r => setTimeout(r, 12));
      controller.enqueue(encoder.encode(JSON.stringify({ text: text[i] }) + '\n'));
    }
    resolve();
  });
}

// Helper to stream wines
function streamWines(controller: ReadableStreamDefaultController, wines: any[]) {
  controller.enqueue(encoder.encode(JSON.stringify({ wines }) + '\n'));
}

export async function POST(req: NextRequest) {
  const { prompt, username } = await req.json();

  // Store the prompt, username, and timestamp
  await supabase
    .from('search-prompts-from-users')
    .insert([
      {
        prompt,
        username,
        created_at: new Date().toISOString(),
      },
    ]);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Query Supabase for wines matching the food pairing BEFORE OpenAI call
        let winesMatchingFoodPairing = '';
        let foodQuery = prompt; // Simple: use the whole prompt as the food for now
        const { data: foodPairings, error: foodPairingError } = await supabase
          .from('food-pairing')
          .select('wine_id, wine:wine_id(*)')
          .ilike('name', `%${foodQuery}%`);
        if (foodPairingError) {
          controller.enqueue(encoder.encode(JSON.stringify({ text: '\n[Error fetching food pairings]\n' }) + '\n'));
          controller.close();
          return;
        }
        if (foodPairings && foodPairings.length > 0) {
          winesMatchingFoodPairing = (foodPairings as any[])
            .map(fp => (fp.wine && typeof fp.wine === 'object') ? `- ${fp.wine.name} (ID: ${fp.wine.wine_id})` : '')
            .join('\n');
        } else {
          winesMatchingFoodPairing = '[No matching wines found for this food pairing]';
        }

        const foodPairingWineList = await Promise.all(
          (foodPairings as any[])
            .map(fp => fp.wine)
            .filter(Boolean)
            .map(async (wine: any) => {
              // Fetch food pairings
              const { data: foodPairingsData } = await supabase
                .from('food-pairing')
                .select('name')
                .eq('wine_id', wine.wine_id);
              const foodPairingsArr = foodPairingsData ? foodPairingsData.map((p: any) => p.name) : [];
              // Fetch vineyard info
              let vineyard = null;
              if (wine.vineyard_id) {
                const { data: vineyardData } = await supabase
                  .from('vineyard')
                  .select('*')
                  .eq('vineyard_id', wine.vineyard_id)
                  .single();
                vineyard = vineyardData;
              }
              // Fetch full wine row if any key fields are missing
              const needsFullWine = !wine.grape || !wine.year || !wine.price || !wine.rating || !wine.classification;
              let fullWine = {};
              if (needsFullWine) {
                const { data: fullWineData } = await supabase
                  .from('wine')
                  .select('*')
                  .eq('wine_id', wine.wine_id)
                  .single();
                if (fullWineData) fullWine = fullWineData;
              }
              return {
                ...fullWine,
                ...wine,
                reviews: [],
                foodPairings: foodPairingsArr,
                vineyard,
                appelation: vineyard?.appelation,
                region: vineyard?.region,
                country: vineyard?.country
              };
            })
        );

        // Stream this to the client
        controller.enqueue(encoder.encode(JSON.stringify({ foodPairingWines: foodPairingWineList }) + '\n'));

        // Sommelier checks database for wines we have that pair well with what the user wants
        const systemPrompt = `You are an expert sommelier who is given a user's current cuisine or flavor they're in the mood for.\nBased on the following wines in our database that match what the user wants:\n${winesMatchingFoodPairing}\nIf there are no wines above, then say that we don't have any wines in our database that will pair well with what you want, but still give a recommendation for a wine that pairs well with what the user wants along with descriptions of the flavor and taste of the wine and do not mention the wine id.`;

        const chatStream = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 256,
        });


        let fullText = '';
        let jsonStart = -1;
        let jsonEnd = -1;
        let jsonCandidate = '';
        for await (const chunk of chatStream) {
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            await streamText(controller, content);
            // Try to find JSON in the response
            if (jsonStart === -1 && content.includes('{')) jsonStart = fullText.indexOf('{');
            if (jsonStart !== -1 && content.includes('}')) jsonEnd = fullText.indexOf('}', jsonStart);
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              jsonCandidate = fullText.slice(jsonStart, jsonEnd + 1);
              break;
            }
          }
        }

        // Store the complete AI response
        await supabase
          .from('ai-responses')
          .insert([
            {
              prompt,
              username,
              response: fullText,
              created_at: new Date().toISOString(),
            },
          ]);

        // Send the complete response as a final message
        controller.enqueue(encoder.encode(JSON.stringify({ completeResponse: fullText }) + '\n'));

        // 2. Parse the JSON for keywords
        let filterObj: any = {};
        try {
          filterObj = JSON.parse(jsonCandidate);
        } catch (e) {
          // fallback: try to extract keywords from the prompt
          filterObj = { wine_type: '', food: '', grape: '', region: '', country: '', year: '', classification: '', pairing: '', name: '' };
        }

        // 3. Query Supabase for matching wines
        let supabaseQuery = supabase
          .from('wine')
          .select(`*, vineyard:vineyard_id(*)`)
          .not('rating', 'is', null)
          .limit(20);
        if (filterObj.wine_type) {
          supabaseQuery = supabaseQuery.ilike('classification', `%${filterObj.wine_type}%`);
        }
        if (filterObj.grape) {
          supabaseQuery = supabaseQuery.ilike('grape', `%${filterObj.grape}%`);
        }
        if (filterObj.food) {
          // Join with food-pairing table
          supabaseQuery = supabase
            .from('wine')
            .select(`*, vineyard:vineyard_id(*), food_pairings:food-pairing(name)`)
            .not('rating', 'is', null)
            .ilike('food-pairing.name', `%${filterObj.food}%`)
            .limit(20);
        }
        if (filterObj.region) {
          supabaseQuery = supabaseQuery.ilike('vineyard.region', `%${filterObj.region}%`);
        }
        if (filterObj.country) {
          supabaseQuery = supabaseQuery.ilike('vineyard.country', `%${filterObj.country}%`);
        }
        if (filterObj.year) {
          supabaseQuery = supabaseQuery.eq('year', filterObj.year);
        }
        if (filterObj.classification) {
          supabaseQuery = supabaseQuery.ilike('classification', `%${filterObj.classification}%`);
        }
        if (filterObj.appelation) {
          supabaseQuery = supabaseQuery.ilike('vineyard.appelation', `%${filterObj.appelation}%`);
        }
        if (filterObj.name) {
          supabaseQuery = supabaseQuery.ilike('name', `%${filterObj.name}%`);
        }

        const { data: wineList, error } = await supabaseQuery;
        if (error) {
          controller.enqueue(encoder.encode(JSON.stringify({ text: '\n[Error fetching wines]\n' }) + '\n'));
          controller.close();
          return;
        }

        // 4. Format wine results
        const winesWithDetails = await Promise.all(
          (wineList || []).map(async (wine: any) => {
            let foodPairings = [];
            if (wine.food_pairings) {
              foodPairings = wine.food_pairings.map((p: any) => p.name);
            } else {
              const { data: foodPairingsData } = await supabase
                .from('food-pairing')
                .select('name')
                .eq('wine_id', wine.wine_id);
              foodPairings = foodPairingsData ? foodPairingsData.map((p: any) => p.name) : [];
            }
            return {
              ...wine,
              foodPairings,
              vineyard: wine.vineyard,
              appelation: wine.vineyard?.appelation,
              region: wine.vineyard?.region,
              country: wine.vineyard?.country,
            };
          })
        );
        streamWines(controller, winesWithDetails);
        controller.close();
      } catch (err) {
        console.error("General error in /api/ai-search:", err);
        controller.enqueue(encoder.encode(JSON.stringify({ text: '\n[AI or DB error]\n' }) + '\n'));
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-store',
    },
  });
} 