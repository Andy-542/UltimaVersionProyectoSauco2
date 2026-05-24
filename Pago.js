// =============================================
//  SAÚCO SHOP — Página de Pago
//  Archivo: pago.js
// =============================================

// ── CATÁLOGO DE PRODUCTOS ──────────────────────────────────────
const CATALOGO = {
  'Mermelada de Saúco': { precio: 45, emoji: '🫐', unidad: '250g' },
  'Té de Flor de Saúco': { precio: 35, emoji: '🌸', unidad: '50g' }
};

// ── ESTADO LOCAL ───────────────────────────────────────────────
let metodoPago = null;   // 'cash' | 'card'

// ── LEER / GUARDAR CARRITO EN localStorage ─────────────────────
// El carrito se guarda como: { "Mermelada de Saúco": 2, "Té de Flor de Saúco": 1 }
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

function totalPrecio(carrito) {
  return Object.entries(carrito).reduce((acc, [nombre, cant]) => {
    return acc + (CATALOGO[nombre]?.precio || 0) * cant;
  }, 0);
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

// ── RENDER RESUMEN CARRITO ─────────────────────────────────────
function renderResumen() {
  const carrito = leerCarrito();
  const itemsEl = document.getElementById('resumenItems');
  const vacioEl = document.getElementById('resumenVacio');
  const totalesEl = document.getElementById('resumenTotales');
  const subtotalEl = document.getElementById('subtotalValor');
  const totalEl = document.getElementById('totalValor');

  if (!itemsEl) return;

  itemsEl.innerHTML = '';

  const nombres = Object.keys(carrito);

  if (nombres.length === 0) {
    vacioEl.style.display = 'flex';
    totalesEl.style.display = 'none';
    desactivarBoton();
    return;
  }

  vacioEl.style.display = 'none';
  totalesEl.style.display = 'flex';

  nombres.forEach((nombre, idx) => {
    const cant = carrito[nombre];
    const prod = CATALOGO[nombre];
    if (!prod) return;
    const subtotalProd = prod.precio * cant;

    const el = document.createElement('div');
    el.className = 'item-resumen';
    el.style.animationDelay = `${idx * 0.1}s`;
    el.innerHTML = `
      <span class="item-emoji">${prod.emoji}</span>
      <div class="item-detalle">
        <div class="item-nombre">${nombre}</div>
        <div class="item-cantidad">${prod.unidad} · artesanal</div>
      </div>
      <div class="item-precio-wrap">
        <span class="item-precio">Q${subtotalProd.toFixed(2)}</span>
        <div class="cantidad-controles">
          <button class="btn-cant" onclick="cambiarCantidad('${nombre}', -1)">−</button>
          <span class="cant-num">${cant}</span>
          <button class="btn-cant" onclick="cambiarCantidad('${nombre}', 1)">+</button>
        </div>
        <button class="btn-eliminar" onclick="eliminarItem('${nombre}')">✕ Quitar</button>
      </div>
    `;
    itemsEl.appendChild(el);
  });

  const total = totalPrecio(carrito);
  subtotalEl.textContent = `Q${total.toFixed(2)}`;
  totalEl.textContent = `Q${total.toFixed(2)}`;

  // Actualizar botón si ya hay método seleccionado
  if (metodoPago) actualizarBotonConfirmar();
}

function cambiarCantidad(nombre, delta) {
  const carrito = leerCarrito();
  if (!carrito[nombre]) return;
  carrito[nombre] += delta;
  if (carrito[nombre] <= 0) delete carrito[nombre];
  guardarCarrito(carrito);
  renderResumen();
  actualizarBadge();
}

function eliminarItem(nombre) {
  const carrito = leerCarrito();
  delete carrito[nombre];
  guardarCarrito(carrito);
  renderResumen();
  actualizarBadge();
  mostrarToast('🗑️ Producto eliminado del carrito');
}

// ── MÉTODOS DE PAGO ───────────────────────────────────────────
function seleccionarMetodo(tipo) {
  metodoPago = tipo;

  // Actualizar estilos
  document.getElementById('metodoCash').classList.toggle('activo', tipo === 'cash');
  document.getElementById('metodoCard').classList.toggle('activo', tipo === 'card');

  // Mostrar panel correcto
  const panelCash = document.getElementById('panelCash');
  const panelCard = document.getElementById('panelCard');

  if (tipo === 'cash') {
    panelCash.style.display = 'block';
    panelCard.style.display = 'none';
  } else {
    panelCash.style.display = 'none';
    panelCard.style.display = 'block';
  }

  actualizarBotonConfirmar();
}

function actualizarBotonConfirmar() {
  const btn = document.getElementById('btnConfirmar');
  const btnTexto = document.getElementById('btnTexto');
  const carrito = leerCarrito();

  if (Object.keys(carrito).length === 0) {
    btn.classList.remove('activo');
    btnTexto.textContent = 'Agrega productos primero';
    return;
  }

  if (!metodoPago) {
    btn.classList.remove('activo');
    btnTexto.textContent = 'Selecciona un método de pago';
    return;
  }

  btn.classList.add('activo');
  btnTexto.textContent = metodoPago === 'cash'
    ? '✅ Confirmar pedido'
    : '🔒 Pagar con tarjeta';
}

function desactivarBoton() {
  const btn = document.getElementById('btnConfirmar');
  const btnTexto = document.getElementById('btnTexto');
  btn.classList.remove('activo');
  btnTexto.textContent = 'Tu carrito está vacío';
}

// ── VALIDACIONES ───────────────────────────────────────────────
function validarEntrega() {
  const nombre = document.getElementById('nombreEntrega')?.value.trim();
  const telefono = document.getElementById('telefonoEntrega')?.value.trim();
  const direccion = document.getElementById('direccionEntrega')?.value.trim();

  const campos = [
    { id: 'nombreEntrega', val: nombre, msg: 'Ingresa tu nombre completo.' },
    { id: 'telefonoEntrega', val: telefono, msg: 'Ingresa tu número de teléfono.' },
    { id: 'direccionEntrega', val: direccion, msg: 'Ingresa tu dirección de entrega.' }
  ];

  for (const campo of campos) {
    if (!campo.val) {
      document.getElementById(campo.id)?.classList.add('error');
      mostrarToast('⚠️ ' + campo.msg, true);
      document.getElementById(campo.id)?.focus();
      return false;
    }
    document.getElementById(campo.id)?.classList.remove('error');
  }
  return true;
}

function validarTarjeta() {
  const num = document.getElementById('numTarjeta')?.value.replace(/\s/g, '');
  const nom = document.getElementById('nomTarjeta')?.value.trim();
  const vence = document.getElementById('venceTarjeta')?.value.trim();
  const cvv = document.getElementById('cvvTarjeta')?.value.trim();

  if (num.length < 16) {
    mostrarToast('⚠️ Número de tarjeta inválido.', true);
    document.getElementById('numTarjeta')?.classList.add('error');
    return false;
  }
  document.getElementById('numTarjeta')?.classList.remove('error');

  if (!nom || nom.length < 4) {
    mostrarToast('⚠️ Ingresa el nombre del titular.', true);
    document.getElementById('nomTarjeta')?.classList.add('error');
    return false;
  }
  document.getElementById('nomTarjeta')?.classList.remove('error');

  const [mes, anio] = (vence || '').split('/');
  const mesNum = parseInt(mes, 10);
  const anioNum = parseInt('20' + anio, 10);
  const ahora = new Date();
  const venceDate = new Date(anioNum, mesNum - 1, 1);

  if (!mes || !anio || mesNum < 1 || mesNum > 12 || venceDate < ahora) {
    mostrarToast('⚠️ Fecha de vencimiento inválida.', true);
    document.getElementById('venceTarjeta')?.classList.add('error');
    return false;
  }
  document.getElementById('venceTarjeta')?.classList.remove('error');

  if (!cvv || cvv.length < 3) {
    mostrarToast('⚠️ CVV inválido.', true);
    document.getElementById('cvvTarjeta')?.classList.add('error');
    return false;
  }
  document.getElementById('cvvTarjeta')?.classList.remove('error');

  return true;
}

// ── CONFIRMAR COMPRA ───────────────────────────────────────────
function confirmarCompra() {
  const btn = document.getElementById('btnConfirmar');
  if (!btn.classList.contains('activo')) return;

  const carrito = leerCarrito();
  if (Object.keys(carrito).length === 0) {
    mostrarToast('⚠️ Tu carrito está vacío.', true);
    return;
  }

  if (!validarEntrega()) return;
  if (metodoPago === 'card' && !validarTarjeta()) return;

  // Animación de carga
  btn.classList.add('cargando');
  const textoEl = document.getElementById('btnTexto');
  textoEl.textContent = '⏳ Procesando...';
  btn.style.cursor = 'wait';

  setTimeout(() => {
    btn.classList.remove('cargando');
    mostrarModalExito();
  }, 1800);
}

// ── MODAL ÉXITO ────────────────────────────────────────────────
function mostrarModalExito() {
  const carrito = leerCarrito();
  const total = totalPrecio(carrito);
  const nombre = document.getElementById('nombreEntrega')?.value.trim() || 'Cliente';
  const direccion = document.getElementById('direccionEntrega')?.value.trim() || '';
  const pedidoNum = '#SAU-' + Math.floor(Math.random() * 90000 + 10000);

  // Detalle del pedido en el modal
  const detalleEl = document.getElementById('exitoDetalle');
  if (detalleEl) {
    let html = '';
    Object.entries(carrito).forEach(([nombre, cant]) => {
      const prod = CATALOGO[nombre];
      if (!prod) return;
      html += `
        <div class="exito-detalle-item">
          <span>${prod.emoji} ${nombre} ×${cant}</span>
          <span>Q${(prod.precio * cant).toFixed(2)}</span>
        </div>`;
    });
    html += `<div class="exito-detalle-item"><span>Total pagado</span><span>Q${total.toFixed(2)}</span></div>`;
    detalleEl.innerHTML = html;
  }

  // Sub-mensaje según método
  const subEl = document.getElementById('exitoSub');
  if (subEl) {
    subEl.textContent = metodoPago === 'cash'
      ? `Te contactaremos pronto para coordinar la entrega, ${nombre}. 🚚`
      : `Pago procesado exitosamente. Tu pedido está en camino, ${nombre}. 🎉`;
  }

  document.getElementById('numeroPedido').textContent = pedidoNum;

  // Mostrar modal
  const modal = document.getElementById('modalExito');
  modal.style.display = 'flex';

  // Lanzar confetti
  setTimeout(() => lanzarConfetti(), 600);

  // Vaciar carrito
  guardarCarrito({});
  actualizarBadge();
}

function contactarWS() {
  const nombre = document.getElementById('nombreEntrega')?.value.trim() || '';
  const direccion = document.getElementById('direccionEntrega')?.value.trim() || '';
  const telefono = '+50240000000'; // ← Reemplaza con tu número real
  const carrito = JSON.parse(localStorage.getItem('saucoshop_carrito_ultimo') || '{}');

  const msg = encodeURIComponent(
    `Hola Saúco Shop! 👋\nQuiero confirmar mi pedido.\n\nNombre: ${nombre}\nDirección: ${direccion}\n\nProductos: Mermelada de Saúco y/o Té de Flor de Saúco\n\nGracias! 🌿`
  );
  window.open(`https://wa.me/${telefono}?text=${msg}`, '_blank');
}

// ── CONFETTI ───────────────────────────────────────────────────
function lanzarConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const colores = ['#4a9b4a','#8bc34a','#7c3a8e','#b06cc4','#c9a84c','#f5f0e8','#2d6a2d'];
  const particulas = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 7 + 3,
    d: Math.random() * 90,
    color: colores[Math.floor(Math.random() * colores.length)],
    tilt: Math.random() * 10 - 10,
    tiltSpeed: Math.random() * 0.1 + 0.05,
    velocidad: Math.random() * 3 + 1.5,
    rotacion: Math.random() * 360,
    forma: Math.random() > 0.5 ? 'circle' : 'rect'
  }));

  let frame;
  let ticks = 0;

  function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particulas.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      if (p.forma === 'circle') {
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotacion * Math.PI / 180);
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      }
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    actualizar();
    ticks++;
    if (ticks < 180) frame = requestAnimationFrame(dibujar);
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function actualizar() {
    particulas.forEach(p => {
      p.y += p.velocidad;
      p.tilt += p.tiltSpeed;
      p.x += Math.sin(p.d / 20) * 1.5;
      p.rotacion += 3;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  dibujar();
}

// ── FORMATEAR INPUTS TARJETA ───────────────────────────────────
function formatearTarjeta(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  val = val.replace(/(.{4})/g, '$1 ').trim();
  input.value = val;

  // Actualizar tarjeta visual
  const display = val || '•••• •••• •••• ••••';
  const padded = display.padEnd(19, '•').substring(0, 19);
  const tvNum = document.getElementById('tvNumero');
  if (tvNum) {
    const digits = val.replace(/\s/g, '');
    let masked = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) masked += ' ';
      masked += digits[i] || '•';
    }
    tvNum.textContent = masked;
  }

  // Detectar tipo de tarjeta
  const logoEl = document.querySelector('.tarjeta-logo');
  if (logoEl) {
    const num = val.replace(/\s/g, '');
    if (/^4/.test(num)) logoEl.textContent = 'VISA';
    else if (/^5[1-5]/.test(num)) logoEl.textContent = 'MC';
    else if (/^3[47]/.test(num)) logoEl.textContent = 'AMEX';
    else logoEl.textContent = 'CARD';
  }
}

