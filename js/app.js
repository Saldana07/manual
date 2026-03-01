/* ═══════════════════════════════════════════
   Manual AliExpress · Lógica de la aplicación
   ─────────────────────────────────────────── */

/* ── CONFIGURACIÓN GENERAL ── */
const TOTAL = 12;
let current   = 0;
let animating = false;

const progressBar = document.getElementById('progressBar');
const navCounter  = document.getElementById('navCounter');
const btnPrev     = document.getElementById('btnPrev');
const btnNext     = document.getElementById('btnNext');
const navSteps    = document.getElementById('navSteps');
const navButtons  = document.querySelector('.nav-buttons');

/* ── NAVEGACIÓN ENTRE SLIDES ── */
function getSlide(i) {
  return document.getElementById(`slide-${i}`);
}

async function goTo(target) {
  if (animating || target === current || target < 0 || target >= TOTAL) return;
  animating = true;

  // Cargar el slide destino si aún no está en el DOM
  await injectSlide(target);

  const currSlide = getSlide(current);
  const nextS     = getSlide(target);

  // Pre-cargar la primera imagen del slide destino antes de la transición
  await preloadFirstImage(nextS);

  currSlide.classList.add('exit');

  setTimeout(() => {
    currSlide.classList.remove('active', 'exit');
    current = target;
    nextS.classList.add('active');
    updateUI();

    // Activar primer item del timeline al entrar al slide
    const items = nextS.querySelectorAll('.timeline-item');
    if (items.length > 0) {
      items.forEach(t => t.classList.remove('active-step'));
      items[0].click();
    }

    animating = false;

    // Pre-cargar slides adyacentes en segundo plano
    preloadAdjacent(current, TOTAL);
  }, 500);
}

function nextSlide() { goTo(current + 1); }
function prevSlide()  { goTo(current - 1); }

/* ── ACTUALIZAR INTERFAZ (CONTADOR, WIZARD, BOTONES) ── */
function updateUI() {
  // Barra de progreso
  progressBar.style.width = ((current / (TOTAL - 1)) * 100) + '%';

  // Contador de paso
  if (current === 0) {
    navCounter.textContent = 'PORTADA';
  } else if (current === 1) {
    navCounter.textContent = 'INTRODUCCIÓN';
  } else if (current === 2) {
    navCounter.textContent = 'CONTENIDO';
  } else if (current === TOTAL - 1) {
    navCounter.textContent = 'GLOSARIO';
  } else {
    navCounter.textContent = `PASO ${current - 2} DE 8`;
  }

  // Ocultar botones Anterior/Siguiente en Portada, Introducción y Contenido
  const hideNav = current <= 2;
  navButtons.style.opacity       = hideNav ? '0' : '1';
  navButtons.style.pointerEvents = hideNav ? 'none' : 'all';

  // Botón anterior
  btnPrev.style.opacity       = current === 0 ? '0.3' : '1';
  btnPrev.style.pointerEvents = current === 0 ? 'none' : 'all';

  // Botón siguiente
  if (current === TOTAL - 1) {
    btnNext.innerHTML = 'Volver al inicio <i class="fa-solid fa-rotate-left"></i>';
    btnNext.onclick = () => goTo(0);
  } else {
    btnNext.innerHTML = 'Siguiente <i class="fa-solid fa-arrow-right"></i>';
    btnNext.onclick = nextSlide;
  }

  // Wizard de navegación
  navSteps.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const label = i === 0 ? 'Portada' : i === 1 ? 'Introducción' : i === 2 ? 'Contenido' : i === TOTAL - 1 ? 'Glosario' : `Paso ${i - 2}`;
    const step  = document.createElement('div');
    step.className = 'wizard-step' + (i === current ? ' active' : i < current ? ' done' : '');
    step.title     = label;
    step.onclick   = () => goTo(i);

    const circle = document.createElement('div');
    circle.className = 'wizard-circle';
    if (i < current) {
      circle.innerHTML = '<i class="fa-solid fa-check" style="font-size:8px"></i>';
    } else if (i === 0) {
      circle.innerHTML = '<i class="fa-solid fa-house" style="font-size:8px"></i>';
    } else if (i === TOTAL - 1) {
      circle.innerHTML = '<i class="fa-solid fa-book" style="font-size:8px"></i>';
    } else if (i === 1) {
      circle.textContent = 'I';
    } else if (i === 2) {
      circle.textContent = 'C';
    } else {
      circle.textContent = String(i - 2);
    }
    step.appendChild(circle);

    if (i < TOTAL - 1) {
      const line = document.createElement('div');
      line.className = 'wizard-line';
      step.appendChild(line);
    }

    navSteps.appendChild(step);
  }
}

/* ── SOPORTE DE TECLADO ── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft')                   { e.preventDefault(); prevSlide(); }
});

/* ═══════════════════════════════════════════
   DATOS DE HOTSPOTS
   ─────────────────────────────────────────
   x e y son porcentajes sobre el phone-frame
   ─────────────────────────────────────────── */
