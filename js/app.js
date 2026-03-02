/* ═══════════════════════════════════════════
   Manual AliExpress · Lógica de la aplicación
   ─────────────────────────────────────────── */

/* ── CONFIGURACIÓN GENERAL ── */
const TOTAL = 15;
let current = 0;
let animating = false;

const progressBar = document.getElementById('progressBar');
const navCounter = document.getElementById('navCounter');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const navSteps = document.getElementById('navSteps');
const navButtons = document.querySelector('.nav-buttons');

/* ── NAVEGACIÓN ENTRE SLIDES ── */
function getSlide(i) {
  return document.getElementById(`slide-${i}`);
}

async function goTo(target) {
  if (animating || target === current || target < 0 || target >= TOTAL) return;
  animating = true;

  // Cargar el slide destino — si falla la red, liberar el flag y salir
  try {
    await injectSlide(target);
  } catch (e) {
    animating = false;
    console.warn(`Error cargando slide ${target}:`, e);
    return;
  }

  const currSlide = getSlide(current);
  const nextS = getSlide(target);

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
      items.forEach(t => t.classList.remove('active-step', 'pulse-once'));
      items[0].classList.add('pulse-once');
      items[0].click();
      // Quitar pulse-once tras completar las 3 iteraciones (1.8s × 3)
      setTimeout(() => items[0].classList.remove('pulse-once'), 5500);
    }

    // Inyectar hint de clic y link a Contenido (solo la primera vez por slide)
    addSlideExtras(nextS);

    animating = false;

    // Pre-cargar slides adyacentes en segundo plano
    preloadAdjacent(current, TOTAL);
  }, 500);
}

function nextSlide() { goTo(current + 1); }
function prevSlide() { goTo(current - 1); }

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
    navCounter.textContent = `PASO ${current - 2} DE 10`;
  }

  // Ocultar botones Anterior/Siguiente en Portada, Introducción y Contenido
  const hideNav = current <= 2;
  navButtons.style.opacity = hideNav ? '0' : '1';
  navButtons.style.pointerEvents = hideNav ? 'none' : 'all';

  // Botón anterior
  btnPrev.style.opacity = current === 0 ? '0.3' : '1';
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
    const step = document.createElement('div');
    step.className = 'wizard-step' + (i === current ? ' active' : i < current ? ' done' : '');
    step.title = label;
    step.onclick = () => goTo(i);

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
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
});

/* ═══════════════════════════════════════════
   DATOS DE HOTSPOTS
   ─────────────────────────────────────────
   x e y son porcentajes sobre el phone-frame
   ─────────────────────────────────────────── */
