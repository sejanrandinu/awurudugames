export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const phone = url.searchParams.get('phone');
  
  try {
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isManualWinner BOOLEAN DEFAULT 0').run(); } catch (e) {}
    
    let query = 'SELECT * FROM registrations ORDER BY timestamp DESC';
    let stmt;
    
    if (phone) {
      query = 'SELECT * FROM registrations WHERE phone = ? ORDER BY timestamp DESC';
      stmt = env.DB.prepare(query).bind(phone);
    } else {
      stmt = env.DB.prepare(query);
    }
    
    const { results } = await stmt.all();
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
    const timestamp = new Date().toISOString();
    
    // Ensure table structure
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isManualWinner BOOLEAN DEFAULT 0').run(); } catch (e) {}
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN timestamp TEXT').run(); } catch (e) {}

    await env.DB.prepare(
      'INSERT INTO registrations (id, eventId, eventName, price, name, phone, guess, isPaid, isManualWinner, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)'
    ).bind(id, eventId, eventName, price, name, phone, guess || '', timestamp).run();
    
    return Response.json({ success: true, id });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { id, isPaid, isManualWinner } = data;
    
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isPaid BOOLEAN DEFAULT 0').run(); } catch (e) {}
    try { await env.DB.prepare('ALTER TABLE registrations ADD COLUMN isManualWinner BOOLEAN DEFAULT 0').run(); } catch (e) {}
    
    if (isPaid !== undefined) {
      await env.DB.prepare('UPDATE registrations SET isPaid = ? WHERE id = ?').bind(isPaid ? 1 : 0, id).run();
    }
    
    if (isManualWinner !== undefined) {
      await env.DB.prepare('UPDATE registrations SET isManualWinner = ? WHERE id = ?').bind(isManualWinner ? 1 : 0, id).run();
    }
    
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
