export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM prizes').all();
    return Response.json(results || []);
  } catch (err) {
    return new Response('[]', { status: 200 }); 
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { eventId, prizeText } = data;
    
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS prizes (eventId TEXT PRIMARY KEY, prizeText TEXT);').run();

    await env.DB.prepare(
      'INSERT INTO prizes (eventId, prizeText) VALUES (?, ?) ON CONFLICT(eventId) DO UPDATE SET prizeText=excluded.prizeText'
    ).bind(eventId, prizeText || '').run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
