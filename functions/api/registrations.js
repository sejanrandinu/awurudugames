export async function onRequestGet(context) {
  const { env } = context;
  try {
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}
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
    
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}

    await env.DB.prepare(
      'INSERT INTO registrations (id, eventId, eventName, price, name, phone, guess, isPaid) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
    ).bind(id, eventId, eventName, price, name, phone, guess || '').run();
    
    return Response.json({ success: true, id });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { id, isPaid } = data;
    
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}
    
    await env.DB.prepare(
      'UPDATE registrations SET isPaid = ? WHERE id = ?'
    ).bind(isPaid ? 1 : 0, id).run();
    
    return Response.json({ success: true });
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
