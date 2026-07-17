# 🧠 Segundo Cerebro CEO — Dante Báez

App personal de organización del CEO (tareas, bloques del día, foco, conocimiento, frases,
sinergia, networking) + el **Kit Vozz** de notas de voz. HTML single-file, sin build.

**Este repo es la fuente de verdad.** Lo que está en `main` es lo que sirve producción.

---

## Identidad

| Cosa | Valor |
|---|---|
| Producción | https://ceo.dantebaez.com → sirve **`v3.html`** |
| URL legado (congelada, no tocar) | https://segundo-cerebro-dante.vercel.app → sirve `index.html` (versión vieja) |
| Kit Vozz | https://ceo.dantebaez.com/vozz.js · páginas `/vozz` y `/vozz-demo` |
| Repo | `dantebaezClaude/segundo-cerebro-dante` · rama `main` · **público** |
| Vercel | proyecto `segundo-cerebro-dante` · id `prj_00a7AcwjFrLrh2DNzsLSZSPRTGpX` · team `dante-developer` |

## Mapa de archivos

```
v3.html           ← LA APP. Único archivo que se edita para cambiar el cerebro.
index.html        ← versión vieja congelada (solo la sirve la URL legado). NO editar.
middleware.js     ← rewrite host ceo.dantebaez.com → /v3.html (refuerzo del de vercel.json)
vercel.json       ← rewrites: / → v3.html (por host) · /vozz → Vozz.html · /vozz-demo
vozz.js           ← Kit Vozz: micrófono embebible en cualquier app (2 líneas de HTML)
Vozz.html         ← página standalone del micrófono (bóveda ceo-sinergia)
vozz-demo.html    ← demo del kit
api/cerebro.js        ← tubería Claude: chat con contexto del cerebro
api/cerebro-upload.js ← tubería Claude: archivos/visión
api/chat.js           ← tubería Claude: chat genérico
api/networking-msg.js ← tubería Claude: redactor de mensajes de networking
```

## Conexiones (quién habla con quién)

| Módulo | Backend | Detalle |
|---|---|---|
| Cerebro (tareas, bloques, notas, conocimiento, frases, contactos…) | Supabase **viasana-cfo** (`qetocoxizvumespgocij`), tablas `cerebro_*` | Base COMPARTIDA con Vía Sana. Llave pública embebida en `v3.html` (así se diseñó). ⚠️ Deuda conocida: políticas anon abiertas — el plan largo es mudar `cerebro_*` a un proyecto propio del CEO. |
| Kit Vozz (notas de voz) | Supabase **mkt-hq-dante** (`lwoeqegztghkexumhige`), tabla `vozz_notas` + bucket `vozz-audios` | Mudado el 17-jul-2026 (antes vivía en la base del dinero de Vía Sana). Permisos mínimos: anon solo lee e inserta; nadie lista ni borra. |
| Tuberías `api/*` | Claude API (modelo `claude-sonnet-4-6`) | La llave vive SOLO en Vercel → Settings → Environment Variables → `ANTHROPIC_API_KEY`. Jamás en código. |

## Protocolo de deploy

1. Edita `v3.html` (o el archivo que toque) en `main`.
2. Commit con autor `dantebaez05@gmail.com` (Vercel **bloquea** deploys de otros autores) y push.
3. Vercel deploya solo (~1 min). Verifica READY y abre ceo.dantebaez.com.
4. Rollback: `git revert <hash>` + push. Nunca force-push.

**⛔ NUNCA deployar con `vercel deploy` (CLI) directo desde una carpeta local.**
El 13-jul-2026 se hizo así desde `Desktop/NUEVAS APSS/NOTA DE VOZ/produccion-vozz/` y
producción quedó ADELANTE del repo durante 4 días sin que git lo supiera (reconciliado el
17-jul, commit `f9c39eb`). Si el repo y prod divergen, todo lo demás miente.

## Copias locales (informativas, NO fuentes de verdad)

- `Desktop/AGENDA CEO/NEWjunio26/SEGUNDO-CEREBRO-CEO-VERSION-OFICIAL.html` — copia de
  trabajo histórica de Dante; sincronizada con el `v3.html` real el 17-jul-2026.
- `Desktop/NUEVAS APSS/NOTA DE VOZ/produccion-vozz/` — cuna del Kit Vozz; igual al repo
  desde el 17-jul-2026.

## Seguridad

- Repo público: auditado el 17-jul-2026 — **0 secretos** en código e historial reciente; solo
  llaves públicas de Supabase (anon/publishable, públicas por diseño).
- ⚠️ **Riesgo conocido**: las rutas `/api/*` no piden autenticación — cualquiera que descubra
  la URL puede gastar créditos de Claude. Pendiente decidir el candado (la app no tiene login).
- Vozz retirado de la base de Vía Sana el 17-jul-2026 (tabla borrada allá; respaldo en
  `Desktop/VIA SANA APP/_ARCHIVO/vozz-respaldo-2026-07-17/`).
