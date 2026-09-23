-- NECESARIO (22-sep-2026): dejar entrar el módulo 👑 CEO del Corazón.
--
-- Qué pasa hoy: cerebro_conocimiento y cerebro_frases tienen un CHECK que
-- solo permite los módulos que existían cuando se crearon. Al sembrar la
-- doctrina del CEO del Corazón, Supabase la rechaza con:
--   23514 · violates check constraint "cerebro_conocimiento_modulo_check"
--
-- Se quita el candado de la base porque la validación real ya vive en el
-- código, en un solo lugar y fácil de ver: MODULOS en bot/app_ceo.py y el
-- <select> de cada módulo en v3.html. Tener la lista repetida en tres lados
-- es justo lo que hizo que agregar un módulo se atorara.
--
-- Cómo correrlo: Supabase → proyecto del Cerebro → SQL Editor → pegar → Run.
-- En cuanto corra, el cron del bot siembra la doctrina solo (va por tandas de
-- 14; en tres o cuatro vueltas queda completa). No hay que tocar código.

alter table cerebro_conocimiento
  drop constraint if exists cerebro_conocimiento_modulo_check;

alter table cerebro_frases
  drop constraint if exists cerebro_frases_modulo_check;