const HOTSPOTS = {

  /* PASO 1 · Instalación */
  'img-2': [
    { dots: [{x:48, y:56}], label: 'Toca el ícono de Play Store en tu pantalla de inicio' },
    { dots: [{x:55, y:88}], label: 'Toca la lupa de búsqueda en la parte superior de Play Store' },
    { dots: [{x:55, y:6}],  label: 'Escribe "AliExpress" en la barra de búsqueda' },
    { dots: [{x:93, y:89}], label: 'Presiona "Buscar" en tu teclado para ver los resultados' },
    { dots: [{x:50, y:42}], label: 'Ubica AliExpress de Alibaba Mobile en los resultados' },
    { dots: [{x:77, y:39}], label: 'Toca la app y presiona el botón "Instalar"' },
    { dots: [{x:88, y:39}], label: 'Cuando termine la instalación, toca "Abrir"' },
  ],

  /* PASO 2 · Registro */
  'img-3': [
    { dots: [{x:50, y:75}], label: 'Toca "Registrarse" para crear tu cuenta' },
    { dots: [{x:50, y:38}], label: 'Ingresa tu correo electronico aqui' },
    { dots: [{x:50, y:42}], label: 'Ingresa el codigo de verificacion recibido' },
    { dots: [{x:50, y:38}], label: 'Completa tu direccion de entrega aqui' },
  ],

  /* PASO 3 · Interfaz principal */
  'img-4': [
    { dots: [{x:50, y:10}], label: 'Esta es la barra de busqueda principal' },
    { dots: [{x:50, y:32}], label: 'Aqui aparecen las ofertas y cupones activos' },
    { dots: [{x:20,y:93},{x:40,y:93},{x:60,y:93},{x:80,y:93}],
      label: 'Menu inferior: Inicio · Categorias · Carrito · Mi cuenta' },
    { dots: [{x:18, y:28}], label: 'Sello Choice: envio gratis y compra protegida' },
  ],

  /* PASO 4 · Búsqueda */
  'img-5': [
    { dots: [{x:50, y:10}], label: 'Toca aqui para comenzar tu busqueda' },
    { dots: [{x:50, y:8}],  label: 'Escribe el nombre del producto y presiona Buscar' },
    { dots: [{x:22, y:18}], label: 'Toca "Choice" para ver solo productos confiables' },
    { dots: [{x:50, y:15}], label: 'Toca "Filtros" para afinar los resultados' },
  ],

  /* PASO 5 · Selección del producto */
  'img-6': [
    { dots: [{x:32, y:22},{x:65, y:22}], label: 'Revisa el precio y el tiempo estimado de envio' },
    { dots: [{x:30, y:58},{x:55, y:58}], label: 'Toca la variante que deseas (color, talla...)' },
    { dots: [{x:50, y:88}], label: 'Toca "Agregar al carrito" o "Comprar ahora"' },
    { dots: [{x:50, y:35}], label: 'Verifica que tu direccion de entrega sea correcta' },
  ],

  /* PASO 6 · Pago */
  'img-7': [
    { dots: [{x:50, y:45}], label: 'Toca aqui para seleccionar el metodo de pago' },
    { dots: [{x:50,y:28},{x:30,y:48},{x:70,y:48}],
      label: 'Ingresa numero de tarjeta, fecha y CVV' },
    { dots: [{x:50, y:62}], label: 'Verifica el total a pagar antes de confirmar' },
    { dots: [{x:50, y:85}], label: 'Toca "Pagar ahora" para confirmar tu compra' },
  ],

  /* PASO 7 · Seguimiento */
  'img-8': [
    { dots: [{x:50, y:35}], label: 'Aqui aparece el estado actual de tu pedido' },
    { dots: [{x:50, y:50}], label: 'Toca "Rastrear" para ver la ruta del paquete' },
    { dots: [{x:85, y:8}],  label: 'Activa las notificaciones para alertas de envio' },
    { dots: [{x:50, y:85}], label: 'Toca aqui para confirmar que recibiste el paquete' },
  ],

  /* PASO 8 · Problemas y soporte */
  'img-9': [
    { dots: [{x:50, y:40}], label: 'Mensaje de pago rechazado por el banco' },
    { dots: [{x:50, y:68}], label: 'Desde aqui puedes abrir una disputa por retraso' },
    { dots: [{x:50, y:88}], label: 'Escribe aqui para chatear con el asistente EVA' },
    { dots: [{x:50, y:75}], label: 'Toca "Abrir disputa" para proteger tu compra' },
  ],
};

/* ── RENDER DE HOTSPOTS ── */
function renderHotspots(frameEl, stepData) {
  frameEl.querySelectorAll('.hotspot').forEach(h => h.remove());

  const label = frameEl.querySelector('.action-label');
  if (label) {
    label.textContent = stepData?.label || '';
    label.classList.toggle('visible', !!stepData?.label);
  }

  if (!stepData?.dots?.length) return;
  stepData.dots.forEach(({ x, y }) => {
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.style.left = x + '%';
    el.style.top  = y + '%';
    el.innerHTML  = '<div class="hotspot-ring"></div><div class="hotspot-dot"></div>';
    frameEl.appendChild(el);
  });
}

