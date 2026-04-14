export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare('SELECT * FROM settings WHERE key = "payment_info"').all();
    return Response.json(results[0] ? JSON.parse(results[0].value) : {});
  } catch (err) {
    return Response.json({});
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);').run();

    await env.DB.prepare(
      'INSERT INTO settings (key, value) VALUES ("payment_info", ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
    ).bind(JSON.stringify(data)).run();
    
    return Response.json({ success: true });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
