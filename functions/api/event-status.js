export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM event_status').all();
    return Response.json(results || []);
  } catch (err) {
    return Response.json([]); // Table might not exist yet
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { eventId, isDisabled, price } = data;
    
    // Create table if missing with new schema
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS event_status (eventId TEXT PRIMARY KEY, isDisabled INTEGER, price INTEGER);').run();

    // Migration: add price column if it doesn't exist
    try {
      await env.DB.prepare('ALTER TABLE event_status ADD COLUMN price INTEGER;').run();
    } catch (e) {}

    const { results } = await env.DB.prepare('SELECT * FROM event_status WHERE eventId = ?').bind(eventId).all();
    const existing = results[0] || {};

    const finalIsDisabled = isDisabled !== undefined ? (isDisabled ? 1 : 0) : (existing.isDisabled || 0);
    const finalPrice = price !== undefined ? price : (existing.price || 20);

    await env.DB.prepare(
      'INSERT INTO event_status (eventId, isDisabled, price) VALUES (?, ?, ?) ON CONFLICT(eventId) DO UPDATE SET isDisabled=excluded.isDisabled, price=excluded.price'
    ).bind(eventId, finalIsDisabled, finalPrice).run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
