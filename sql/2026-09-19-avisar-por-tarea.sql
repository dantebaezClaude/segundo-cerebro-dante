-- OPCIONAL (19-sep-2026): recordar por tarea si te avisa o no.
--
-- Sin esto todo funciona: el interruptor 🔕 le quita los avisos al evento de
-- Google, que es de donde salen los WhatsApp. Lo único que falta sin la
-- columna es que la app pinte el 🔕 al recargar (se entera preguntándole a
-- Google, no a su propia tabla).
--
-- Cómo correrlo: Supabase → proyecto del Cerebro → SQL Editor → pegar → Run.
-- La app lo detecta sola en la siguiente carga; no hay que tocar código.

alter table cerebro_tareas
  add column if not exists avisar boolean not null default true;

comment on column cerebro_tareas.avisar is
  'false = esta tarea ya no te manda WhatsApp (sigue en tu día, solo no suena)';
