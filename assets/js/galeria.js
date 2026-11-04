/* ══════════════════════════════════════════════════════════════════════════
   GALERIA · grade de fotos e vídeos, filtro por passeio e visor em tela cheia.
   O conteúdo vem de assets/js/config.js → galeria.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CFG = window.TDM || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = function (k, v) { return window.TDM_LANG ? window.TDM_LANG.t(k, v) : ""; };

  var PASSEIOS = ["todos", "lagoinha", "irmas", "moleques", "bordo"];

  var itens = (CFG.galeria || []).slice();
  var visiveis = itens.slice();
  var filtro = "todos";

  /* ─── config comum (WhatsApp, redes, ano) ─────────────────────────────── */
  function comuns() {
    var w = CFG.whatsapp || {};
    var num = String(w.numero || "").replace(/\D/g, "");
    $$("[data-wa]").forEach(function (el) {
      if (num) { el.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(T("wa.geral")); el.target = "_blank"; el.rel = "noopener"; }
    });
    var disp = $("[data-wa-display]");
    if (disp && w.exibicao) disp.textContent = w.exibicao;
    $$("[data-social]").forEach(function (el) {
      var url = (CFG.redes || {})[el.getAttribute("data-social")];
      if (url) el.href = url;
    });
    var ano = $("[data-year]");
    if (ano) ano.textContent = new Date().getFullYear();
  }

  /* ─── grade ───────────────────────────────────────────────────────────── */
  function desenhaFiltros() {
    var caixa = $("[data-filtros]");
    if (!caixa || !itens.length) return;
    var usados = PASSEIOS.filter(function (id) {
      return id === "todos" || itens.some(function (i) { return i.passeio === id; });
    });
    if (usados.length < 3) { caixa.innerHTML = ""; return; }   // filtro só faz sentido com variedade
    caixa.innerHTML = usados.map(function (id) {
      return '<button type="button" class="gal-filtro' + (id === filtro ? " on" : "") +
             '" data-filtro="' + id + '" aria-pressed="' + (id === filtro) + '">' + T("gal." + id) + "</button>";
    }).join("");
    $$("[data-filtro]", caixa).forEach(function (b) {
      b.addEventListener("click", function () {
        filtro = b.getAttribute("data-filtro");
        $$("[data-filtro]", caixa).forEach(function (o) {
          var on = o === b;
          o.classList.toggle("on", on); o.setAttribute("aria-pressed", on);
        });
        desenhaGrade();
      });
    });
  }

  function desenhaGrade() {
    var grade = $("[data-galeria]");
    var vazio = $("[data-gal-vazio]");
    if (!grade) return;

    visiveis = filtro === "todos" ? itens.slice() : itens.filter(function (i) { return i.passeio === filtro; });

    if (!itens.length) { grade.innerHTML = ""; if (vazio) vazio.hidden = false; return; }
    if (vazio) vazio.hidden = true;

    grade.innerHTML = visiveis.map(function (it, i) {
      var alto = it.formato === "alto" ? " alto" : (it.formato === "largo" ? " largo" : "");
      var midia = it.tipo === "video"
        ? '<video src="' + it.src + '"' + (it.poster ? ' poster="' + it.poster + '"' : "") +
          ' muted loop playsinline preload="metadata"></video><span class="gal-play" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>'
        : '<img src="' + it.src + '" alt="' + (it.alt || it.legenda || "Foto do passeio") + '" loading="lazy" decoding="async">';
      return '<button type="button" class="gal-item' + alto + '" data-i="' + i + '" aria-label="Abrir: ' +
             (it.legenda || it.alt || "mídia") + '">' + midia +
             (it.legenda ? '<span class="gal-legenda">' + it.legenda + "</span>" : "") + "</button>";
    }).join("");

    $$(".gal-item", grade).forEach(function (b, i) {
      b.addEventListener("click", function () { abre(i); });
      var v = $("video", b);
      if (v && !reduzido) {
        b.addEventListener("mouseenter", function () { v.play().catch(function () {}); });
        b.addEventListener("mouseleave", function () { v.pause(); v.currentTime = 0; });
      }
    });

    if (!reduzido && "IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.style.setProperty("--d", Math.min($$(".gal-item", grade).indexOf(e.target) * 55, 380) + "ms");
          e.target.classList.add("in");
          obs.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      $$(".gal-item", grade).forEach(function (el) { obs.observe(el); });
    } else {
      $$(".gal-item", grade).forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* ─── visor em tela cheia ─────────────────────────────────────────────── */
  var visor = $("[data-visor]"), palco = $("[data-visor-midia]"), legenda = $("[data-visor-legenda]");
  var atual = 0, voltarPara = null;

  function pinta() {
    var it = visiveis[atual];
    if (!it || !palco) return;
    palco.innerHTML = it.tipo === "video"
      ? '<video src="' + it.src + '" controls autoplay loop playsinline' + (it.poster ? ' poster="' + it.poster + '"' : "") + "></video>"
      : '<img src="' + it.src + '" alt="' + (it.alt || it.legenda || "Foto do passeio") + '">';
    if (legenda) legenda.textContent = it.legenda || "";
  }

  function abre(i) {
    if (!visor) return;
    atual = i; voltarPara = document.activeElement;
    visor.hidden = false;
    document.body.style.overflow = "hidden";
    pinta();
    var fechar = $("[data-visor-fechar]");
    if (fechar) fechar.focus();
  }
  function fecha() {
    if (!visor) return;
    visor.hidden = true;
    document.body.style.overflow = "";
    if (palco) palco.innerHTML = "";
    if (voltarPara && voltarPara.focus) voltarPara.focus();
  }
  function anda(d) {
    if (!visiveis.length) return;
    atual = (atual + d + visiveis.length) % visiveis.length;
    pinta();
  }

  function ligaVisor() {
    if (!visor) return;
    var f = $("[data-visor-fechar]"), a = $("[data-visor-ant]"), p = $("[data-visor-prox]");
    if (f) f.addEventListener("click", fecha);
    if (a) a.addEventListener("click", function () { anda(-1); });
    if (p) p.addEventListener("click", function () { anda(1); });
    visor.addEventListener("click", function (e) { if (e.target === visor) fecha(); });
    document.addEventListener("keydown", function (e) {
      if (visor.hidden) return;
      if (e.key === "Escape") fecha();
      if (e.key === "ArrowLeft") anda(-1);
      if (e.key === "ArrowRight") anda(1);
    });
    // arrastar no celular
    var x0 = null;
    visor.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    visor.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 55) anda(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  /* ─── cabeçalho e menu (mesmo comportamento da home) ──────────────────── */
  function shell() {
    var header = $("[data-header]"), barra = $("[data-progress]"), flut = $(".wa-float");
    var ultimo = 0, travado = false;
    function passo() {
      var y = window.scrollY;
      var util = document.documentElement.scrollHeight - window.innerHeight;
      if (header) {
        header.classList.toggle("stuck", y > 40);
        header.classList.toggle("hide", y > 520 && y > ultimo);
      }
      if (barra) barra.style.width = (util > 0 ? (y / util) * 100 : 0) + "%";
      if (flut) flut.classList.toggle("show", y > 260);
      ultimo = y; travado = false;
    }
    window.addEventListener("scroll", function () {
      if (!travado) { travado = true; requestAnimationFrame(passo); }
    }, { passive: true });
    passo();

    var botao = $("[data-nav-toggle]"), menu = $("[data-menu]");
    if (botao && menu) {
      var header = $("[data-header]");
      function alterna(abrir) {
        menu.hidden = !abrir;
        botao.setAttribute("aria-expanded", abrir);
        botao.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
        document.body.style.overflow = abrir ? "hidden" : "";
        if (header) header.classList.toggle("menu-aberto", abrir);
      }
      botao.addEventListener("click", function () { alterna(menu.hidden); });
      $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { alterna(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") alterna(false); });
    }

    var alvos = $$(".reveal");
    if (reduzido || !("IntersectionObserver" in window)) { alvos.forEach(function (e) { e.classList.add("in"); }); }
    else {
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
      }, { threshold: .1 });
      alvos.forEach(function (e) { obs.observe(e); });
    }
  }

  function iniciar() {
    comuns(); shell(); desenhaFiltros(); desenhaGrade(); ligaVisor();
    document.addEventListener("tdm:idioma", function () { comuns(); desenhaFiltros(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