const HOTSPOTS = {

  /* PASO 1 · Instalación */
  'img-2': [
    { dots: [{ x: 48, y: 56 }], label: 'Toca el ícono de Play Store en tu pantalla de inicio' },
    { dots: [{ x: 55, y: 88 }], label: 'Toca la lupa de búsqueda en la parte superior de Play Store' },
    { dots: [{ x: 55, y: 6 }], label: 'Escribe "AliExpress" en la barra de búsqueda' },
    { dots: [{ x: 93, y: 89 }], label: 'Presiona "Buscar" en tu teclado para ver los resultados' },
    { dots: [{ x: 50, y: 42 }], label: 'Ubica AliExpress de Alibaba Mobile en los resultados' },
    { dots: [{ x: 77, y: 39 }], label: 'Toca la app y presiona el botón "Instalar"' },
    { dots: [{ x: 88, y: 39 }], label: 'Cuando termine la instalación, toca "Abrir"' },
  ],

  /* PASO 2 · Registro */
  'img-3': [
    { dots: [{ x: 26, y: 26 }], label: 'Toca "Registrarse" para crear tu cuenta' },
    { dots: [{ x: 50, y: 70 }, { x: 70, y: 33 }, { x: 70, y: 41 }], label: 'Ingresa tu correo y contraseña, o usa Facebook, X, Google o Apple' },
    { dots: [{ x: 89, y: 95 }], label: 'Ingresa el codigo de verificacion recibido' },
  ],

  /* PASO 3 · Dirección de Entrega */
  'img-dir': [
    { dots: [{ x: 93, y: 94 }], label: 'Toca Mi Cuenta en la barra inferior' },
    { dots: [{ x: 86, y: 5 }], label: 'Toca el ícono de configuración (tuerca)' },
    { dots: [{ x: 50, y: 17 }], label: 'Toca Dirección de entrega en el menú de Configuración' },
    { dots: [{ x: 80, y: 90 }], label: 'Toca Añadir nueva dirección' },
    { dots: [{ x: 70, y: 95 }], label: 'Completa todos los campos del formulario y toca Guardar' },
  ],

  /* PASO 4 · Interfaz principal */
  'img-4': [
    { dots: [{ x: 50, y: 12 }], label: 'Esta es la barra de busqueda principal' },
    { dots: [{ x: 50, y: 72 }], label: 'Aqui aparecen las ofertas y cupones activos' },
    {
      dots: [{ x: 10, y: 96 }, { x: 30, y: 96 }, { x: 70, y: 96 }, { x: 88, y: 96 }],
      label: 'Menu inferior: Inicio · Categorias · Carrito · Mi cuenta'
    },
    { dots: [{ x: 40, y: 18 }], label: 'Sello Choice: envio gratis y compra protegida' },
  ],

  /* PASO 4 · Búsqueda */
  'img-5': [
    { dots: [{ x: 50, y: 12 }], label: 'Toca aqui para comenzar tu busqueda' },
    { dots: [{ x: 50, y: 7 }], label: 'Escribe el nombre del producto y presiona Buscar' },
    { dots: [{ x: 35, y: 20 }], label: 'Toca "Choice" para ver solo productos confiables' },
    { dots: [{ x: 65, y: 70 }], label: 'Toca "Filtros" para afinar los resultados' },
  ],

  /* PASO 5 · Selección del producto */
  'img-6': [
    { dots: [{ x: 45, y: 35 }], label: 'Toca el producto que mas te interese para ver sus detalles' },
    { dots: [{ x: 20, y: 45 }, { x: 50, y: 68 }], label: 'Revisa el precio y el tiempo estimado de envio' },
    { dots: [{ x: 40, y: 50 }], label: 'Toca la variante que deseas (color, talla...)' },
    { dots: [{ x: 60, y: 96 }, { x: 95, y: 96 }], label: 'Toca "Agregar al carrito" o "Comprar ahora"' },
    { dots: [{ x: 50, y: 20 }], label: 'Verifica que tu direccion de entrega sea correcta' },
  ],

  /* PASO 6 · Pago */
  'img-7': [
    { dots: [{ x: 50, y: 47 }], label: 'Toca aqui para ver las opciones de metodo de pago disponibles' },
    { dots: [{ x: 70, y: 35 },{ x: 70, y: 42 }], label: 'Toca aqui para seleccionar el metodo de pago' },
    {dots: [{ x: 60, y: 38 }, { x: 60, y: 52 }, { x: 60, y: 57 }],label: 'Ingresa numero de tarjeta, fecha y CVV'},
    { dots: [{ x: 50, y: 55 }], label: 'Verifica el total a pagar antes de confirmar' },
    { dots: [{ x: 75, y: 95 }], label: 'Toca "Pagar ahora" para confirmar tu compra' },
  ],

  /* PASO 7 · Seguimiento */
  'img-8': [
    { dots: [{ x: 50, y: 22 }], label: 'Aqui aparece el estado actual de tu pedido' },
    { dots: [{ x: 10, y: 50 }], label: 'Toca "Rastrear" para ver la ruta del paquete' },
    { dots: [{ x: 85, y: 91 }], label: 'Activa las notificaciones para alertas de envio' },
    { dots: [{ x: 50, y: 30 }], label: 'Toca aqui para confirmar que recibiste el paquete' },
  ],

  /* PASO 9 · Asistencia en línea con EVA */
  'img-9': [
    { dots: [{ x: 95, y: 93 }], label: 'Toca "Mi Cuenta" en la barra inferior de la app' },
    { dots: [{ x: 50, y: 25 }], label: 'Selecciona: Pendiente de pago, Pendiente de envío o Enviado' },
    { dots: [{ x: 86, y: 4 }], label: 'Toca el ícono de muñeco con audífonos para abrir soporte' },
    { dots: [{ x: 65, y: 5 }], label: 'Se abre el Centro de Ayuda — aquí verás las opciones de contacto' },
    { dots: [{ x: 65, y: 90 }], label: 'Presiona el botón con audífonos que dice "En Línea"' },
    { dots: [{ x: 70, y: 95 }], label: 'Escribe tu consulta — un asistente real te responderá' },
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
    el.style.top = y + '%';
    el.innerHTML = '<div class="hotspot-ring"></div><div class="hotspot-dot"></div>';
    frameEl.appendChild(el);
  });
}

/* ── INDICADOR DE SIGUIENTE PASO (manito animada) ── */
function updateNextStepIndicator(items, activeIdx) {
  // Quitar indicador previo de todos los pasos
  items.forEach(item => {
    const ind = item.querySelector('.next-step-indicator');
    if (ind) ind.remove();
  });

  // Inyectar en el siguiente paso (si existe)
  const next = items[activeIdx + 1];
  if (next) {
    const content = next.querySelector('.timeline-content');
    if (content) {
      const ind = document.createElement('div');
      ind.className = 'next-step-indicator';
      ind.innerHTML = '<i class="fa-solid fa-hand-pointer"></i><span>Toca aquí para ver este paso</span>';
      content.appendChild(ind);
    }
  }
}

