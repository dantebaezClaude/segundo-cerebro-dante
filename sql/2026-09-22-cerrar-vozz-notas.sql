-- 🔴 URGENTE (22-sep-2026): tus notas de voz están abiertas al público.
--
-- Qué encontré, probado contra producción con la llave que está a la vista en
-- el código de ceo.dantebaez.com (cualquiera la puede leer):
--   LECTURA   permitida — devuelve las notas con su texto transcrito
--   ESCRITURA permitida — RLS no la frena
--   BORRADO   permitido — un DELETE respondió 204
-- O sea: cualquiera que abra el código fuente de tu app puede leer, escribir
-- y BORRAR tus notas de voz.
--
-- Las 20 tablas cerebro_* están bien: con esa misma llave devuelven 0 filas.
-- vozz_notas es la única que se quedó afuera.
--
-- Esto NO rompe nada: todas las llamadas de la app a vozz_notas ya viajan con
-- tu sesión (SBH la lleva desde el login), y la subida del audio también, a
-- partir del commit de hoy.
--
-- Cómo correrlo: Supabase → proyecto del Cerebro → SQL Editor → pegar → Run.

alter table vozz_notas enable row level security;

drop policy if exists vozz_notas_solo_con_sesion on vozz_notas;

create policy vozz_notas_solo_con_sesion on vozz_notas
  for all
  to authenticated
  using (true)
  with check (true);

-- Comprobación: después de correrlo, esto debe devolver CERO filas
-- (es la llave pública, sin sesión):
--   curl -s "https://qetocoxizvumespgocij.supabase.co/rest/v1/vozz_notas?select=id" \
--     -H "apikey: <la SB_KEY del HTML>" -H "Authorization: Bearer <la misma>"