/* ── CAMBIO DE IMAGEN + HOTSPOTS EN TIMELINES ── */
function updateModuleSlide(imgSrc, element, containerId) {
  const items = element.parentElement.querySelectorAll('.timeline-item');
  const stepIndex = Array.from(items).indexOf(element);
  items.forEach(item => item.classList.remove('active-step'));
  element.classList.add('active-step');

  const img = document.getElementById(containerId);
  if (!img) return;
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = imgSrc;
    img.style.opacity = 1;
  }, 200);

  const stepData = HOTSPOTS[containerId]?.[stepIndex];
  renderHotspots(img.parentElement, stepData);
}

/* ── TOUR INTRODUCTORIO ── */

// Cambia de slide al instante (sin animación), usado sólo por el tour
function switchSlideInstant(target) {
  if (target === current) return;
  getSlide(current).classList.remove('active', 'exit');
  current = target;
  getSlide(target).classList.add('active');
  updateUI();
  const items = getSlide(target).querySelectorAll('.timeline-item');
  if (items.length && !items[0].classList.contains('active-step')) {
    items[0].click();
  }
}

async function startTour() {
  const originSlide = current;

  // Pre-cargar slide 3 (Instalación) para la demo del teléfono
  await injectSlide(3);

  const tour = introJs();

  tour.onbeforechange(function () {
    const step = this._currentStep;
    // Mostrar botones de nav para los pasos que los referencian
    if (step === 4 || step === 5) {
      navButtons.style.opacity       = '1';
      navButtons.style.pointerEvents = 'all';
    }
    // Navegar al Paso 1 para mostrar el teléfono y la lista
    if (step === 6) switchSlideInstant(3);
  });

  const restoreSlide = () => switchSlideInstant(originSlide);
  tour.oncomplete(restoreSlide);
  tour.onexit(restoreSlide);

  tour.setOptions({
    nextLabel: 'Siguiente →',
    prevLabel: '← Atrás',
    skipLabel: 'Saltar',
    doneLabel: '¡Entendido!',
    showProgress: true,
    showBullets: false,
    exitOnOverlayClick: false,
    scrollToElement: false,
    steps: [
      {
        title: '👋 Bienvenido al Manual',
        intro: 'Este tour rápido te explica cómo navegar por el manual interactivo de AliExpress. Toca <b>Siguiente</b> para comenzar.',
      },
      {
        element: document.querySelector('#navSteps'),
        title: 'Wizard de navegación',
        intro: 'Muestra los <b>12 pasos</b> del manual. Los completados (✓) se resaltan en rojo. Toca cualquier círculo para saltar directamente a esa sección.',
      },
      {
        element: document.querySelector('#navCounter'),
        title: 'Sección actual',
        intro: 'Indica en qué parte del manual te encuentras: <b>Portada, Introducción, Paso 1–8</b> o <b>Glosario</b>.',
      },
      {
        element: document.querySelector('.progress-bar'),
        title: 'Barra de progreso',
        intro: 'Avanza de izquierda a derecha conforme navegas. Cuando llegues al <b>Glosario</b> estará completa.',
      },
      {
        element: document.querySelector('#btnPrev'),
        title: 'Botón Anterior',
        intro: 'Retrocede al slide anterior. También puedes usar la tecla <b>←</b> del teclado.',
      },
      {
        element: document.querySelector('#btnNext'),
        title: 'Botón Siguiente',
        intro: 'Avanza al siguiente slide. También funcionan las teclas <b>→</b> y la <b>Barra espaciadora</b>.',
      },
      {
        element: document.querySelector('#slide-3 .split-left'),
        title: '📋 Lista de pasos',
        intro: 'Cada fila del listado corresponde a una acción. <b>Tócala</b> para cambiar la imagen del teléfono y ver el punto exacto donde actuar.',
      },
      {
        element: document.querySelector('#slide-3 .phone-frame'),
        title: '📱 Teléfono interactivo',
        intro: 'Muestra capturas reales de la app. Los <b>puntos pulsantes rojos ●</b> indican exactamente dónde tocar. La etiqueta debajo describe la acción.',
      },
      {
        element: document.querySelector('#btnHelp'),
        title: 'Relanzar el tour',
        intro: '¿Necesitas recordar algo? Este botón <b>?</b> relanza el tour en cualquier momento.',
      },
    ],
  }).start();
}

/* ── INICIALIZAR ── */
updateUI();

// Pre-cargar slide 1 inmediatamente (es el siguiente al que irá el usuario)
injectSlide(1).catch(() => {});

// Lanzar el tour automáticamente en la primera visita
if (!localStorage.getItem('manual-tour-done')) {
  setTimeout(startTour, 800);
  localStorage.setItem('manual-tour-done', '1');
}