/* ── CAMBIO DE IMAGEN + HOTSPOTS EN TIMELINES ── */
function updateModuleSlide(imgSrc, element, containerId) {
  const items = Array.from(element.parentElement.querySelectorAll('.timeline-item'));
  const stepIndex = items.indexOf(element);
  items.forEach(item => item.classList.remove('active-step'));
  element.classList.add('active-step');

  const img = document.getElementById(containerId);
  if (!img) return;

  // Si había un video de paso activo, ocultarlo y restaurar la imagen
  const stepVideo = img.parentElement.querySelector('.step-video');
  if (stepVideo) stepVideo.style.display = 'none';
  img.style.display = '';

  img.style.opacity = 0;
  setTimeout(() => {
    img.src = imgSrc;
    img.style.opacity = 1;
  }, 200);

  const stepData = HOTSPOTS[containerId]?.[stepIndex];
  renderHotspots(img.parentElement, stepData);

  updateNextStepIndicator(items, stepIndex);
}

/* ── VIDEO EMBEBIDO EN UN PASO DEL TIMELINE ── */
function showStepVideo(element, containerId) {
  const items = Array.from(element.parentElement.querySelectorAll('.timeline-item'));
  const stepIndex = items.indexOf(element);
  items.forEach(item => item.classList.remove('active-step'));
  element.classList.add('active-step');

  const img = document.getElementById(containerId);
  if (!img) return;
  img.style.display = 'none';
  img.style.opacity = 1; // reset por si quedó en transición

  const stepVideo = img.parentElement.querySelector('.step-video');
  if (stepVideo) stepVideo.style.display = 'block';

  renderHotspots(img.parentElement, null); // sin hotspots en paso de video
  updateNextStepIndicator(items, stepIndex);
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

  // Usar el slide actual si ya tiene phone-frame; si no, usar slide 3 (Instalación)
  const currentHasPhone = !!document.querySelector(`#slide-${originSlide} .phone-frame`);
  const demoSlide = currentHasPhone ? originSlide : 3;
  await injectSlide(demoSlide);

  const tour = introJs();

  tour.onbeforechange(function () {
    const step = this._currentStep;
    // Mostrar botones de nav para los pasos que los referencian
    if (step === 4 || step === 5) {
      navButtons.style.opacity = '1';
      navButtons.style.pointerEvents = 'all';
    }
    // Navegar al slide con teléfono solo si aún no estamos en él
    if (step === 6 && current !== demoSlide) switchSlideInstant(demoSlide);
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
        element: document.querySelector(`#slide-${demoSlide} .split-left`),
        title: '📋 Lista de pasos',
        intro: 'Cada fila del listado corresponde a una acción. <b>Tócala</b> para cambiar la imagen del teléfono y ver el punto exacto donde actuar.',
      },
      {
        element: document.querySelector(`#slide-${demoSlide} .phone-frame`),
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

/* ── EXTRAS POR SLIDE (hint interactivo + link Contenido) ── */
function addSlideExtras(slideEl) {
  if (slideEl.dataset.extras === '1') return;
  slideEl.dataset.extras = '1';

  const wrapper = slideEl.querySelector('.content-wrapper');
  if (!wrapper) return;

  const idx = parseInt(slideEl.dataset.index);

  // Link "← Contenido" en el tope (solo slides 3 en adelante)
  if (idx >= 3) {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'slide-contenido-link';
    link.innerHTML = '<i class="fa-solid fa-chevron-left"></i> Contenido';
    link.onclick = () => goTo(2);
    wrapper.insertBefore(link, wrapper.firstChild);
  }

  // Hint de interacción encima del timeline (se elimina al primer clic del usuario)
  const timeline = slideEl.querySelector('.timeline');
  if (timeline) {
    const hint = document.createElement('p');
    hint.className = 'timeline-hint';
    hint.innerHTML = '<i class="fa-regular fa-hand-pointer"></i> Toca cada paso para ver en pantalla';
    timeline.parentElement.insertBefore(hint, timeline);
    timeline.addEventListener('click', () => hint.remove(), { once: true });
  }
}

/* ── INICIALIZAR ── */
updateUI();

// Pre-cargar slide 1 inmediatamente (es el siguiente al que irá el usuario)
injectSlide(1).catch(() => { });

// Lanzar el tour automáticamente en la primera visita
if (!localStorage.getItem('manual-tour-done')) {
  setTimeout(startTour, 800);
  localStorage.setItem('manual-tour-done', '1');
}
