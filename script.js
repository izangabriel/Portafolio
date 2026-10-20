const PROJECTS = [
  { title: 'Ecommerce Café Imperium', desc: 'Aplicación web frontend para una cafetería que permite explorar productos, gestionar el carrito de compras y realizar pagos seguros mediante Stripe.',
    tags: ['React', 'API REST', 'Express','Tailwindcss'],
    live: 'https://cafe-imperium.netlify.app/', repo: '' },
  { title: 'Expense Tracker', desc: 'Aplicación web para registrar y analizar gastos personales. Cada persona inicia sesión y solo ve sus propios gastos: esa regla la aplica la base de datos con Row Level Security, no solo el frontend.',
    tags: ['React', 'API REST', 'Tailwindcss'],
    live: 'https://expense-trackeri.netlify.app/', repo: '' },
  { title: 'Votation', desc: 'Encuestas con resultados en tiempo real. Cualquiera puede crear una encuesta y votar sin registrarse, y los conteos se actualizan al instante en todas las pantallas abiertas, sin recargar.',
    tags: ['React', 'API REST', 'Tailwindcss'],
    live: 'https://appvotation.netlify.app/', repo: '' },
];

const $ = (s, c = document) => c.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = { 'React': 'devicon-react-original colored', 'Hooks': 'devicon-react-original colored', 'JavaScript': 'devicon-javascript-plain colored', 'HTML': 'devicon-html5-plain colored', 'CSS': 'devicon-css3-plain colored', 'Node.js': 'devicon-nodejs-plain colored', 'Express': 'devicon-express-original ic-n', 'MongoDB': 'devicon-mongodb-plain colored', 'Tailwindcss': 'devicon-tailwindcss-plain colored' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Tema, con transición circular desde el botón */
const root = document.documentElement, toggle = $('#themeToggle');
function paint(t) {
  root.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) {}
  $('#themeIcon').textContent = t === 'dark' ? '☾' : '☀';
  toggle.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
}
paint(root.dataset.theme || 'dark');
toggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition || reduced) return paint(next);
  const r = toggle.getBoundingClientRect();
  root.style.setProperty('--tx', r.left + r.width / 2 + 'px');
  root.style.setProperty('--ty', r.top + r.height / 2 + 'px');
  document.startViewTransition(() => paint(next));
});

/* Proyectos */
const list = $('#projects');
list.innerHTML = PROJECTS.map(p => `
  <li data-img="${esc(p.img)}">
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.desc)}</p>
    <div class="tags">${p.tags.map(t => `<span>${ICON[t] ? `<i class="${ICON[t]}" aria-hidden="true"></i>` : ''}${esc(t)}</span>`).join('')}</div>
    <img class="thumb-m" src="${esc(p.img)}" alt="Captura de ${esc(p.title)}" loading="lazy" width="640" height="360">
    <div class="plinks">
      <a href="${esc(p.live)}" target="_blank" rel="noopener noreferrer">Ver demo<span class="sr-only"> de ${esc(p.title)}</span></a>
      ${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">Código<span class="sr-only"> de ${esc(p.title)}</span></a>` : ''}
    </div>
  </li>`).join('');

/* Vista previa que sigue al cursor (solo con ratón) */
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
  const peek = $('#peek'), img = $('img', peek);
  let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
  const tick = () => {
    cx += (x - cx) * 0.15; cy += (y - cy) * 0.15;
    peek.style.translate = `${cx + 24}px ${cy - 100}px`;
    raf = peek.classList.contains('on') ? requestAnimationFrame(tick) : 0;
  };
  list.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  list.querySelectorAll('li').forEach(li => {
    li.addEventListener('mouseenter', e => {
      img.src = li.dataset.img;
      x = cx = e.clientX; y = cy = e.clientY;
      peek.classList.add('on');
      if (!raf) raf = requestAnimationFrame(tick);
    });
    li.addEventListener('mouseleave', () => peek.classList.remove('on'));
  });
}

/* Enlace activo del menú */
const links = document.querySelectorAll('header nav a:not(.pill)');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('active-section', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(s => io.observe(s));

/* Formulario */
const form = $('#contactForm'), msg = $('#formMsg'), btn = $('#submitBtn');
let timer;
function say(text, type) {
  clearTimeout(timer);
  msg.textContent = text; msg.className = 'form-msg ' + type;
  timer = setTimeout(() => { msg.textContent = ''; msg.className = 'form-msg'; }, 6000);
}
form.addEventListener('submit', async e => {
  e.preventDefault();
  const email = form.email, mensaje = form.mensaje;
  const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  email.setAttribute('aria-invalid', !okEmail);
  mensaje.setAttribute('aria-invalid', !mensaje.value.trim());
  if (!okEmail) return say('Escribe un correo válido.', 'error');
  if (!mensaje.value.trim()) return say('Escribe tu mensaje.', 'error');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try {
    const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
    if (res.ok) { say('Mensaje enviado. Te responderé pronto.', 'success'); form.reset(); }
    else { const d = await res.json().catch(() => ({})); say(d?.errors?.map(x => x.message).join(', ') || 'No se pudo enviar. Inténtalo de nuevo.', 'error'); }
  } catch { say('Error de conexión. Revisa tu internet e inténtalo de nuevo.', 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Enviar mensaje'; }
});

$('#year').textContent = new Date().getFullYear();