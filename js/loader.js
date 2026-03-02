/* ═══════════════════════════════════════════
   Loader de slides — carga bajo demanda con caché
   ─────────────────────────────────────────── */

const _cache = {};

/**
 * Carga el HTML de un slide y lo inyecta en su contenedor.
 * Es idempotente: si ya fue cargado no vuelve a hacer fetch.
 */
async function injectSlide(index) {
  const el = document.getElementById(`slide-${index}`);
  if (!el || el.dataset.loaded === '1') return el;

  if (!_cache[index]) {
    const resp = await fetch(`slides/slide-${index}.html`);
    if (!resp.ok) throw new Error(`Slide ${index} no encontrado (HTTP ${resp.status})`);
    _cache[index] = await resp.text();
  }

  el.innerHTML = _cache[index];
  el.dataset.loaded = '1';
  return el;
}

/**
 * Pre-carga los slides adyacentes en segundo plano (sin bloquear).
 */
function preloadAdjacent(current, total) {
  if (current + 1 < total) injectSlide(current + 1).catch(() => {});
  if (current - 1 > 0)     injectSlide(current - 1).catch(() => {});
}

/**
 * Pre-carga la primera imagen de un slide para evitar
 * que el cambio de src ocurra durante la animación de entrada.
 */
function preloadFirstImage(slideEl) {
  const first = slideEl.querySelector('.timeline-item');
  if (!first) return Promise.resolve();
  const onclick = first.getAttribute('onclick') || '';
  const match   = onclick.match(/updateModuleSlide\(['"]([^'"]+)['"]/);
  if (!match) return Promise.resolve();
  return new Promise(resolve => {
    const img  = new Image();
    img.onload = img.onerror = resolve;
    img.src    = match[1];
  });
}
