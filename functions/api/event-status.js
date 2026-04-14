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
    const { eventId, isDisabled } = data;
    
    // Create table if missing
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS event_status (eventId TEXT PRIMARY KEY, isDisabled INTEGER);').run();

    await env.DB.prepare(
      'INSERT INTO event_status (eventId, isDisabled) VALUES (?, ?) ON CONFLICT(eventId) DO UPDATE SET isDisabled=excluded.isDisabled'
    ).bind(eventId, isDisabled ? 1 : 0).run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
