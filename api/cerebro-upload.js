// Procesa imágenes y screenshots con Claude Vision
// Extrae el contenido relevante y lo devuelve como texto para guardar en conocimiento

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido.' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({ error: '⚠️ Falta ANTHROPIC_API_KEY en Vercel.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { modulo, base64, mediaType = 'image/jpeg', nota = '' } = body;

    if (!base64) {
      res.status(200).json({ error: 'No se recibió imagen.' });
      return;
    }

    const moduloCtx = {
      sinergia: 'networking, alianzas estratégicas, relaciones de negocios, preguntas de impacto',
      conexion: 'relaciones personales, inteligencia emocional, pareja, familia, crianza',
      servir: 'fe, liderazgo pastoral, enseñanzas bíblicas, servicio, ética',
      mindset: 'mentalidad empresarial, estrategia, consejos de mentores, negocios'
    };

    const contextoMod = moduloCtx[modulo] || 'conocimiento personal y profesional';

    const prompt = nota
      ? `Esta imagen forma parte del módulo de ${contextoMod}. El usuario añadió esta nota: "${nota}". Extrae y sintetiza el contenido relevante de la imagen en texto claro y estructurado. Si hay texto visible (subrayados, notas, slides, capturas), transcríbelo fielmente. Incluye la nota del usuario como contexto. Responde solo con el contenido extraído, sin introducción.`
      : `Esta imagen forma parte del módulo de ${contextoMod}. Extrae y sintetiza todo el contenido relevante en texto claro. Si hay texto visible (libro, notas, slide, captura de pantalla), transcríbelo fielmente. Si es una foto conceptual, describe el aprendizaje clave. Responde solo con el contenido extraído, sin introducción.`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await resp.json();
    if (data.error) {
      res.status(200).json({ error: 'Error de Claude: ' + (data.error.message || 'desconocido') });
      return;
    }

    const text = (data.content || []).map(c => c.text || '').join('').trim();
    res.status(200).json({ contenido: text });

  } catch (e) {
    res.status(200).json({ error: 'Error: ' + e.message });
  }
}
