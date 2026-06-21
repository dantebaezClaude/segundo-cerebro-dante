const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SYSTEM = 'Eres el asistente personal de Dante Baez, CEO y lider. Genera mensajes WhatsApp autenticos y personalizados. SE ESPECIFICO con detalles del contexto. Haz follow-up de metas y proyectos. Tono: natural, calido, como un amigo de verdad. FORMATO: Solo el mensaje WA, sin explicaciones. Max 4-5 lineas.';
module.exports = async (req, res) => {
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
