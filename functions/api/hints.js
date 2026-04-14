export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM hints').all();
    return Response.json(results || []);
  } catch (err) {
    return new Response('[]', { status: 200 }); // In case table is not ready yet, don't crash
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { eventId, hintText, hintImage } = data;
    
    // Create table gracefully if missing
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS hints (eventId TEXT PRIMARY KEY, hintText TEXT, hintImage TEXT);').run();

    // Check if column exists, if not add it (migration-like)
    try {
      await env.DB.prepare('ALTER TABLE hints ADD COLUMN hintImage TEXT;').run();
    } catch (e) {
      // Column already exists probably
    }

    await env.DB.prepare(
      'INSERT INTO hints (eventId, hintText, hintImage) VALUES (?, ?, ?) ON CONFLICT(eventId) DO UPDATE SET hintText=excluded.hintText, hintImage=excluded.hintImage'
    ).bind(eventId, hintText || '', hintImage || null).run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
