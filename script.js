// ── Firebase ─────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAtYkE1IKJA2JLsMtVcGDYo7sfprLn5cTA",
  authDomain: "tendedero-cach.firebaseapp.com",
  projectId: "tendedero-cach",
  storageBucket: "tendedero-cach.firebasestorage.app",
  messagingSenderId: "742829676026",
  appId: "1:742829676026:web:44c28254c34412a33d8043"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Generar HTML de una tarjeta ───────────────────────────────
function crearCardHTML(d, index, total) {
  const foto = d.fotoURL
    ? `<img src="${d.fotoURL}" alt="Foto de ${d.nombre}" />`
    : `<div class="card-photo-placeholder">👤</div>`;

  const carpeta = d.carpeta
    ? `<p class="card-carpeta">Carpeta de investigación: <span>${d.carpeta}</span></p>`
    : '';

  return `
    <div class="card" role="group" aria-label="Persona ${index + 1} de ${total}">
      <div class="card-inner">
        <div class="card-photo-wrap">${foto}</div>
        <p class="card-name">${d.nombre}</p>
        ${carpeta}
        <span class="card-tipo">${d.tipo}</span>
        <p class="card-description">${d.desc}</p>
        <div class="card-btn-agresor">⚠ Identificado como agresor</div>
        <button class="btn-victima" onclick="incrementarVictima(this)">También soy su víctima</button>
        <div class="victima-contador">0 han dicho esto</div>
      </div>
    </div>`;
}

// ── Inicializar carrusel ──────────────────────────────────────
function iniciarCarrusel() {
  const track   = document.getElementById('carouselTrack');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const counter = document.getElementById('carouselCounter');
  const dotsEl  = document.getElementById('carouselDots');

  dotsEl.innerHTML = '';
  const cards = Array.from(track.querySelectorAll('.card'));
  const total = cards.length;
  let current = 0;

  if (total === 0) {
    counter.textContent = '';
    return;
  }

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

  goTo(0);

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
}

// ── Cargar tarjetas desde Firestore ──────────────────────────
async function cargarTarjetas() {
  const track = document.getElementById('carouselTrack');
  const counter = document.getElementById('carouselCounter');

  try {
    const snap = await db.collection('denuncias').orderBy('fecha', 'desc').get();

    if (snap.empty) {
      track.innerHTML = `
        <div class="card" role="group">
          <div class="card-inner">
            <div class="card-photo-wrap"><div class="card-photo-placeholder">👤</div></div>
            <p class="card-name">Próximamente</p>
            <span class="card-tipo">El tendedero se está construyendo</span>
            <p class="card-description">Las tarjetas aparecerán aquí cuando el colectivo las publique.</p>
          </div>
        </div>`;
      counter.textContent = '';
    } else {
      const docs = snap.docs;
      track.innerHTML = docs.map((doc, i) => crearCardHTML(doc.data(), i, docs.length)).join('');
    }
  } catch (err) {
    console.error("Error cargando tarjetas:", err);
  }

  iniciarCarrusel();
}

cargarTarjetas();


// ── Contador de "También soy su víctima" ─────────────────────
window.incrementarVictima = function(btn) {
  if (btn.disabled) return;
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.style.cursor = 'default';

  const contadorDiv = btn.nextElementSibling;
  let count = parseInt(contadorDiv.textContent) || 0;
  count++;
  contadorDiv.textContent = count + (count === 1 ? ' ha dicho esto' : ' han dicho esto');
};
