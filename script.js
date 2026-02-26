// ── Carrusel ────────────────────────────────────────────────
(function () {
  const track   = document.getElementById('carouselTrack');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const counter = document.getElementById('carouselCounter');
  const dotsEl  = document.getElementById('carouselDots');

  const cards   = Array.from(track.querySelectorAll('.card'));
  const total   = cards.length;
  let current   = 0;

  // Crear dots
  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Ir a tarjeta ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    counter.textContent = `${current + 1} / ${total}`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Swipe táctil
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
  });

  // Teclado
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
})();

// ── Formulario anónimo ───────────────────────────────────────
// OMITIDO EN SCRIPT EXTERNO: El formulario ahora usa una acción directa POST en su atributo action a FormSubmit en HTML.
// Ya no usamos JS para interceptarlo si queremos un flujo simple que vaya directo a cachcolectivo@gmail.com


// ── Contador de "También soy su víctima" ────────────────────
window.incrementarVictima = function(btn) {
  if (btn.disabled) return;
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.style.cursor = 'default';
  
  const contadorDiv = btn.nextElementSibling;
  let count = parseInt(contadorDiv.textContent) || 0;
  count++;
  contadorDiv.textContent = count + (count === 1 ? ' ha dicho esto' : ' han dicho esto');
  
  // Aquí se podría hacer un fetch a un backend para guardar el contador de forma permanente si se desea.
}
