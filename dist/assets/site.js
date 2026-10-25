(function () {
  'use strict';

  // Карусели: стрелки и счётчик поверх горизонтальной прокрутки со snap.
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel__track');
    var items = Array.prototype.slice.call(track.children);
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var counter = root.querySelector('[data-counter]');
    if (items.length < 2) { var nav = root.querySelector('.carousel__nav'); if (nav) nav.hidden = true; return; }

    // Сколько карточек видно целиком: на телефоне 1, на ПК несколько. Листаем и считаем страницами.
    function perView() {
      var step = items[1].offsetLeft - items[0].offsetLeft;
      var pad = parseFloat(getComputedStyle(track).paddingLeft) + parseFloat(getComputedStyle(track).paddingRight);
      return Math.max(1, Math.floor((track.clientWidth - pad + 12) / step));
    }
    function pages() { return Math.ceil(items.length / perView()); }
    function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; }
    function page() {
      if (atEnd()) return pages() - 1;
      var step = items[1].offsetLeft - items[0].offsetLeft;
      return Math.min(pages() - 1, Math.round(track.scrollLeft / step / perView()));
    }
    function go(p) {
      p = Math.max(0, Math.min(pages() - 1, p));
      var i = Math.min(items.length - 1, p * perView());
      track.scrollTo({left: items[i].offsetLeft - items[0].offsetLeft, behavior: 'smooth'});
    }
    function update() {
      var total = pages(), nav = root.querySelector('.carousel__nav');
      if (nav) nav.hidden = total < 2;
      if (counter) counter.textContent = (page() + 1) + ' / ' + total;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = atEnd();
    }
    prev.addEventListener('click', function () { go(page() - 1); });
    next.addEventListener('click', function () { go(page() + 1); });
    var t;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, {passive: true});
    window.addEventListener('resize', update);
    update();
  });

  // Кнопка звонка внизу: видна, только когда первый экран и контакты вне экрана.
  var fab = document.querySelector('.fab');
  var hero = document.querySelector('.hero');
  var tail = [document.getElementById('contacts'), document.querySelector('.cta'), document.querySelector('.footer')].filter(Boolean);
  if (fab && hero && 'IntersectionObserver' in window) {
    var seen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      fab.classList.toggle('is-visible', seen.size === 0);
    }, {rootMargin: '0px 0px -35% 0px'});
    [hero].concat(tail).forEach(function (el) { io.observe(el); });
  }

  // Полноэкранный просмотр фото: стрелки, свайп, клавиатура.
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-full]'));
  if (!shots.length || typeof HTMLDialogElement !== 'function') return;

  var box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML =
    '<img class="lightbox__img" alt="">' +
    '<button class="lightbox__close" type="button" aria-label="Закрыть">×</button>' +
    '<button class="lightbox__arrow lightbox__arrow--prev" type="button" aria-label="Предыдущее фото">‹</button>' +
    '<button class="lightbox__arrow lightbox__arrow--next" type="button" aria-label="Следующее фото">›</button>' +
    '<div class="lightbox__count"></div>';
  document.body.appendChild(box);
  var img = box.querySelector('.lightbox__img');
  var count = box.querySelector('.lightbox__count');
  var idx = 0;

  function show(i) {
    idx = (i + shots.length) % shots.length;
    img.src = shots[idx].getAttribute('data-full');
    img.alt = shots[idx].querySelector('img').alt;
    count.textContent = (idx + 1) + ' / ' + shots.length;
  }
  shots.forEach(function (el, i) {
    el.addEventListener('click', function () { show(i); box.showModal(); });
  });
  box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
  box.querySelector('.lightbox__arrow--prev').addEventListener('click', function () { show(idx - 1); });
  box.querySelector('.lightbox__arrow--next').addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var x0 = null;
  box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, {passive: true});
  box.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
