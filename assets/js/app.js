/**
 * =========================================================================
 * 🎄 PROYECTO: SABOR NAVIDEÑO - CÓDIGO CORE (app.js) 🎄
 * =========================================================================
 * 
 * ¡Hola! He programado este archivo para que sea el motor de toda mi tienda. 
 * He intentado que todo esté súper ordenado para que si en el futuro quiero 
 * cambiar algo, no me vuelva loca buscando.
 * 
 * He organizado el código en bloques lógicos. ¡Espero que me sirva de guía!
 */

// ==========================================
// 1. CONFIGURACIÓN Y DIRECCIONES (API)
// ==========================================

// Aquí guardo las direcciones de donde saco la comida. 
// Si la API de TheMealDB cambia, solo tendría que tocar esto.
const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';
const ENDPOINT_RANDOM = '/random.php';

// Dirección de mi "servidor" local para los usuarios.
// ¡OJO!: Recuerda que tengo que tener el comando 'npm run server' activo.
const URL_JSON_SERVER = 'http://localhost:3000';

/**
 * DATOS DE EMAILJS
 * Estas son las llaves para que los correos me lleguen a mí.
 * TIP FUTURO: Si cambio de cuenta de correo, cambio estos IDs de aquí abajo.
 */
const EMAILJS_PUBLIC_KEY = 'IAQlDtLB8I4gvNOSC';
const EMAILJS_SERVICE_ID = 'service_h6gqoor';
const EMAILJS_TEMPLATE_ID = 'template_nzh1gkb';

// ==========================================
// 2. EL ESTADO DE LA WEB (La Memoria)
// ==========================================

// He creado este objeto 'estado' para que la web "sepa" en todo momento qué está pasando.
const estado = {
    usuario: null,           // Aquí guardaré quién ha hecho login.
    categorias: [],          // Aquí guardo las categorías (Pescado, Postres...).
    todosLosProductos: [],   // Todos los platos que he bajado de la red.
    productosVisibles: [],   // Solo los que estoy enseñando ahora mismo.
    carrito: JSON.parse(localStorage.getItem('carrito')) || [], // Recupero el carrito si cerré la pestaña.
    captchaEsperado: 0,      // El resultado de la suma del login.
    categoriaActual: 'all',  // Qué filtro tengo puesto.
    cargando: false,         // Para que no se vuelva loco cargando mil cosas a la vez.
    indiceActual: 0,         // Para saber cuántos platos llevo cargados.
    itemsIniciales: 6,       // Empiezo enseñando 6 platos.
    itemsPorPagina: 3,       // Al bajar o dar al botón, cargo 3 más.
    modoBoton: false,        // Si es móvil, sale el botón de "Cargar más".
};

// Objeto vacío que llenaré con todas las "piezas" del HTML (IDs).
let elementos = {};

/**
 * Función que "atrapa" todos los IDs de mi HTML. 
 * La llamo al principio para tenerlo todo a mano.
 */
