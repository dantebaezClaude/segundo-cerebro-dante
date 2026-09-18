const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM = 'Eres el asistente personal de Dante Baez, CEO y lider. Genera mensajes WhatsApp autenticos y personalizados. SE ESPECIFICO con detalles del contexto. Haz follow-up de metas y proyectos. Tono: natural, calido, como un amigo de verdad. FORMATO: Solo el mensaje WA, sin explicaciones. Max 4-5 lineas.';

// ── Puerta: solo con sesión del Segundo Cerebro ──────────────────────────────
// Sin esto, cualquiera con la URL podía gastar la llave de Anthropic de Dante.
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

module.exports = async (req, res) => {
  if (!(await conSesion(req))) { res.status(401).json({ error: 'Entra al Segundo Cerebro para usar esto.' }); return; }
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  if(req.method!=='POST') return res.status(405).end();
  const { contacto, motivo, contexto } = req.body||{};
  if(!contacto) return res.status(400).json({error:'Falta contacto'});
  const msg = 'Genera un WhatsApp para '+contacto+' por: '+(motivo||'saludo')+'\n\nContexto:\n'+(contexto||'Sin contexto.')+'\n\nGenera el mensaje:';
  try {
    const r = await client.messages.create({model:'claude-sonnet-4-6',max_tokens:400,system:SYSTEM,messages:[{role:'user',content:msg}]});
    res.json({text:r.content[0].text});
  } catch(e){ res.status(500).json({error:e.message}); }
};