function actualizarNombre(input) {
  const tvNom = document.getElementById('tvNombre');
  if (tvNom) tvNom.textContent = input.value.toUpperCase() || 'NOMBRE APELLIDO';
}

function formatearVence(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
  input.value = val;
  const tvVence = document.getElementById('tvVence');
  if (tvVence) tvVence.textContent = val || 'MM/AA';
}

// ── NOTIFICACIÓN BANNER ────────────────────────────────────────
function mostrarNotifBanner() {
  const banner = document.getElementById('notifBanner');
  if (!banner) return;
  const carrito = leerCarrito();
  if (totalItems(carrito) > 0) {
    setTimeout(() => banner.classList.add('visible'), 1200);
  }
}

function cerrarNotif() {
  const banner = document.getElementById('notifBanner');
  if (banner) banner.classList.remove('visible');
}

// ── ANIMACIÓN SACUDIDA CARRITO ─────────────────────────────────
function sacudirCarrito() {
  const btn = document.getElementById('btnCarritoNav');
  if (!btn) return;
  btn.classList.remove('carrito-shake');
  void btn.offsetWidth; // reflow para reiniciar animación
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
function mostrarToast(msg, esError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.toggle('error', esError);
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ── SCROLL ANIMATION ───────────────────────────────────────────
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(entrada => {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity = '1';
      entrada.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.resumen-card, .entrega-card, .pago-card, .metodo-item'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observador.observe(el);
});

// ── INIT ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarBadge();
  renderResumen();
  mostrarNotifBanner();

  // Sacudir carrito si tiene items al cargar
  const carrito = leerCarrito();
  if (totalItems(carrito) > 0) {
    setTimeout(sacudirCarrito, 1500);
    setTimeout(sacudirCarrito, 4000);
  }
});