// =============================================
//  SAÚCO SHOP — Interactividad Principal
//  Archivo: script.js
// =============================================


// ── CARRITO: leer / guardar en localStorage ────────────────────
// Así el carrito persiste entre la página principal y pago.html
function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem('saucoshop_carrito') || '{}');
  } catch {
    return {};
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem('saucoshop_carrito', JSON.stringify(carrito));
}

function totalItems(carrito) {
  return Object.values(carrito).reduce((a, b) => a + b, 0);
}


// ── BADGE DEL CARRITO EN NAV ───────────────────────────────────
function actualizarBadge() {
  const badge = document.getElementById('carritoBadge');
  if (!badge) return;
  const carrito = leerCarrito();
  const total = totalItems(carrito);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'none';
}

// Sacudir carrito con animación
function sacudirCarrito() {
  const btn = document.getElementById('btnCarritoNav');
  if (!btn) return;
  btn.classList.remove('carrito-shake');
  void btn.offsetWidth;
  btn.classList.add('carrito-shake');
  const badge = document.getElementById('carritoBadge');
  if (badge) {
    badge.classList.remove('pulsar');
    void badge.offsetWidth;
    badge.classList.add('pulsar');
  }
  setTimeout(() => btn.classList.remove('carrito-shake'), 700);
}


// ── TOAST ──────────────────────────────────────────────────────
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}


// ── AGREGAR AL CARRITO ─────────────────────────────────────────
// Llamado desde los botones de productos en index.html
function agregarCarrito(nombre) {
  const carrito = leerCarrito();
  carrito[nombre] = (carrito[nombre] || 0) + 1;
  guardarCarrito(carrito);
  actualizarBadge();
  sacudirCarrito();
  mostrarToast('🛒 ' + nombre + ' agregado al carrito');

  // Mostrar banner de notificación si existe
  const banner = document.getElementById('notifBanner');
  if (banner) {
    banner.classList.add('visible');
    clearTimeout(banner._timeout);
    banner._timeout = setTimeout(() => banner.classList.remove('visible'), 6000);
  }
}


// ── BANNER NOTIFICACIÓN (si está en index.html) ────────────────
function cerrarNotif() {
  const banner = document.getElementById('notifBanner');
  if (banner) banner.classList.remove('visible');
}


// ── SCROLL ANIMATION: Aparición al hacer scroll ───────────────
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity = '1';
      entrada.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.producto-card-grande, .beneficio-item, .dato-card, .stat-box, .paso, .foto-card, .tl-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observador.observe(el);
});


// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();

  // Si hay items en carrito al cargar la página, sacudir
  const carrito = leerCarrito();
  if (totalItems(carrito) > 0) {
    setTimeout(sacudirCarrito, 2000);
  }
});