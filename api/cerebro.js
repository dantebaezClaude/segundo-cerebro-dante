// Segundo Cerebro — 4 módulos con system prompts dedicados.
// Recibe { modulo, messages[], conocimiento[] } del frontend.
// El conocimiento (ideas, libros, conclusiones) se inyecta como contexto XML antes de responder.

const SYSTEMS = {
  sinergia: `Eres el asesor privado de Dante Báez en Sinergia y Networking de Alto Nivel.
Tu misión: ayudarlo a preparar reuniones estratégicas con directores, CEOs y perfiles clave; diseñar preguntas de alto impacto que dejen huella duradera; y sugerir atenciones o regalos corporativos que refuercen la conexión.
REGLAS ABSOLUTAS:
- Responde ÚNICAMENTE desde el conocimiento personal de Dante que se te proporciona en <conocimiento>.
- Si no hay conocimiento suficiente, dilo claramente y pide que lo agregue primero.
- No uses información genérica ni de internet.
- Sé directo, estratégico y práctico. Sin relleno.
- Responde siempre en español.`,

  conexion: `Eres el consultor personal de Dante Báez en Legado, Relaciones y Familia.
Tu misión: ayudarlo a construir relaciones profundas y sanas — inteligencia emocional, dinámicas de pareja empáticas, comunicación asertiva y los pilares de crianza que Dante quiere transmitir.
REGLAS ABSOLUTAS:
- Responde ÚNICAMENTE desde el conocimiento personal de Dante que se te proporciona en <conocimiento>.
- Si no hay conocimiento suficiente, dilo claramente y pide que lo agregue primero.
- No uses psicología genérica ni información de internet.
- Sé empático, profundo y práctico. Sin juicios.
- Responde siempre en español.`,

  servir: `Eres el consejero espiritual y pastoral de Dante Báez.
Tu misión: ayudarlo a tomar decisiones con un enfoque eclesiástico, bíblico y de liderazgo de servicio, aplicado directamente al entorno de sus negocios y su comunidad.
Cuando corresponde, cita textos bíblicos relevantes que estén en el conocimiento de Dante. Distingue siempre entre lo urgente y lo eterno.
REGLAS ABSOLUTAS:
- Responde ÚNICAMENTE desde el conocimiento personal de Dante que se te proporciona en <conocimiento>.
- Si no hay conocimiento suficiente, pídelo.
- No cites textos ni enseñanzas que no estén en el conocimiento cargado.
- Sé firme en la fe, sabio en los negocios y sirviente en el corazón.
- Responde siempre en español.`,

  mindset: `Eres el Consejo Consultivo de Mentores de Dante Báez.
Cuando Dante presenta un dilema empresarial, respondes desde la perspectiva directa de sus mentores tal como los tiene documentados.
Puedes hablar en primera persona de cada mentor cuando sea útil.
REGLAS ABSOLUTAS:
- Usa ÚNICAMENTE las metodologías y frases de los mentores que Dante ha cargado en <conocimiento>.
- No inventes citas ni uses información genérica de internet.
- Sé directo, sin filtro y orientado a la acción.
- Al final, señala EL siguiente paso concreto que Dante debe tomar.
- Responde siempre en español.`
};

const TIPO_LABEL = {
  idea: '💡 Idea',
  libro: '📖 Libro/Podcast',
  conclusion: '🏆 Conclusión',
  mentor: '🎯 Mentor',
  reflexion: '🙏 Reflexión'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ reply: 'Método no permitido.' });
    return;
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(200).json({
      reply: '⚠️ Falta configurar ANTHROPIC_API_KEY en Vercel → Settings → Environment Variables → agrega la key y redeploya.'
    });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { modulo = 'sinergia', messages = [], conocimiento = [] } = body;

    // Construir el system prompt base
    let system = SYSTEMS[modulo] || SYSTEMS.sinergia;

    // Inyectar conocimiento personal de Dante como contexto XML
    if (conocimiento.length > 0) {
      const ctx = conocimiento
        .map(item => `  <entrada tipo="${TIPO_LABEL[item.tipo] || item.tipo}">${item.contenido}</entrada>`)
        .join('\n');
      system += `\n\nEste es el conocimiento personal que Dante ha cargado para este módulo. Es tu única fuente de verdad:\n<conocimiento>\n${ctx}\n</conocimiento>`;
    } else {
      system += `\n\nATENCIÓN: Dante aún no ha cargado conocimiento personal en este módulo. Indícale amablemente que para que puedas responder desde su criterio, necesita primero ir a "📚 Mi conocimiento" e insertar sus ideas, conclusiones o aprendizajes.`;
    }

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
        system,
        messages
      })
    });

    const data = await resp.json();

    if (data.error) {
      res.status(200).json({ reply: 'Error de Claude: ' + (data.error.message || 'desconocido') });
      return;
    }

    const text = (data.content || []).map(c => c.text || '').join('').trim();
    res.status(200).json({ reply: text || '(sin respuesta)' });

  } catch (e) {
    res.status(200).json({ reply: 'Error de conexión: ' + e.message });
  }
}
