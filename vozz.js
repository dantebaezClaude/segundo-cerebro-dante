/* ============================================================
   VOZZ KIT — El micrófono público de Dante Báez (copiar y pegar)
   ------------------------------------------------------------
   CÓMO USARLO (2 líneas en cualquier página o app):

     <script src="https://ceo.dantebaez.com/vozz.js" defer></script>
     <div data-vozz="nombre-del-area"></div>

   Cada nombre distinto = bóveda independiente (sus notas no se
   mezclan). Opciones extra en el div:
     data-titulo="Notas de cocina"   → título de la tarjeta
     data-color="#43B584"            → color del botón y acentos
     data-tema="claro"               → para apps de fondo claro

   Todo se guarda en la nube (tabla vozz_notas + bucket vozz-audios
   del proyecto Supabase del ecosistema). Para apuntar a otra base:
     <script>window.VOZZ_CONFIG={url:'https://TU.supabase.co',key:'TU_LLAVE'}</script>
   antes de incluir vozz.js.
   ============================================================ */
(function () {
  'use strict';
  if (window.__VOZZ_KIT__) return; // no cargar dos veces
  window.__VOZZ_KIT__ = true;

  /* ---------- Configuración ---------- */
  var CFG = Object.assign({
    url: 'https://lwoeqegztghkexumhige.supabase.co',
    key: 'sb_publishable_EAvbpsNabCKYEPhUan_aQQ_GX3hAaPG',
    tabla: 'vozz_notas',
    bucket: 'vozz-audios'
  }, window.VOZZ_CONFIG || {});
  var H = { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json' };
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ---------- Estilos (se inyectan solos) ---------- */
  var CSS = [
    '.vzk,#vzkOv{--vzk-bg:#171923;--vzk-bg2:#1F2230;--vzk-borde:#2A2E40;--vzk-texto:#F2F3F7;--vzk-suave:#9AA0B4;--vzk-acento:#7C5CFF;--vzk-rojo:#FF4D5E;--vzk-ambar:#FFC93C;--vzk-verde:#34D399}',
    '.vzk[data-tema=claro],#vzkOv[data-tema=claro]{--vzk-bg:#FFFFFF;--vzk-bg2:#F3F4F8;--vzk-borde:#DDE0EA;--vzk-texto:#1A1C26;--vzk-suave:#6A7086}',
    '.vzk{background:var(--vzk-bg);border:1px solid var(--vzk-borde);border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '.vzk-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;gap:10px}',
    '.vzk-l{font-weight:700;font-size:14px;color:var(--vzk-texto);display:flex;align-items:center;gap:8px}',
    '.vzk-n{font-size:11.5px;font-weight:700;color:var(--vzk-acento);border:1px solid var(--vzk-acento);opacity:.9;border-radius:20px;padding:1px 9px}',
    '.vzk-r{display:flex;align-items:center;gap:10px}',
    '.vzk-dictar{border:none;border-radius:10px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer;background:var(--vzk-acento);color:#fff}',
    '.vzk-arrow{color:var(--vzk-suave);transition:transform .25s;display:inline-block}',
    '.vzk.open .vzk-arrow{transform:rotate(180deg)}',
    '.vzk-body{display:none;border-top:1px solid var(--vzk-borde);padding:12px 14px}',
    '.vzk.open .vzk-body{display:block}',
    '.vzk-vacio{color:var(--vzk-suave);font-size:13px;text-align:center;padding:8px 0}',
    '.vzk-item{background:var(--vzk-bg2);border:1px solid var(--vzk-borde);border-radius:12px;padding:10px 12px;margin-bottom:8px}',
    '.vzk-top2{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;align-items:center}',
    '.vzk-fecha{font-size:11px;color:var(--vzk-suave)}',
    '.vzk-chip{font-size:10.5px;font-weight:700;color:var(--vzk-verde);border:1px solid var(--vzk-verde);border-radius:20px;padding:0 8px}',
    '.vzk-texto{font-size:13.5px;line-height:1.5;color:var(--vzk-texto);white-space:pre-wrap;word-break:break-word}',
    '.vzk-texto.vacia{color:var(--vzk-suave);font-style:italic}',
    '.vzk-item audio{width:100%;height:32px;margin-top:8px}',
    '.vzk-acts{display:flex;gap:14px;margin-top:8px;flex-wrap:wrap}',
    '.vzk-acts button{background:none;border:none;padding:0;font-size:12px;font-weight:700;cursor:pointer;color:var(--vzk-acento)}',
    '.vzk-acts .del{color:var(--vzk-rojo)}',
    '#vzkOv{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(3px);z-index:99000;display:none;align-items:flex-end;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#vzkOv.on{display:flex}',
    '.vzk-sheet{background:var(--vzk-bg);border:1px solid var(--vzk-borde);border-radius:22px 22px 0 0;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding:18px 18px 26px;box-shadow:0 8px 28px rgba(0,0,0,.42)}',
    '@media(min-width:700px){#vzkOv{align-items:center}.vzk-sheet{border-radius:22px}}',
    '.vzk-top{display:flex;justify-content:space-between;align-items:center}',
    '.vzk-tit{font-weight:800;font-size:16px;color:var(--vzk-texto)}',
    '.vzk-x{background:var(--vzk-bg2);border:1px solid var(--vzk-borde);color:var(--vzk-suave);border-radius:10px;width:34px;height:34px;font-size:15px;cursor:pointer}',
    '.vzk-est{text-align:center;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--vzk-suave);margin-top:8px}',
    '.vzk-est.rec{color:var(--vzk-rojo)}.vzk-est.pau{color:var(--vzk-ambar)}',
    '.vzk-crono{text-align:center;font-size:14px;color:var(--vzk-suave);font-variant-numeric:tabular-nums;height:18px;margin-top:2px}',
    '.vzk-ctr{height:118px;display:flex;align-items:center;justify-content:center}',
    '.vzk-mic{width:86px;height:86px;border-radius:50%;border:none;cursor:pointer;background:var(--vzk-acento);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
    '.vzk-mic svg{width:36px;height:36px;fill:#fff}',
    '.vzk-c{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer}',
    '.vzk-c .cir{width:62px;height:62px;border-radius:50%;border:1.5px solid var(--vzk-borde);background:var(--vzk-bg2);display:flex;align-items:center;justify-content:center}',
    '.vzk-c svg{width:22px;height:22px;fill:var(--vzk-texto)}',
    '.vzk-c span{font-size:12px;font-weight:700;color:var(--vzk-suave)}',
    '.vzk-c.stop .cir{border-color:var(--vzk-rojo);background:rgba(255,77,94,.14)}',
    '.vzk-c.stop svg{fill:var(--vzk-rojo)}.vzk-c.stop span{color:var(--vzk-rojo)}',
    '.vzk-c.rea .cir{border-color:var(--vzk-ambar);background:rgba(255,201,60,.12)}',
    '.vzk-c.rea svg{fill:var(--vzk-ambar)}.vzk-c.rea span{color:var(--vzk-ambar)}',
    '.vzk-lbl{font-size:11.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--vzk-suave);margin:4px 2px 6px}',
    '.vzk-txt{background:var(--vzk-bg2);border:1px solid var(--vzk-borde);border-radius:14px;min-height:110px;max-height:220px;overflow-y:auto;padding:12px 14px;font-size:16px;line-height:1.6;color:var(--vzk-texto);text-align:left}',
    '.vzk-txt.rec{border-color:var(--vzk-rojo)}',
    '.vzk-txt .ph{color:var(--vzk-suave);font-size:13.5px}',
    '.vzk-txt .int{color:var(--vzk-suave);font-style:italic}',
    '.vzk-audio{display:none;margin-top:10px;background:var(--vzk-bg2);border:1px solid var(--vzk-borde);border-radius:14px;padding:10px 12px}',
    '.vzk-audio.on{display:block}',
    '.vzk-audio audio{width:100%;height:36px}',
    '.vzk-btns{display:none;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.vzk-btns.on{display:flex}',
    '.vzk-btns button{flex:1;min-width:130px;padding:12px 8px;border-radius:12px;border:1px solid var(--vzk-borde);background:var(--vzk-bg2);color:var(--vzk-texto);font-size:13px;font-weight:700;cursor:pointer}',
    '.vzk-btns .g1{background:var(--vzk-acento);border-color:var(--vzk-acento);color:#fff}',
    '.vzk-btns .g2{background:rgba(52,211,153,.16);border-color:var(--vzk-verde);color:var(--vzk-verde)}',
    '#vzkToast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(90px);background:#1F2230;border:1px solid #2A2E40;color:#F2F3F7;padding:12px 22px;border-radius:30px;font-size:14px;font-weight:600;transition:transform .3s ease;z-index:99500;box-shadow:0 8px 24px rgba(0,0,0,.4);white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#vzkToast.on{transform:translateX(-50%) translateY(0)}'
  ].join('\n');

  var MIC_SVG = '<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>';
  var ICO_PAUSA = '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>';
  var ICO_PLAY = '<path d="M8 5.5v13a.7.7 0 0 0 1.07.6l10.2-6.5a.7.7 0 0 0 0-1.2L9.07 4.9A.7.7 0 0 0 8 5.5z"/>';

  /* ---------- Estado ---------- */
  var zonas = {};        // nombre → {el, titulo, color, tema}
  var cache = {};        // nombre → notas
  var actual = null;     // zona abierta en la hoja
  var estado = 'inactivo', texto = '', recon = null, motorOn = false;
  var grab = null, stream = null, chunks = [], audio = null;
  var ms = 0, ini = null, timer = null, tToast = null;

  /* ---------- Utilerías ---------- */
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function punt(t) {
    return t.replace(/\s*punto y aparte\s*/gi, '.\n').replace(/\s*punto y coma\s*/gi, '; ')
      .replace(/\s*signo de interrogación\s*/gi, '? ').replace(/\s*signo de exclamación\s*/gi, '! ')
      .replace(/\s*dos puntos\s*/gi, ': ').replace(/\s*nueva línea\s*/gi, '\n')
      .replace(/\s*punto\s*/gi, '. ').replace(/\s*coma\s*/gi, ', ');
  }
  function fmtSeg(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
  function fmtFecha(iso) {
    var f = new Date(iso);
    return f.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' · ' +
      f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
  function toast(m) {
    var el = document.getElementById('vzkToast');
    el.textContent = m; el.classList.add('on');
    clearTimeout(tToast); tToast = setTimeout(function () { el.classList.remove('on'); }, 2400);
  }
  function $(id) { return document.getElementById(id); }

  /* ---------- Motor de dictado ---------- */
  function arrancarMotor() {
    if (!Rec) return false;
    recon = new Rec();
    recon.lang = 'es-MX'; recon.continuous = true; recon.interimResults = true;
    recon.onresult = function (ev) {
      var inter = '';
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        if (r.isFinal) texto += punt(r[0].transcript); else inter += r[0].transcript;
      }
      pintarTxt(inter);
    };
    recon.onend = function () { if (motorOn) { try { recon.start(); } catch (e) {} } };
    recon.onerror = function (e) {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        pararTodo(); toast('🎤 Permite el acceso al micrófono');
      }
    };
    try { recon.start(); } catch (e) { return false; }
    motorOn = true; return true;
  }
  function apagarMotor() { motorOn = false; if (recon) { try { recon.stop(); } catch (e) {} recon = null; } }

  /* ---------- Grabadora del audio original ---------- */
  function arrancarGrab() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
      stream = s;
      var mimes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      var mime = '';
      for (var i = 0; i < mimes.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(mimes[i])) { mime = mimes[i]; break; }
      grab = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      chunks = [];
      grab.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
      grab.start(1000);
    }).catch(function () { grab = null; stream = null; });
  }
  function detenerGrab(seg) {
    return new Promise(function (res) {
      if (!grab) { res(null); return; }
      var g = grab; grab = null;
      g.onstop = function () {
        var mime = (g.mimeType || 'audio/webm').split(';')[0];
        var blob = new Blob(chunks, { type: mime });
        if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
        res(blob.size > 0 ? { blob: blob, mime: mime, seg: seg } : null);
      };
      try { g.stop(); } catch (e) { res(null); }
    });
  }
  function descartarAudio() { if (audio && audio.url) URL.revokeObjectURL(audio.url); audio = null; $('vzkPlayer').removeAttribute('src'); }

  /* ---------- Hoja de dictado ---------- */
  function pintarTxt(inter) {
    var el = $('vzkTxt');
    if (!texto && !inter) { el.innerHTML = '<span class="ph">Habla y aquí aparece tu dictado… di "punto", "coma" o "punto y aparte" para puntuar.</span>'; return; }
    el.innerHTML = esc(texto).replace(/\n/g, '<br>') + (inter ? '<span class="int"> ' + esc(inter) + '</span>' : '');
    el.scrollTop = el.scrollHeight;
  }
  function msTot() { return ms + (ini ? Date.now() - ini : 0); }
  function pintarCrono() { $('vzkCrono').textContent = fmtSeg(Math.floor(msTot() / 1000)); }
  function pintarEstado() {
    var est = $('vzkEst'), hayTexto = texto.trim().length > 0, inactivo = estado === 'inactivo';
    $('vzkMicBtn').style.display = inactivo ? 'flex' : 'none';
    $('vzkCtr2').style.display = inactivo ? 'none' : 'flex';
    $('vzkAudioCard').classList.toggle('on', inactivo && !!audio);
    $('vzkBtns').classList.toggle('on', inactivo && (hayTexto || !!audio));
    $('vzkBtnAudio').style.display = audio ? 'block' : 'none';
    $('vzkTxt').classList.toggle('rec', estado === 'grabando');
    est.classList.remove('rec', 'pau');
    if (estado === 'grabando') {
      est.classList.add('rec'); est.textContent = '● Grabando…';
      $('vzkPausaTxt').textContent = 'Pausa'; $('vzkPausaIco').innerHTML = ICO_PAUSA; $('vzkPausaC').classList.remove('rea');
    } else if (estado === 'pausado') {
      est.classList.add('pau'); est.textContent = '⏸ En pausa';
      $('vzkPausaTxt').textContent = 'Reanudar'; $('vzkPausaIco').innerHTML = ICO_PLAY; $('vzkPausaC').classList.add('rea');
    } else est.textContent = hayTexto ? 'Dictado listo · guárdalo en tu bóveda' : 'Listo para escuchar';
  }

  function abrir(nombre) {
    if (!Rec) { toast('⚠️ Dictado no disponible · usa Chrome o Safari'); return; }
    var z = zonas[nombre]; if (!z) return;
    actual = nombre;
    var ov = $('vzkOv');
    ov.style.setProperty('--vzk-acento', z.color);
    if (z.tema === 'claro') ov.setAttribute('data-tema', 'claro'); else ov.removeAttribute('data-tema');
    $('vzkTit').textContent = '🎙️ Vozz · ' + z.titulo;
    texto = ''; descartarAudio(); ms = 0; ini = null;
    $('vzkCrono').textContent = '00:00';
    ov.classList.add('on');
    pintarTxt(''); pintarEstado();
    empezar();
  }
  function cerrar() { return pararTodo().then(function () { $('vzkOv').classList.remove('on'); }); }

  function empezar() {
    if (estado !== 'inactivo') return;
    descartarAudio();
    if (!arrancarMotor()) return;
    arrancarGrab();
    estado = 'grabando'; ms = 0; ini = Date.now();
    timer = setInterval(pintarCrono, 500); pintarCrono(); pintarEstado();
  }
  function pausaClick() {
    if (estado === 'grabando') {
      apagarMotor(); try { if (grab && grab.state === 'recording') grab.pause(); } catch (e) {}
      ms += Date.now() - ini; ini = null; clearInterval(timer);
      estado = 'pausado'; pintarTxt(''); pintarEstado();
    } else if (estado === 'pausado') {
      if (!arrancarMotor()) return;
      try { if (grab && grab.state === 'paused') grab.resume(); } catch (e) {}
      estado = 'grabando'; ini = Date.now(); timer = setInterval(pintarCrono, 500); pintarEstado();
    }
  }
  function detener() {
    if (estado === 'inactivo') return;
    apagarMotor();
    if (ini) { ms += Date.now() - ini; ini = null; }
    clearInterval(timer);
    var seg = Math.max(1, Math.round(ms / 1000));
    detenerGrab(seg).then(function (a) {
      if (a) { a.url = URL.createObjectURL(a.blob); audio = a; $('vzkPlayer').src = a.url; }
      estado = 'inactivo'; pintarTxt(''); pintarEstado();
    });
  }
  function pararTodo() {
    apagarMotor();
    return detenerGrab(0).then(function () {
      if (ini) { ms += Date.now() - ini; ini = null; }
      clearInterval(timer); estado = 'inactivo';
    });
  }
  function descartar() { texto = ''; descartarAudio(); ms = 0; $('vzkCrono').textContent = '00:00'; pintarTxt(''); pintarEstado(); }

  /* ---------- Guardar en la nube ---------- */
  function guardar(conAudio) {
    var t = texto.trim();
    if (!t && !(conAudio && audio)) { toast('Dicta algo primero 🎤'); return; }
    var nombre = actual, z = zonas[nombre];
    var paso = Promise.resolve({ url: null, seg: null });
    if (conAudio && audio) {
      var ext = audio.mime.indexOf('mp4') >= 0 ? 'm4a' : 'webm';
      var archivo = 'vozz-' + nombre + '-' + Date.now() + '.' + ext;
      paso = fetch(CFG.url + '/storage/v1/object/' + CFG.bucket + '/' + archivo, {
        method: 'POST', headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': audio.mime }, body: audio.blob
      }).then(function (r) {
        if (!r.ok) throw new Error('storage');
        return { url: CFG.url + '/storage/v1/object/public/' + CFG.bucket + '/' + archivo, seg: audio.seg };
      });
    }
    paso.then(function (a) {
      return fetch(CFG.url + '/rest/v1/' + CFG.tabla, {
        method: 'POST', headers: Object.assign({}, H, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ texto: t, audio_url: a.url, duracion_seg: a.seg, palabras: t ? t.split(/\s+/).length : null, origen: nombre })
      });
    }).then(function (r) {
      if (!r.ok) throw new Error('rest');
      return cerrar();
    }).then(function () {
      toast('💾 Guardado en la bóveda de ' + z.titulo);
      cargar(nombre);
      z.el.querySelector('.vzk').classList.add('open');
    }).catch(function () { toast('⚠️ No se pudo guardar · revisa tu internet'); });
  }

  /* ---------- Bóveda ---------- */
  function cargar(nombre) {
    var lista = $('vzk-list-' + nombre);
    fetch(CFG.url + '/rest/v1/' + CFG.tabla + '?origen=eq.' + encodeURIComponent(nombre) + '&order=creado_en.desc&limit=50', { headers: H })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (notas) {
        cache[nombre] = notas;
        $('vzk-n-' + nombre).textContent = notas.length;
        if (!notas.length) { lista.innerHTML = '<div class="vzk-vacio">Tu bóveda está vacía — toca 🎙️ Dictar para guardar tu primera nota.</div>'; return; }
        lista.innerHTML = notas.map(function (n) {
          return '<div class="vzk-item">'
            + '<div class="vzk-top2"><span class="vzk-fecha">🕐 ' + fmtFecha(n.creado_en) + (n.duracion_seg ? ' · ' + fmtSeg(n.duracion_seg) : '') + '</span>'
            + (n.audio_url ? '<span class="vzk-chip">🎙️ con audio</span>' : '') + '</div>'
            + '<div class="vzk-texto' + (n.texto ? '' : ' vacia') + '">' + (n.texto ? esc(n.texto) : 'Nota de voz sin transcripción') + '</div>'
            + (n.audio_url ? '<audio controls preload="none" src="' + n.audio_url + '"></audio>' : '')
            + '<div class="vzk-acts">'
            + (n.texto ? '<button data-vzk-act="copiar" data-z="' + nombre + '" data-id="' + n.id + '">📋 Copiar</button>' : '')
            + (n.audio_url ? '<button data-vzk-act="descargar" data-z="' + nombre + '" data-id="' + n.id + '">⬇️ Descargar</button>' : '')
            + '<button class="del" data-vzk-act="borrar" data-z="' + nombre + '" data-id="' + n.id + '">Borrar</button>'
            + '</div></div>';
        }).join('');
      })
      .catch(function () { lista.innerHTML = '<div class="vzk-vacio">⚠️ No se pudo cargar la bóveda.</div>'; });
  }
  function buscarNota(nombre, id) {
    return (cache[nombre] || []).filter(function (x) { return x.id === id; })[0];
  }
  function copiar(nombre, id) {
    var n = buscarNota(nombre, id); if (!n) return;
    navigator.clipboard.writeText(n.texto).then(function () { toast('✅ Copiado'); }, function () { toast('No se pudo copiar'); });
  }
  function descargar(nombre, id) {
    var n = buscarNota(nombre, id); if (!n || !n.audio_url) return;
    var f = new Date(n.creado_en), p = function (x) { return String(x).padStart(2, '0'); };
    var ext = n.audio_url.split('.').pop();
    var archivo = 'nota-voz-' + nombre + '-' + f.getFullYear() + p(f.getMonth() + 1) + p(f.getDate()) + '-' + p(f.getHours()) + p(f.getMinutes()) + '.' + ext;
    var a = document.createElement('a');
    a.href = n.audio_url + '?download=' + encodeURIComponent(archivo);
    a.download = archivo; document.body.appendChild(a); a.click(); a.remove();
    toast('⬇️ Descargando nota de voz…');
  }
  function borrar(nombre, id) {
    var n = buscarNota(nombre, id); if (!n) return;
    fetch(CFG.url + '/rest/v1/' + CFG.tabla + '?id=eq.' + id, { method: 'DELETE', headers: H })
      .then(function (r) {
        if (!r.ok) throw new Error();
        if (n.audio_url) {
          var nom = n.audio_url.split('/' + CFG.bucket + '/')[1];
          if (nom) fetch(CFG.url + '/storage/v1/object/' + CFG.bucket + '/' + nom, { method: 'DELETE', headers: H });
        }
        toast('🗑️ Nota borrada'); cargar(nombre);
      }).catch(function () { toast('No se pudo borrar'); });
  }

  /* ---------- Montaje ---------- */
  function montar(el) {
    var nombre = (el.getAttribute('data-vozz') || '').trim();
    if (!nombre || zonas[nombre]) return; // requiere nombre único
    var titulo = el.getAttribute('data-titulo') || 'Bóveda de voz';
    var color = el.getAttribute('data-color') || '#7C5CFF';
    var tema = el.getAttribute('data-tema') || '';
    zonas[nombre] = { el: el, titulo: titulo, color: color, tema: tema };
    var caja = document.createElement('div');
    caja.className = 'vzk';
    if (tema === 'claro') caja.setAttribute('data-tema', 'claro');
    caja.style.setProperty('--vzk-acento', color);
    caja.innerHTML = '<div class="vzk-head" data-vzk-act="toggle" data-z="' + nombre + '">'
      + '<div class="vzk-l">🎙️ ' + esc(titulo) + ' <span class="vzk-n" id="vzk-n-' + nombre + '">0</span></div>'
      + '<div class="vzk-r"><button class="vzk-dictar" data-vzk-act="abrir" data-z="' + nombre + '">🎙️ Dictar</button>'
      + '<span class="vzk-arrow">▾</span></div></div>'
      + '<div class="vzk-body"><div class="vzk-list" id="vzk-list-' + nombre + '"></div></div>';
    el.innerHTML = ''; el.appendChild(caja);
    // contador inicial
    fetch(CFG.url + '/rest/v1/' + CFG.tabla + '?select=id&origen=eq.' + encodeURIComponent(nombre), { headers: H })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (filas) { var e2 = $('vzk-n-' + nombre); if (e2) e2.textContent = filas.length; })
      .catch(function () {});
  }

  function inyectar() {
    if ($('vzkEstilos')) return;
    var st = document.createElement('style'); st.id = 'vzkEstilos'; st.textContent = CSS;
    document.head.appendChild(st);
    var ov = document.createElement('div'); ov.id = 'vzkOv';
    ov.innerHTML = '<div class="vzk-sheet">'
      + '<div class="vzk-top"><div class="vzk-tit" id="vzkTit">🎙️ Vozz</div><button class="vzk-x" data-vzk-act="cerrar">✕</button></div>'
      + '<div class="vzk-est" id="vzkEst">Listo para escuchar</div>'
      + '<div class="vzk-crono" id="vzkCrono">00:00</div>'
      + '<div class="vzk-ctr">'
      + '<button class="vzk-mic" id="vzkMicBtn" data-vzk-act="empezar">' + MIC_SVG + '</button>'
      + '<div id="vzkCtr2" style="display:none;gap:30px;align-items:center">'
      + '<button class="vzk-c" id="vzkPausaC" data-vzk-act="pausa"><div class="cir"><svg viewBox="0 0 24 24" id="vzkPausaIco">' + ICO_PAUSA + '</svg></div><span id="vzkPausaTxt">Pausa</span></button>'
      + '<button class="vzk-c stop" data-vzk-act="stop"><div class="cir"><svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg></div><span>Stop</span></button>'
      + '</div></div>'
      + '<div class="vzk-lbl">📝 Tu dictado</div><div class="vzk-txt" id="vzkTxt"></div>'
      + '<div class="vzk-audio" id="vzkAudioCard"><audio id="vzkPlayer" controls preload="metadata"></audio></div>'
      + '<div class="vzk-btns" id="vzkBtns">'
      + '<button class="g1" data-vzk-act="guardar">💾 Guardar en bóveda</button>'
      + '<button class="g2" id="vzkBtnAudio" data-vzk-act="guardarAudio">🎙️ Guardar + audio</button>'
      + '<button data-vzk-act="descartar">🗑️ Descartar</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    var to = document.createElement('div'); to.id = 'vzkToast'; document.body.appendChild(to);
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });
  }

  /* Un solo listener para todos los botones del kit (widgets + hoja) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-vzk-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-vzk-act'), z = b.getAttribute('data-z'), id = parseInt(b.getAttribute('data-id') || '0', 10);
    if (act === 'abrir') { e.stopPropagation(); abrir(z); }
    else if (act === 'toggle') {
      var caja = b.parentNode;
      caja.classList.toggle('open');
      if (caja.classList.contains('open') && !cache[z]) cargar(z);
    }
    else if (act === 'cerrar') cerrar();
    else if (act === 'empezar') empezar();
    else if (act === 'pausa') pausaClick();
    else if (act === 'stop') detener();
    else if (act === 'guardar') guardar(false);
    else if (act === 'guardarAudio') guardar(true);
    else if (act === 'descartar') descartar();
    else if (act === 'copiar') copiar(z, id);
    else if (act === 'descargar') descargar(z, id);
    else if (act === 'borrar') borrar(z, id);
  });

  function arrancar() {
    inyectar();
    document.querySelectorAll('[data-vozz]').forEach(montar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();

  /* API pública por si se quiere controlar desde código */
  window.Vozz = { abrir: abrir, recargar: cargar, montar: montar };
})();
