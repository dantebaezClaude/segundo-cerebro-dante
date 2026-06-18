// Edge Middleware: el subdominio ceo.dantebaez.com sirve el v3.html
// (corre ANTES de servir archivos estáticos, por eso sí gana sobre index.html)
export const config = { matcher: '/' };

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  if (host === 'ceo.dantebaez.com') {
    const url = new URL(request.url);
    url.pathname = '/v3.html';
    // rewrite interno: la URL sigue siendo ceo.dantebaez.com pero el contenido es v3.html
    return new Response(null, { headers: { 'x-middleware-rewrite': url.toString() } });
  }
  // cualquier otro host (app real) continúa normal
}
