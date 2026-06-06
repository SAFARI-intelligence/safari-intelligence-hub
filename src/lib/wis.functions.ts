import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type SpeciesFactInput = { species: string; behavior?: string };
type JournalInput = {
  species: string;
  park: string;
  observedAt?: string;
  note: string;
  photoUrl?: string | null;
  bookingId?: string | null;
};

// Public-ish: returns a shared species fact. Uses admin to read/write the shared cache row.
export const getSpeciesFact = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => {
    const v = input as SpeciesFactInput;
    if (!v?.species || typeof v.species !== 'string' || v.species.length > 80) {
      throw new Error('Invalid species');
    }
    return {
      species: v.species.trim(),
      behavior: typeof v.behavior === 'string' ? v.behavior.trim().slice(0, 60) : undefined,
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { callGatewayText, hashPrompt } = await import('./wis-ai.server');

    const refId = `${data.species.toLowerCase()}::${(data.behavior ?? '').toLowerCase()}`;
    const system = 'You are a Kenyan safari naturalist. Write concise, vivid field-guide notes for tourists. Avoid fluff.';
    const user = data.behavior
      ? `Write a 70–110 word "Did you know?" snippet about ${data.species} exhibiting "${data.behavior}" behavior. Focus on one surprising ecological or behavioral insight relevant to safari viewers in East Africa.`
      : `Write a 70–110 word "Did you know?" snippet about the ${data.species} in East Africa — one surprising ecological or behavioral insight.`;
    const promptHash = hashPrompt(`v1::${system}::${user}`);

    const cached = await supabaseAdmin
      .from('wis_narratives')
      .select('body')
      .eq('scope', 'species_fact')
      .eq('ref_id', refId)
      .eq('prompt_hash', promptHash)
      .maybeSingle();
    if (cached.data?.body) return { body: cached.data.body, cached: true };

    const ai = await callGatewayText({ system, user });
    await supabaseAdmin.from('wis_narratives').insert({
      scope: 'species_fact',
      ref_id: refId,
      model: ai.model,
      prompt_hash: promptHash,
      body: ai.text,
      tokens_in: ai.tokensIn,
      tokens_out: ai.tokensOut,
    });
    return { body: ai.text, cached: false };
  });

export const listMyJournal = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const entries = await supabase
      .from('wis_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('observed_at', { ascending: false });
    if (entries.error) throw new Error(entries.error.message);
    const ids = (entries.data ?? []).map((e) => e.id);
    let narratives: Array<{ ref_id: string; body: string }> = [];
    if (ids.length) {
      const n = await supabase
        .from('wis_narratives')
        .select('ref_id, body')
        .eq('scope', 'journal')
        .in('ref_id', ids);
      narratives = (n.data ?? []) as Array<{ ref_id: string; body: string }>;
    }
    const byEntry = new Map(narratives.map((n) => [n.ref_id, n.body]));
    return {
      entries: (entries.data ?? []).map((e) => ({
        ...e,
        narrative: byEntry.get(e.id) ?? null,
      })),
    };
  });

export const createJournalEntry = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const v = input as JournalInput;
    if (!v?.species || !v?.park || !v?.note) throw new Error('Missing fields');
    if (v.note.length > 500) throw new Error('Note too long');
    return {
      species: v.species.trim().slice(0, 80),
      park: v.park.trim().slice(0, 80),
      observedAt: v.observedAt ?? new Date().toISOString(),
      note: v.note.trim(),
      photoUrl: v.photoUrl ?? null,
      bookingId: v.bookingId ?? null,
    };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const inserted = await supabase
      .from('wis_journal_entries')
      .insert({
        user_id: userId,
        species: data.species,
        park: data.park,
        observed_at: data.observedAt,
        note: data.note,
        photo_url: data.photoUrl,
        booking_id: data.bookingId,
      })
      .select()
      .single();
    if (inserted.error) throw new Error(inserted.error.message);

    // Generate narrative — best-effort
    let narrative: string | null = null;
    try {
      const { callGatewayText, hashPrompt } = await import('./wis-ai.server');
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const system =
        'You are an evocative safari journal ghostwriter. Weave the tourist note, species, and park into a vivid 90–130 word diary snippet in second person. Reference the Kenyan/East African landscape sensorially. Avoid clichés.';
      const user = `Species: ${data.species}\nPark: ${data.park}\nObserved at: ${data.observedAt}\nTourist note: """${data.note}"""\nWrite the journal snippet now.`;
      const promptHash = hashPrompt(`v1::${data.species}::${data.note}`);
      const ai = await callGatewayText({ system, user });
      narrative = ai.text;
      await supabaseAdmin.from('wis_narratives').insert({
        user_id: userId,
        scope: 'journal',
        ref_id: inserted.data.id,
        model: ai.model,
        prompt_hash: promptHash,
        body: ai.text,
        tokens_in: ai.tokensIn,
        tokens_out: ai.tokensOut,
      });
    } catch (err) {
      console.error('journal narrative failed', err);
    }

    return { entry: inserted.data, narrative };
  });

export const deleteJournalEntry = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const v = input as { id: string };
    if (!v?.id) throw new Error('Missing id');
    return { id: v.id };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from('wis_journal_entries')
      .delete()
      .eq('id', data.id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateTripSummary = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const v = input as { bookingId: string };
    if (!v?.bookingId) throw new Error('Missing bookingId');
    return { bookingId: v.bookingId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { callGatewayJson } = await import('./wis-ai.server');

    const entries = await supabase
      .from('wis_journal_entries')
      .select('species, park, observed_at, note')
      .eq('user_id', userId)
      .eq('booking_id', data.bookingId)
      .order('observed_at', { ascending: true });
    if (entries.error) throw new Error(entries.error.message);
    if (!entries.data || entries.data.length === 0) {
      throw new Error('No journal entries for this booking yet');
    }

    const rarity = await supabaseAdmin.from('wis_species_rarity').select('species, rarity_score');
    const rarityMap = new Map((rarity.data ?? []).map((r) => [r.species.toLowerCase(), r.rarity_score]));
    const enriched = entries.data.map((e) => ({
      ...e,
      rarity: rarityMap.get((e.species ?? '').toLowerCase()) ?? 5,
    }));

    const system =
      'You are SAFARI Intelligence, a wildlife data curator. Produce a JSON object summarizing the trip. Return the JSON shape EXACTLY: {"top": [{"title": string, "why": string, "rarity_score": number}], "narrative": string}. The "top" array MUST have exactly 5 items ranked by rarity then narrative impact. "narrative" is 120–180 words in warm second person.';
    const user = `Journal entries for this safari (rarity 1–10):\n${JSON.stringify(enriched)}`;

    const ai = await callGatewayJson<{
      top: Array<{ title: string; why: string; rarity_score: number }>;
      narrative: string;
    }>({ system, user });

    const upserted = await supabase
      .from('wis_trip_summaries')
      .upsert(
        {
          user_id: userId,
          booking_id: data.bookingId,
          top_moments: ai.data.top ?? [],
          narrative: ai.data.narrative ?? '',
        },
        { onConflict: 'user_id,booking_id' },
      )
      .select()
      .single();
    if (upserted.error) throw new Error(upserted.error.message);
    return { summary: upserted.data };
  });

export const getTripSummary = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const v = input as { bookingId: string };
    if (!v?.bookingId) throw new Error('Missing bookingId');
    return { bookingId: v.bookingId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from('wis_trip_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('booking_id', data.bookingId)
      .maybeSingle();
    return { summary: row };
  });
