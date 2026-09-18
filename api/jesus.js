// Puente del Segundo Cerebro con Jesús (el bot de WhatsApp) y su CRM.
//
// El HTML es público: la llave del CRM NO puede vivir ahí. La app llama a ESTA
// función, que agrega X-CEO-Key del lado del servidor.
//
//   GET  /api/jesus?vista=pulso|leads|chat|hilo|cerebro
//   POST /api/jesus {accion:'hablar', mensaje}          -> Jesús le contesta a Dante
//                   {accion:'atender', conversacion_id} -> Dante toma ese chat
//                   {accion:'limpiar'}                  -> borra el hilo del chat
//                   {accion:'personalidad', texto}      -> cambia cómo habla Jesús
//                   {accion:'aprender', titulo, contenido}
//                   {accion:'olvidar', id}
//
// Variables en Vercel (proyecto segundo-cerebro-dante):
//   JESUS_API_KEY  — la misma que CEO_API_KEY en el proyecto wa-bot-mkt
//   JESUS_API_URL  — opcional; por defecto https://wa-bot-mkt.vercel.app

// ── Puerta: solo con sesión del Segundo Cerebro ──────────────────────────────
const SB_AUTH = 'https://qetocoxizvumespgocij.supabase.co/auth/v1/user';
const SB_PUB = 'sb_publishable_CiI6eCBZIcgwViXzkV9YXw_684eJYcf';
async function conSesion(req) {
  const h = req.headers.authorization || req.headers.Authorization || '';
  if (!h.startsWith('Bearer ') || h.length < 20) return false;
  try {
    const r = await fetch(SB_AUTH, { headers: { apikey: SB_PUB, Authorization: h } });
    return r.ok;
  } catch (e) { return false; }
}

const BASE = (process.env.JESUS_API_URL || 'https://wa-bot-mkt.vercel.app').replace(/\/+$/, '');

// Lista blanca: la app nunca decide rutas libres del CRM.
const VISTAS = {
  pulso: '/api/ceo/pulso?calientes=6',
  leads: '/api/ceo/leads?limite=12',
  chat: '/api/ceo/chat',
  hilo: '/api/ceo/hilo?limite=30',
  cerebro: '/api/ceo/cerebro',
};

async function alCrm(ruta, opciones = {}, msTope = 20000) {
  const llave = process.env.JESUS_API_KEY;
  if (!llave) {
    return { ok: false, motivo: 'sin_llave',
      detalle: 'Falta JESUS_API_KEY en Vercel → segundo-cerebro-dante → Settings → Environment Variables.' };
  }
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), msTope);
  try {
    const r = await fetch(BASE + ruta, {
      ...opciones,
      signal: corte.signal,
      headers: { 'X-CEO-Key': llave, 'Content-Type': 'application/json', ...(opciones.headers || {}) },
    });
    const texto = await r.text();
    let datos;
    try { datos = JSON.parse(texto); } catch (e) { datos = { crudo: texto.slice(0, 400) }; }
    if (!r.ok) {
      return { ok: false, motivo: r.status === 401 ? 'llave_no_coincide' : 'crm_' + r.status,
        detalle: (datos && (datos.error || datos.detail)) || ('HTTP ' + r.status) };
    }
    return datos;
  } catch (e) {
    const abortado = e && e.name === 'AbortError';
    return { ok: false, motivo: abortado ? 'timeout' : 'sin_conexion',
      detalle: abortado ? 'Jesús tardó demasiado en contestar.' : String(e.message || e) };
  } finally {
    clearTimeout(reloj);
  }
}

export default async function handler(req, res) {
  if (!(await conSesion(req))) {
    res.status(401).json({ ok: false, motivo: 'sin_sesion', detalle: 'Entra al Segundo Cerebro para ver esto.' });
    return;
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const post = (ruta, carga, tope) => alCrm(ruta, { method: 'POST', body: JSON.stringify(carga || {}) }, tope);

    switch (body.accion) {
      case 'hablar':
        if (!String(body.mensaje || '').trim()) { res.status(400).json({ ok: false, detalle: 'escribe algo' }); return; }
        // El chat piensa y consulta el CRM: se le da aire.
        res.status(200).json(await post('/api/ceo/hablar', { mensaje: body.mensaje }, 55000));
        return;
      case 'atender':
        if (!body.conversacion_id) { res.status(400).json({ ok: false, detalle: 'falta conversacion_id' }); return; }
        res.status(200).json(await post('/api/ceo/atender', { conversacion_id: body.conversacion_id }));
        return;
      case 'limpiar':
        res.status(200).json(await post('/api/ceo/chat/limpiar'));
        return;
      case 'personalidad':
        res.status(200).json(await post('/api/ceo/personalidad', { texto: body.texto || '' }));
        return;
      case 'aprender':
        res.status(200).json(await post('/api/ceo/aprender', {
          id: body.id || null, titulo: body.titulo || '', contenido: body.contenido || '',
        }));
        return;
      case 'olvidar':
        if (!body.id) { res.status(400).json({ ok: false, detalle: 'falta id' }); return; }
        res.status(200).json(await post('/api/ceo/olvidar/' + encodeURIComponent(body.id)));
        return;
      default:
        res.status(400).json({ ok: false, detalle: 'acción no reconocida' });
        return;
    }
  }

  const vista = (req.query && req.query.vista) || 'pulso';
  const ruta = VISTAS[vista] || VISTAS.pulso;
  // 200 siempre: la app pinta el motivo en la tarjeta en vez de tronar.
  res.status(200).json(await alCrm(ruta));
}