function capturarElementos() {
    elementos = {
        // Contenedores grandes
        app: document.getElementById('app'),
        badgeCarrito: document.querySelector('.cart-badge'),
        landing: document.getElementById('landing-page'),
        mainApp: document.getElementById('main-app'),

        // Login y Registro
        userWelcome: document.getElementById('user-welcome'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        logoutBtn: document.getElementById('logout-btn'),
        captchaLabel: document.getElementById('captcha-label'),
        captchaInput: document.getElementById('login-captcha'),

        // Galería y Navegación
        galleryGrid: document.querySelector('.gallery__grid'),
        navToggle: document.getElementById('nav-toggle'),
        navMenu: document.getElementById('nav-menu'),
        navClose: document.getElementById('nav-close'),
        logoNav: document.getElementById('logo-nav'),
        navHome: document.getElementById('nav-home'),
        navProducts: document.getElementById('nav-products'),
        cartBtn: document.getElementById('cart-btn'),
        heroCta: document.getElementById('hero-cta'),

        // Ventana de detalle (Modal)
        modal: document.getElementById('product-modal'),
        modalBody: document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close'),
        modalOverlay: document.getElementById('modal-overlay'),

        // Vistas de la App
        catalogView: document.getElementById('catalog-view'),
        cartView: document.getElementById('cart-view'),

        // Carrito
        cartFullList: document.getElementById('cart-full-list'),
        summarySubtotal: document.getElementById('summary-subtotal'),
        summaryTotal: document.getElementById('summary-total'),
        checkoutFinalBtn: document.getElementById('checkout-final-btn'),
        continueShopping: document.getElementById('continue-shopping'),
        sortSelect: document.getElementById('sort-select'),
    };
}

// ==========================================
// 3. SEGURIDAD Y ENTRADA (Auth)
// ==========================================

/**
 * Mira si ya estaba dentro antes de recargar. 
 * Si encuentro mi sesión, entro directo al catálogo.
 */
function inicializarAuth() {
    const sesion = localStorage.getItem('usuario_sesion');
    configurarEventosAuth(); // Activo los botones de los formularios.

    if (sesion) {
        estado.usuario = JSON.parse(sesion);
        cambiarVista('app');
    } else {
        cambiarVista('landing');
    }
}

/**
 * CAPTCHA Navideño: Genero una suma aleatoria para evitar bots.
 * TIP FUTURO: Si quiero que sea más difícil, puedo multiplicar los números en vez de sumar.
 */
function generarCaptcha() {
    if (!elementos.captchaLabel) return;
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    estado.captchaEsperado = num1 + num2;
    elementos.captchaLabel.textContent = `Pregunta de seguridad: ¿Cuánto es ${num1} + ${num2}?`;
}

/**
 * Configuro los botones de "Login" y "Registro" para que cambien de pestañas.
 */
function configurarEventosAuth() {
    const tabs = document.querySelectorAll('.auth__tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.target;
            if (target === 'login') {
                elementos.loginForm?.classList.remove('hidden');
                elementos.registerForm?.classList.add('hidden');
            } else {
                elementos.loginForm?.classList.add('hidden');
                elementos.registerForm?.classList.remove('hidden');
            }
        });
    });

    // Activo el botón de enviar
    elementos.loginForm?.addEventListener('submit', manejarLogin);
    elementos.registerForm?.addEventListener('submit', manejarRegistro);
    elementos.logoutBtn?.addEventListener('click', manejarLogout);
}

/**
 * Lógica al pulsar "Entrar". Compruebo captcha y busco al usuario en mi DB.
 */
async function manejarLogin(e) {
    e.preventDefault();
    const username = elementos.loginForm.username.value;
    const password = elementos.loginForm.password.value;
    const captchaValue = parseInt(elementos.captchaInput.value);
    const errorMsg = document.getElementById('login-error');

    // Valido el captcha primero
    if (captchaValue !== estado.captchaEsperado) {
        errorMsg.textContent = '¡Ups! La suma no es correcta. Inténtalo de nuevo.';
        errorMsg.classList.remove('hidden');
        generarCaptcha();
        elementos.captchaInput.value = '';
        return;
    }

    try {
        const res = await fetch(`${URL_JSON_SERVER}/users?username=${username}&password=${password}`);
        const usuarios = await res.json();

        if (usuarios.length > 0) {
            estado.usuario = usuarios[0];
            localStorage.setItem('usuario_sesion', JSON.stringify(estado.usuario));
            errorMsg.classList.add('hidden');
            cambiarVista('app');
            actualizarCarritoUI();
        } else {
            errorMsg.textContent = 'Usuario o contraseña incorrectos.';
            errorMsg.classList.remove('hidden');
            generarCaptcha();
        }
    } catch (error) {
        console.error('Error login:', error);
    }
}

/**
 * Lógica de registro. Guardo los datos del nuevo usuario en db.json.
 */
