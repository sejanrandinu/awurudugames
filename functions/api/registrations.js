export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM registrations ORDER BY timestamp DESC').all();
    return Response.json(results || []);
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const id = crypto.randomUUID();
    const { eventId, eventName, price, name, phone, guess } = data;
    
    await env.DB.prepare(
      'INSERT INTO registrations (id, eventId, eventName, price, name, phone, guess) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, eventId, eventName, price, name, phone, guess || '').run();
    
    return Response.json({ success: true, id });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { env } = context;
  try {
    await env.DB.prepare('DELETE FROM registrations').run();
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
