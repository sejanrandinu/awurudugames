export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM results').all();
    return Response.json(results || []);
  } catch (err) {
    return new Response('[]', { status: 200 }); // In case table is not ready yet
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { eventId, resultText } = data;
    
    // Create table gracefully if missing
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS results (eventId TEXT PRIMARY KEY, resultText TEXT);').run();

    await env.DB.prepare(
      'INSERT INTO results (eventId, resultText) VALUES (?, ?) ON CONFLICT(eventId) DO UPDATE SET resultText=excluded.resultText'
    ).bind(eventId, resultText).run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