async function manejarRegistro(e) {
    e.preventDefault();
    const formData = new FormData(elementos.registerForm);
    const nuevoUsuario = {
        nombre: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        rol: 'cliente'
    };

    try {
        // Comprobar si el nombre ya está cogido
        const checkRes = await fetch(`${URL_JSON_SERVER}/users?username=${nuevoUsuario.username}`);
        const existe = await checkRes.json();
        if (existe.length > 0) {
            alert('Este nombre de usuario ya existe. ¡Prueba otro!');
            return;
        }

        const res = await fetch(`${URL_JSON_SERVER}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        if (res.ok) {
            alert('¡Cuenta creada con éxito! Ya puedes entrar.');
            document.querySelector('[data-target="login"]').click(); // Le mando a la pestaña de entrar
        }
    } catch (error) {
        console.error('Error registro:', error);
    }
}

function manejarLogout() {
    estado.usuario = null;
    localStorage.removeItem('usuario_sesion');
    if (elementos.app) elementos.app.innerHTML = ''; // Limpio el catálogo.
    cambiarVista('landing');
}

// ==========================================
// 4. LA GALERÍA ABSTRACTA (Portada)
// ==========================================

/**
 * Traigo 10 platos de comida al azar para que la portada quede bonita.
 * He configurado la galería para que tenga formas raras y rotaciones artísticas.
 */
async function cargarGaleriaAleatoria() {
    if (!elementos.galleryGrid) return;
    elementos.galleryGrid.innerHTML = '<div class="gallery__loading">Cargando inspiración navideña...</div>';

    // Pido las 10 fotos a la vez para ir más rápido.
    const promesas = Array.from({ length: 10 }, () =>
        fetch(`${URL_BASE_API}${ENDPOINT_RANDOM}`).then(r => r.json())
    );

    try {
        const resultados = await Promise.all(promesas);
        elementos.galleryGrid.innerHTML = '';
        resultados.forEach((data, index) => {
            const meal = data.meals[0];
            const i = index + 1;
            const item = document.createElement('div');
            item.className = `gallery__item gallery__item--${i} fade-in`;
            item.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}">`;
            elementos.galleryGrid.appendChild(item);
        });
    } catch (error) {
        console.error('Error galeria:', error);
    }
}

// ==========================================
// 5. NAVEGACIÓN Y CAMBIO DE SECCIONES
// ==========================================

/**
 * Controla si se ve la portada (Landing) o la zona de compras (App).
 */
function cambiarVista(vista) {
    capturarElementos();
    if (vista === 'app') {
        elementos.landing?.classList.add('hidden');
        elementos.mainApp?.classList.remove('hidden');
        setTimeout(() => {
            if (estado.usuario && elementos.userWelcome) {
                elementos.userWelcome.innerHTML = `Hola, ${estado.usuario.nombre || estado.usuario.username}`;
            }
            cargarContenidoApp();
        }, 10);
    } else {
        elementos.landing?.classList.remove('hidden');
        elementos.mainApp?.classList.add('hidden');
        generarCaptcha();
        cargarGaleriaAleatoria();
    }
}

/**
 * Cambia entre el Catálogo de platos y el Carrito Completo.
 */
function cambiarVistaApp(vista, destino = null) {
    if (vista === 'cart') {
        elementos.catalogView?.classList.add('hidden');
        elementos.cartView?.classList.remove('hidden');
        renderizarCarrito();
        window.scrollTo(0, 0);
    } else {
        elementos.catalogView?.classList.remove('hidden');
        elementos.cartView?.classList.add('hidden');
        // Si quiero ir a una sección concreta (ej: Nuestros Platos)
        if (destino) {
            const el = document.getElementById(destino);
            setTimeout(() => el?.scrollIntoView({ behavior: 'smooth' }), 10);
        } else {
            window.scrollTo(0, 0);
        }
    }
}

/**
 * Activo los botones del menú móvil, el logo, etc.
 */
function inyectarNavEventos() {
    elementos.navToggle?.addEventListener('click', () => elementos.navMenu.classList.add('show-menu'));
    elementos.navClose?.addEventListener('click', () => elementos.navMenu.classList.remove('show-menu'));
    elementos.modalClose?.addEventListener('click', cerrarModal);
    elementos.modalOverlay?.addEventListener('click', cerrarModal);

    // Enlaces de la barra de navegación
    elementos.logoNav?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog'); });
    elementos.navHome?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog'); });
    elementos.navProducts?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog', 'nuestros-platos'); });
    elementos.cartBtn?.addEventListener('click', () => cambiarVistaApp('cart'));
    elementos.heroCta?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog', 'nuestros-platos'); });
    elementos.continueShopping?.addEventListener('click', () => cambiarVistaApp('catalog'));
    elementos.checkoutFinalBtn?.addEventListener('click', simularCheckout);
}

// ==========================================
// 6. CATÁLOGO DE PRODUCTOS (Lógica de Ventas)
// ==========================================

/**
 * Cuando entro a la tienda, cargo las categorías y preparo los productos.
 */
