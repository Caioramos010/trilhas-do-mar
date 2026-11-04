/* ══════════════════════════════════════════════════════════════════════════
   TRILHAS DO MAR · comportamento da página
   Sem dependências externas. Tudo degrada: se o JS falhar, a página continua
   legível e os links de WhatsApp continuam funcionando.
   Para editar textos, preços e links, use assets/js/config.js.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CFG = window.TDM || {};
  var T = function (k, v) { return window.TDM_LANG ? window.TDM_LANG.t(k, v) : ""; };
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var apontador = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ════════ 1. CONFIGURAÇÃO APLICADA NA PÁGINA ════════ */

  function linkWhats(passeio) {
    var w = CFG.whatsapp || {};
    var num = String(w.numero || "").replace(/\D/g, "");
    // a mensagem sai no idioma que o visitante está lendo
    var txt = passeio ? T("wa.msg", { passeio: passeio }) : T("wa.geral");
    if (!num) return "#";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(txt);
  }

  function aplicarConfig() {
    // links de WhatsApp
    $$("[data-wa]").forEach(function (el) {
      el.href = linkWhats(el.getAttribute("data-tour-name"));
      el.target = "_blank";
      el.rel = "noopener";
    });
    var disp = $("[data-wa-display]");
    if (disp && CFG.whatsapp && CFG.whatsapp.exibicao) disp.textContent = CFG.whatsapp.exibicao;

    // redes sociais
    $$("[data-social]").forEach(function (el) {
      var url = (CFG.redes || {})[el.getAttribute("data-social")];
      if (url) el.href = url;
    });

    // preços: a Lagoinha tem dois valores (trajeto avulso e ida e volta)
    $$("[data-price]").forEach(function (caixa) {
      var pr = (CFG.precos || {})[caixa.getAttribute("data-price")];
      if (!pr || (!pr.idaEVolta && !pr.trajeto)) {
        caixa.classList.add("is-open");
        caixa.innerHTML = "<b>" + T("preco.consulte") + "</b><small>" + T("preco.consulte.sub") + "</small>";
        return;
      }
      var reais = function (v) { return "R$ " + String(v).replace(".", ","); };
      var html = "";
      if (pr.trajeto) {
        html += '<span class="p-main"><b>' + reais(pr.trajeto) + "</b><small>" + T("preco.trajeto") + "</small></span>";
        if (pr.idaEVolta) html += '<span class="p-alt">' + T("preco.idavolta") + " <b>" + reais(pr.idaEVolta) + "</b></span>";
      } else {
        html += '<span class="p-main"><b>' + reais(pr.idaEVolta) + "</b><small>" + T("preco.porpessoa") + "</small></span>";
      }
      caixa.innerHTML = html;
    });

    // nota e frase de avaliações. O marcador fica no próprio <small>, que não é
    // substituído: assim a troca de idioma continua encontrando o elemento.
    var av = CFG.avaliacoes || {};
    var n = $("[data-rating]");
    if (n && av.nota) n.textContent = av.nota;
    var frase = $("[data-rev-frase]");
    if (frase) {
      var qtd = String(av.quantidade || "").replace(/\D/g, "");
      frase.innerHTML = qtd ? T("rev.media2", { n: av.quantidade }) : T("rev.media");
    }

    // fotos
    Object.keys(CFG.fotos || {}).forEach(function (chave) {
      var caminho = CFG.fotos[chave];
      $$('[data-photo="' + chave + '"]').forEach(function (el) {
        if (caminho) {
          el.style.backgroundImage = 'url("' + caminho + '")';
          el.classList.add("has-photo");
        } else if (el.closest(".tour, .coop-media")) {
          var tag = document.createElement("span");
          tag.className = "ph-tag";
          tag.textContent = "foto: " + chave;
          el.appendChild(tag);
        }
      });
    });

    var ano = $("[data-year]");
    if (ano) ano.textContent = new Date().getFullYear();
  }

  /* ════════ 2. HEADER, PROGRESSO E BOTÃO FLUTUANTE ════════ */

  function scrollUI() {
    var header = $("[data-header]");
    var barra  = $("[data-progress]");
    var flut   = $(".wa-float");
    var ultimo = 0, travado = false;

    function passo() {
      var y = window.scrollY;
      var alturaUtil = document.documentElement.scrollHeight - window.innerHeight;

      if (header) {
        header.classList.toggle("stuck", y > 40);
        // esconde ao descer, revela ao subir, nunca sobre o topo da página
        header.classList.toggle("hide", y > 520 && y > ultimo && !$(".menu-mobile:not([hidden])"));
      }
      if (barra) barra.style.width = (alturaUtil > 0 ? (y / alturaUtil) * 100 : 0) + "%";
      if (flut) flut.classList.toggle("show", y > window.innerHeight * 0.7 && !flut.dataset.oculto);

      ultimo = y; travado = false;
    }

    window.addEventListener("scroll", function () {
      if (!travado) { travado = true; window.requestAnimationFrame(passo); }
    }, { passive: true });

    // no CTA final e no rodapé o botão flutuante sai de cena:
    // já existe um botão grande ali e ele cobria o texto do rodapé
    if (flut && "IntersectionObserver" in window) {
      var fim = [$("#agendar"), $(".site-footer")].filter(Boolean);
      var vistos = 0;
      var obs = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vistos += e.isIntersecting ? 1 : -1; });
        vistos = Math.max(0, vistos);
        if (vistos > 0) { flut.dataset.oculto = "1"; flut.classList.remove("show"); }
        else { delete flut.dataset.oculto; }
        passo();
      }, { threshold: 0.05 });
      fim.forEach(function (el) { obs.observe(el); });
    }

    passo();
  }

  /* ════════ 3. MENU MOBILE ════════ */

  function menuMobile() {
    var botao = $("[data-nav-toggle]"), menu = $("[data-menu]");
    if (!botao || !menu) return;

    var header = $("[data-header]");
    function fechar() {
      menu.hidden = true;
      botao.setAttribute("aria-expanded", "false"); botao.setAttribute("aria-label", "Abrir menu");
      document.body.style.overflow = "";          // devolve a rolagem da página
      if (header) header.classList.remove("menu-aberto");
    }
    function abrir() {
      menu.hidden = false;
      botao.setAttribute("aria-expanded", "true"); botao.setAttribute("aria-label", "Fechar menu");
      document.body.style.overflow = "hidden";    // o fundo não rola atrás do menu
      if (header) header.classList.add("menu-aberto");
    }

    botao.addEventListener("click", function () {
      menu.hidden ? abrir() : fechar();
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", fechar); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });
  }

  /* ════════ 4. ENTRADA DOS ELEMENTOS (reveal em cascata) ════════ */

  function revelar() {
    var alvos = $$(".reveal");
    if (reduzido || !("IntersectionObserver" in window)) {
      alvos.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var irmaos = $$(".reveal", e.target.parentElement);
        var i = Math.max(0, irmaos.indexOf(e.target));
        if (!e.target.style.getPropertyValue("--d")) {
          e.target.style.setProperty("--d", Math.min(i * 90, 450) + "ms");
        }
        e.target.classList.add("in");
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    alvos.forEach(function (el) { obs.observe(el); });
  }

  /* ════════ 5. CONTADORES ════════ */

  function contadores() {
    var alvos = $$("[data-count]");
    if (!alvos.length) return;
    if (reduzido || !("IntersectionObserver" in window)) {
      alvos.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, fim = parseInt(el.getAttribute("data-count"), 10) || 0;
        var t0 = null, dur = 1250;
        function anima(t) {
          if (t0 === null) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(fim * eased);
          if (p < 1) requestAnimationFrame(anima);
        }
        requestAnimationFrame(anima);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    alvos.forEach(function (el) { obs.observe(el); });
  }

  /* ════════ 7. MAPA INTERATIVO ════════ */

  var TITULOS = {
    "lagoinha-pantano": "Pântano do Sul → Lagoinha do Leste",
    "tres-irmas":       "Pântano do Sul → Ilha das Três Irmãs",
    "moleques":         "Pântano do Sul → Ilhas Moleques do Sul"
  };
  var PINOS = {
    "lagoinha-pantano": ["pantano", "lagoinha"],
    "tres-irmas":       ["pantano", "tres-irmas"],
    "moleques":         ["pantano", "moleques"]
  };
  // distância medida sobre a rota real do mapa
  var DISTANCIAS = { "lagoinha-pantano": "6,4 km", "tres-irmas": "5,7 km", "moleques": "10,8 km" };
  var CHAVE_CFG  = { "lagoinha-pantano": "lagoinhaPantano", "tres-irmas": "tresIrmas", "moleques": "moleques" };
  var NUM_DUR    = { "lagoinha-pantano": 1, "tres-irmas": 2, "moleques": 3 };

  function detalhes(chave) {
    var pr = (CFG.precos || {})[CHAVE_CFG[chave]] || {};
    var n  = NUM_DUR[chave];
    var itens = [];
    if (n) itens.push([T("map.d" + n), T("map.n" + n)]);
    if (DISTANCIAS[chave]) itens.push([DISTANCIAS[chave], T("map.rota")]);
    if (pr.trajeto)        itens.push(["R$ " + pr.trajeto, T("map.trajeto")]);
    else if (pr.idaEVolta) itens.push(["R$ " + pr.idaEVolta, T("map.idavolta")]);
    return itens;
  }

  // em tela estreita o enquadramento do computador deixa muito mar sobrando:
  // o mapa é recortado para o que realmente importa
  function enquadraMapa() {
    var svg = $(".map");
    if (!svg) return;
    var estreito = window.innerWidth < 1100;
    svg.setAttribute("viewBox", estreito ? "88 54 568 538" : "0 0 680 614");
  }

  function mapa() {
    var cartoes = $$("[data-tour]");
    var rotas   = $$(".route");
    var pinos   = $$(".pin");
    var barco   = $("[data-boat]");
    var titulo  = $("[data-map-title]");
    var facts   = $("[data-map-facts]");
    var secao   = $("#passeios");
    var lista   = $("[data-tours]");
    if (!cartoes.length || !rotas.length) return;

    var atual = null, animBarco = null;

    function navegar(rota) {
      if (animBarco) cancelAnimationFrame(animBarco);
      if (!barco || reduzido) return;
      var total = rota.getTotalLength(), t0 = null, dur = 2800;
      function passo(t) {
        if (t0 === null) t0 = t;
        var p = ((t - t0) % dur) / dur;
        var d = total * p;
        var a = rota.getPointAtLength(d);
        // o barco não gira: fica sempre de pé e só percorre o caminho
        barco.setAttribute("transform", "translate(" + a.x + "," + a.y + ")");
        animBarco = requestAnimationFrame(passo);
      }
      animBarco = requestAnimationFrame(passo);
    }

    function ativar(chave) {
      if (!chave || chave === atual) return;      // não reinicia a animação à toa
      atual = chave;

      cartoes.forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-tour") === chave); });

      var ativa = null;
      rotas.forEach(function (r) {
        var on = r.getAttribute("data-route") === chave;
        r.classList.toggle("on", on);
        r.classList.remove("draw");
        if (on) {
          ativa = r;
          if (!reduzido) {
            r.style.setProperty("--len", r.getTotalLength());
            void r.getBoundingClientRect();
            r.classList.add("draw");
          }
        }
      });

      var acesos = PINOS[chave] || [];
      pinos.forEach(function (p) { p.classList.toggle("on", acesos.indexOf(p.getAttribute("data-pin")) > -1); });

      if (titulo && TITULOS[chave]) {
        titulo.classList.add("swap");
        setTimeout(function () { titulo.textContent = TITULOS[chave]; titulo.classList.remove("swap"); }, 170);
      }
      if (facts) {
        facts.classList.add("swap");
        setTimeout(function () {
          facts.innerHTML = detalhes(chave).map(function (d) {
            return "<li><b>" + d[0] + "</b><span>" + d[1] + "</span></li>";
          }).join("");
          facts.classList.remove("swap");
        }, 170);
      }

      if (barco) barco.classList.toggle("on", !!ativa && !reduzido);
      if (ativa) navegar(ativa);
    }

    // ── o passeio em foco é o que o scroll traz para a linha de leitura ──
    function peloScroll() {
      var linha = window.innerHeight * 0.42;
      var alvo = null, melhor = Infinity;
      cartoes.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var d = Math.abs(r.top + r.height / 2 - linha);
        if (d < melhor) { melhor = d; alvo = c; }
      });
      if (alvo) ativar(alvo.getAttribute("data-tour"));
    }

    var travado = false;
    window.addEventListener("scroll", function () {
      if (travado) return;
      travado = true;
      requestAnimationFrame(function () { peloScroll(); travado = false; });
    }, { passive: true });
    window.addEventListener("resize", function () { enquadraMapa(); peloScroll(); });

    // mouse e teclado dão resposta imediata; ao sair, o scroll retoma o comando
    cartoes.forEach(function (c) {
      var chave = c.getAttribute("data-tour");
      if (apontador) c.addEventListener("mouseenter", function () { ativar(chave); });
      c.addEventListener("focusin", function () { ativar(chave); });
      c.addEventListener("click", function (e) { if (!e.target.closest("a")) ativar(chave); });
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ativar(chave); }
      });
    });
    if (lista && apontador) lista.addEventListener("mouseleave", peloScroll);

    // estado inicial: sempre há um passeio em foco, mesmo antes de rolar
    enquadraMapa();
    ativar("lagoinha-pantano");
    if (secao) peloScroll();
  }

  /* ════════ 8. DEPOIMENTOS ════════ */

  function estrelas(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return s;
  }

  function depoimentos() {
    var trilho = $("[data-reviews]");
    var rail   = $("[data-rail]");
    if (!trilho) return;

    var lista = CFG.depoimentos || [];

    // Sem avaliação REAL cadastrada, a seção inteira some: nunca publicar
    // prova social inventada (propaganda enganosa). Basta preencher
    // CFG.depoimentos com as avaliações reais do Airbnb/GetYourGuide para
    // a seção voltar sozinha.
    var sec = document.getElementById("depoimentos");
    if (!lista.length) { if (sec) sec.hidden = true; return; }
    if (sec) sec.hidden = false;
    trilho.innerHTML = lista.map(function (d) {
      var texto = d.chave ? T(d.chave) : (d.texto || "");
      var foto = d.foto
        ? '<span class="review-av" style="background-image:url(\'' + d.foto + '\')" aria-hidden="true"></span>'
        : "";
      return (
        '<figure class="review">' +
          '<svg class="quote" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6C6.5 7.6 5 10 5 13v5h6v-6H8.2c.2-1.8 1.1-3.1 2.8-4L9.5 6Zm9 0C15.5 7.6 14 10 14 13v5h6v-6h-2.8c.2-1.8 1.1-3.1 2.8-4L18.5 6Z"/></svg>' +
          '<p class="r-stars" aria-label="' + (d.nota || 5) + '/5">' + estrelas(d.nota || 5) + "</p>" +
          "<blockquote><p>" + texto + "</p></blockquote>" +
          '<figcaption class="review-foot">' + foto +
            '<span class="review-who"><b>' + d.nome + "</b><span>" + (d.passeio || "") + "</span></span>" +
          "</figcaption>" +
        "</figure>"
      );
    }).join("");

    if (!rail) return;
    var ant = $("[data-rail-prev]"), prox = $("[data-rail-next]");

    function passo() {
      var card = $(".review", trilho);
      if (!card) return rail.clientWidth * 0.8;
      return card.getBoundingClientRect().width + 20;
    }
    function estado() {
      var fim = rail.scrollWidth - rail.clientWidth - 4;
      if (ant)  ant.disabled  = rail.scrollLeft <= 2;
      if (prox) prox.disabled = rail.scrollLeft >= fim;
    }
    if (ant)  ant.addEventListener("click",  function () { rail.scrollBy({ left: -passo(), behavior: reduzido ? "auto" : "smooth" }); });
    if (prox) prox.addEventListener("click", function () { rail.scrollBy({ left:  passo(), behavior: reduzido ? "auto" : "smooth" }); });
    rail.addEventListener("scroll", estado, { passive: true });
    window.addEventListener("resize", estado);
    estado();
  }

  /* ════════ 9. FAQ · um aberto por vez ════════ */

  function faq() {
    var itens = $$("[data-faq] details");
    itens.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        itens.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  /* ════════ 10. PARALLAX DO HERO ════════ */

  function parallax() {
    var foto = $(".hero-photo");
    if (!foto || reduzido) return;
    var travado = false;
    window.addEventListener("scroll", function () {
      if (travado) return;
      travado = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) foto.style.transform = "translate3d(0," + (y * 0.18) + "px,0) scale(1.04)";
        travado = false;
      });
    }, { passive: true });
  }

  /* ════════ 11. INCLINAÇÃO SUTIL NOS CARDS (só mouse fino) ════════ */

  function inclinar() {
    if (!apontador || reduzido) return;
    $$(".tour").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var mx = (e.clientX - r.left) / r.width - 0.5;
        var my = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-4px) perspective(900px) rotateX(" + (-my * 2.2) + "deg) rotateY(" + (mx * 2.6) + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ════════ 12. VÍDEO DA TRAVESSIA ════════
     O arquivo só é buscado quando a seção se aproxima da tela. Se o navegador
     recusar a reprodução automática, aparece o botão de play.              */

  function filme() {
    var v = $("[data-video]");
    if (!v) return;

    function carregar() {
      if (v.dataset.src && !v.src) { v.src = v.dataset.src; v.load(); }
      if (reduzido) { return; }   // menos movimento: fica no poster, sem player
      var p = v.play();
      if (p && p.catch) p.catch(function () {});  // navegador barrou: fica no poster, nunca mostra player
    }

    if (!("IntersectionObserver" in window)) { carregar(); return; }

    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { carregar(); } });
    }, { rootMargin: "320px 0px" }).observe(v);

    // fora da tela o vídeo pausa: não gasta bateria à toa
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!v.src || reduzido) return;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.15 }).observe(v);
  }

  /* ════════ INICIALIZAÇÃO ════════ */

  function reaplicar() {
    aplicarConfig();          // preços, links de WhatsApp e nota média
    depoimentos();            // tarja de exemplo e rótulos
    var ativo = $(".tour.is-active");
    var facts = $("[data-map-facts]");
    if (ativo && facts) {     // painel do mapa no idioma novo
      facts.innerHTML = detalhes(ativo.getAttribute("data-tour")).map(function (d) {
        return "<li><b>" + d[0] + "</b><span>" + d[1] + "</span></li>";
      }).join("");
    }
  }

  function iniciar() {
    aplicarConfig();
    scrollUI();
    menuMobile();
    revelar();
    contadores();
    mapa();
    depoimentos();
    faq();
    parallax();
    inclinar();
    filme();
    document.addEventListener("tdm:idioma", reaplicar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