async function cargarContenidoApp() {
    actualizarConfiguracion();
    try {
        await obtenerCategorias();
        await obtenerProductos('Seafood'); // Empiezo enseñando Mariscos que es muy navideño.
        window.addEventListener('scroll', manejarScroll); // Activo el scroll infinito.
        conectarFiltros();
        conectarOrdenacion();
        actualizarCarritoUI();
    } catch (error) {
        console.error('Error contenido app:', error);
    }
}

/**
 * Responsive: Si estoy en móvil cargo menos cosas que en PC.
 * TIP FUTURO: Si añado pantallas intermedias, aquí añado más 'breakpoints'.
 */
function actualizarConfiguracion() {
    const ancho = window.innerWidth;
    if (ancho >= 968) {
        estado.itemsIniciales = 6; estado.itemsPorPagina = 3; estado.modoBoton = false;
    } else if (ancho >= 768) {
        estado.itemsIniciales = 4; estado.itemsPorPagina = 2; estado.modoBoton = false;
    } else {
        estado.itemsIniciales = 3; estado.itemsPorPagina = 3; estado.modoBoton = true;
    }
}

async function obtenerCategorias() {
    try {
        const res = await fetch(`${URL_BASE_API}${ENDPOINT_CATEGORIAS}`);
        const datos = await res.json();
        estado.categorias = datos.categories;
    } catch (e) { console.error(e); }
}

/**
 * Trae los platos de la categoría de la red.
 * Si elijo "Todos", mezclo platos de varias categorías.
 */
async function obtenerProductos(categoria) {
    estado.cargando = true;
    estado.indiceActual = 0;
    estado.todosLosProductos = [];
    if (elementos.app) elementos.app.innerHTML = '';
    eliminarBotonCargarMas();

    try {
        let listaFinal = [];
        if (categoria === 'all') {
            const cats = ['Seafood', 'Pasta', 'Dessert']; // Estas son mis categorías favoritas.
            const promesas = cats.map(c => fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${c}`).then(r => r.json()));
            const resultados = await Promise.all(promesas);
            resultados.forEach(d => { if (d.meals) listaFinal = [...listaFinal, ...d.meals]; });
        } else {
            const res = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
            const datos = await res.json();
            listaFinal = datos.meals || [];
        }
        estado.todosLosProductos = listaFinal;
        cargarSiguienteBloque(estado.itemsIniciales);
    } catch (e) { console.error(e); } finally { estado.cargando = false; }
}

/**
 * PAGINACIÓN: Va enseñando platos de 3 en 3 (o los que toque).
 */
function cargarSiguienteBloque(cantidad) {
    if (estado.indiceActual >= estado.todosLosProductos.length) {
        eliminarBotonCargarMas();
        return;
    }
    const nuevos = estado.todosLosProductos.slice(estado.indiceActual, estado.indiceActual + cantidad);
    estado.indiceActual += cantidad;
    renderizarBloque(nuevos);
    if (estado.modoBoton) gestionarBotonCargarMas();
}

/**
 * Dibuja el HTML de cada plato en la pantalla.
 * He simulado el precio usando el ID del plato para que cada uno sea diferente.
 */
function renderizarBloque(lista) {
    if (!elementos.app) return;
    const html = lista.map(p => `
        <article class="card fade-in" onclick="abrirModal('${p.idMeal}')">
            <img src="${p.strMealThumb}" alt="${p.strMeal}" class="card__image">
            <div class="card__data">
                <h3 class="card__title">${p.strMeal}</h3>
                <span class="card__price">$${(p.idMeal / 1000).toFixed(2)}</span>
                <button class="btn btn--primary" onclick="event.stopPropagation(); agregarAlCarrito('${p.idMeal}')">Añadir</button>
            </div>
        </article>
    `).join('');
    elementos.app.insertAdjacentHTML('beforeend', html);
}

function conectarFiltros() {
    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            botones.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            obtenerProductos(btn.dataset.category);
        });
    });
}

function conectarOrdenacion() {
    elementos.sortSelect?.addEventListener('change', (e) => ordenarProductos(e.target.value));
}

/**
 * Ordeno la lista en memoria para no tener que volver a llamar a la API.
 */
function ordenarProductos(criterio) {
    if (!estado.todosLosProductos.length) return;
    if (criterio === 'price-asc') estado.todosLosProductos.sort((a, b) => a.idMeal - b.idMeal);
    else if (criterio === 'price-desc') estado.todosLosProductos.sort((a, b) => b.idMeal - a.idMeal);
    else if (criterio === 'name-az') estado.todosLosProductos.sort((a, b) => a.strMeal.localeCompare(b.strMeal));

    estado.indiceActual = 0;
    if (elementos.app) elementos.app.innerHTML = '';
    cargarSiguienteBloque(estado.itemsIniciales);
}

// ==========================================
// 7. CARGA POR SCROLL E INFINITE LOAD
// ==========================================

/**
 * Detecta cuando el usuario está llegando al final de la página.
 */
function manejarScroll() {
    // Si estoy usando el botón de móvil, ignoro el scroll.
    if (estado.modoBoton || estado.cargando || estado.indiceActual >= estado.todosLosProductos.length) return;

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    // Si estoy a 100px del final, cargo el siguiente bloque.
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        cargarSiguienteBloque(estado.itemsPorPagina);
    }
}

/**
 * En móviles me gusta más poner un botón que scrollear infinitamente.
 */
function gestionarBotonCargarMas() {
    eliminarBotonCargarMas();
    if (estado.indiceActual < estado.todosLosProductos.length) {
        const html = `<div class="load-more-container" style="width: 100%; display: flex; justify-content: center; margin-top: 2rem;">
            <button id="btn-load-more" class="btn btn--outline">Cargar más productos</button>
        </div>`;
        elementos.app?.insertAdjacentHTML('afterend', html);
        document.getElementById('btn-load-more')?.addEventListener('click', () => cargarSiguienteBloque(estado.itemsPorPagina));
    }
}

function eliminarBotonCargarMas() {
    document.querySelector('.load-more-container')?.remove();
}

// ==========================================
// 8. CARRITO DE COMPRA
// ==========================================

/**
 * Añado una unidad al carrito. Si ya está, solo subo el contador.
 */
function agregarAlCarrito(id) {
    const plato = estado.todosLosProductos.find(p => p.idMeal === id);
    if (!plato) return;
    const item = estado.carrito.find(i => i.idMeal === id);
    if (item) item.cantidad++;
    else estado.carrito.push({ ...plato, cantidad: 1, precio: parseFloat((plato.idMeal / 1000).toFixed(2)) });

    guardarCarrito();
    actualizarCarritoUI();
    // Si estoy viendo el carrito, lo redibujo para que se vea el cambio
    if (!elementos.cartView.classList.contains('hidden')) renderizarCarrito();
}

/**
 * LocalStorage: Guardo el carrito en el navegador.
 */
function guardarCarrito() { localStorage.setItem('carrito', JSON.stringify(estado.carrito)); }

/**
 * Actualiza el numerito rojo que sale encima del carrito.
 */
function actualizarCarritoUI() {
    if (elementos.badgeCarrito) {
        elementos.badgeCarrito.textContent = estado.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }
}

/**
 * Dibuja la lista de productos del carrito con sus fotos y botones de borrar.
 */
function renderizarCarrito() {
    if (!elementos.cartFullList) return;
    if (estado.carrito.length === 0) {
        elementos.cartFullList.innerHTML = `<div class="cart-empty"><p>Tu carrito está vacío. ¡Vuelve a por algo rico!</p><button class="btn btn--primary" onclick="cambiarVistaApp('catalog')">Ir a Tienda</button></div>`;
        elementos.summarySubtotal.textContent = '$0.00'; elementos.summaryTotal.textContent = '$0.00';
        return;
    }
    let total = 0;
    elementos.cartFullList.innerHTML = estado.carrito.map(item => {
        total += item.precio * item.cantidad;
        return `<div class="cart-item fade-in">
            <img src="${item.strMealThumb}" alt="${item.strMeal}" class="cart-item__img">
            <div class="cart-item__info"><h3 class="cart-item__title">${item.strMeal}</h3></div>
            <div class="cart-item__price-box">
                <span class="cart-item__price">$${item.precio.toFixed(2)}</span>
                <div class="cart-item__qty-box">
                    <button class="cart-item__btn" onclick="cambiarCantidad('${item.idMeal}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="cart-item__btn" onclick="cambiarCantidad('${item.idMeal}', 1)">+</button>
                </div>
            </div>
            <i class="fa-solid fa-trash-can cart-item__del" onclick="eliminarDelCarrito('${item.idMeal}')"></i>
        </div>`;
    }).join('');
    elementos.summarySubtotal.textContent = `$${total.toFixed(2)}`;
    elementos.summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function eliminarDelCarrito(id) {
    estado.carrito = estado.carrito.filter(i => i.idMeal !== id);
    guardarCarrito(); actualizarCarritoUI(); renderizarCarrito();
}

function cambiarCantidad(id, delta) {
    const item = estado.carrito.find(i => i.idMeal === id);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) eliminarDelCarrito(id);
        else { guardarCarrito(); actualizarCarritoUI(); renderizarCarrito(); }
    }
}

/**
 * EL MOMENTO FINAL: Enviar el email real con los datos de la compra.
 */
async function simularCheckout() {
    if (estado.carrito.length === 0) return;
    const btn = elementos.checkoutFinalBtn;
    btn.disabled = true; btn.textContent = 'Procesando pedido... ❄️';

    const total = estado.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const orderId = "SN-" + Math.floor(Math.random() * 100000); // Genero un código de pedido.

    // Mapeo los datos tal cual los espera mi plantilla de EmailJS.
    const templateParams = {
        order_id: orderId,
        email: estado.usuario.email,
        orders: estado.carrito.map(i => ({ image_url: i.strMealThumb, name: i.strMeal, units: i.cantidad, price: i.precio.toFixed(2) })),
        cost: { shipping: "0.00", tax: "0.00", total: total.toFixed(2) }
    };

    try {
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        }
        alert('¡Gracias por tu pedido! Te hemos enviado un correo de confirmación navideño.');
        estado.carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        cambiarVistaApp('catalog');
    } catch (e) {
        console.error(e);
        alert('Ha habido un pequeño error con el email, pero tu pedido está en camino.');
        estado.carrito = []; // Limpio igual por buena experiencia de usuario.
        guardarCarrito();
        actualizarCarritoUI();
        cambiarVistaApp('catalog');
    }
    finally {
        btn.disabled = false;
        btn.textContent = 'Proceder al Pago';
    }
}

// ==========================================
// 9. EL MODAL (Vistazo rápido con recetas)
// ==========================================

/**
 * Cuando pincho en un plato, pido todos los detalles (ingredientes, preparación).
 */
async function abrirModal(id) {
    if (!elementos.modal) return;
    elementos.modalBody.innerHTML = '<div class="skeleton" style="height:300px"></div>';
    elementos.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evito que scrollee el fondo.

    try {
        const res = await fetch(`${URL_BASE_API}/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];

        // La API da los ingredientes por separado. Los recojo todos aquí.
        const ingredientes = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`], med = meal[`strMeasure${i}`];
            if (ing && ing.trim()) ingredientes.push(`${med} ${ing}`);
        }

        elementos.modalBody.innerHTML = `
            <img src="${meal.strMealThumb}" class="modal__img">
            <h2 class="modal__title">${meal.strMeal}</h2>
            <div class="modal__ingredients">${ingredientes.map(i => `<div class="modal__ingredient">${i}</div>`).join('')}</div>
            <h3 class="modal__subtitle">Cómo prepararlo</h3>
            <p class="modal__instructions">${meal.strInstructions}</p>
            <div style="display:flex; justify-content:center; margin-top:1.5rem">
                <button class="btn btn--primary" onclick="agregarAlCarrito('${meal.idMeal}'); cerrarModal();">Añadir al Carrito - $${(meal.idMeal / 1000).toFixed(2)}</button>
            </div>
        `;
    } catch (e) {
        elementos.modalBody.innerHTML = '<p>¡Error! No hemos podido cargar la receta.</p>';
    }
}

function cerrarModal() { elementos.modal?.classList.add('hidden'); document.body.style.overflow = 'auto'; }

// ==========================================
// 10. ARRANQUE DEL SISTEMA
// ==========================================

/**
 * Función que lo inicia todo en orden.
 */
async function iniciar() {
    capturarElementos();
    actualizarConfiguracion();

    // Si la librería EmailJS está cargada, la inicio.
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

    inicializarAuth(); // ¿Quién eres?
    inyectarNavEventos(); // Activo los botones.

    // Recalculo si se gira la pantalla.
    window.addEventListener('resize', actualizarConfiguracion);
}

// ¡Que empiece la Navidad!
document.addEventListener('DOMContentLoaded', iniciar);

/**
 * ACCESSO GLOBAL
 * Hago que estas funciones sean visibles desde el HTML.
 */
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.cerrarModal = cerrarModal;
window.cambiarVistaApp = cambiarVistaApp;
