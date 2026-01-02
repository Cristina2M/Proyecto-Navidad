/**
 * @file app.js
 * @description Motor principal de la tienda "Sabor Navideño". Gestiona el catálogo, 
 * el carrito de compras, la autenticación y la integración con EmailJS.
 * @author Cristina & Sergio (Core Team)
 * @version 1.5.0
 */

/**
 * @typedef {Object} Producto
 * @property {string} idMeal - ID único del plato
 * @property {string} strMeal - Nombre del plato
 * @property {string} strMealThumb - URL de la imagen del plato
 * @property {number} [cantidad] - Cantidad en el carrito
 * @property {number} [precio] - Precio calculado
 */

/**
 * @typedef {Object} Usuario
 * @property {string} nombre - Nombre real
 * @property {string} username - Nombre de usuario
 * @property {string} email - Correo electrónico
 */

/**
 * @namespace Estado
 * @description Almacena la memoria volátil y persistente de la aplicación.
 */
const estado = {
    /** @type {Usuario|null} */
    usuario: null,
    /** @type {Array} */
    categorias: [],
    /** @type {Producto[]} */
    todosLosProductos: [],
    /** @type {Producto[]} */
    productosVisibles: [],
    /** @type {Producto[]} */
    carrito: (typeof localStorage !== 'undefined') ? JSON.parse(localStorage.getItem('carrito')) || [] : [],
    /** @type {number} */
    captchaEsperado: 0,
    /** @type {string} */
    categoriaActual: 'all',
    /** @type {boolean} */
    cargando: false,
    /** @type {number} */
    indiceActual: 0,
    /** @type {number} */
    itemsIniciales: 6,
    /** @type {number} */
    itemsPorPagina: 3,
    /** @type {boolean} */
    modoBoton: false,
};

// ==========================================
// 1. CONFIGURACIÓN Y APIS
// ==========================================

const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';
const ENDPOINT_RANDOM = '/random.php';
const URL_JSON_SERVER = 'http://localhost:3000';

const EMAILJS_PUBLIC_KEY = 'IAQlDtLB8I4gvNOSC';
const EMAILJS_SERVICE_ID = 'service_h6gqoor';
const EMAILJS_TEMPLATE_ID = 'template_nzh1gkb';

let elementos = {};

/**
 * Captura y almacena las referencias a los elementos del DOM.
 * @function capturarElementos
 */
function capturarElementos() {
    elementos = {
        app: document.getElementById('app'),
        badgeCarrito: document.querySelector('.cart-badge'),
        landing: document.getElementById('landing-page'),
        mainApp: document.getElementById('main-app'),
        userWelcome: document.getElementById('user-welcome'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        logoutBtn: document.getElementById('logout-btn'),
        captchaLabel: document.getElementById('captcha-label'),
        captchaInput: document.getElementById('login-captcha'),
        galleryGrid: document.querySelector('.gallery__grid'),
        navToggle: document.getElementById('nav-toggle'),
        navMenu: document.getElementById('nav-menu'),
        navClose: document.getElementById('nav-close'),
        logoNav: document.getElementById('logo-nav'),
        navHome: document.getElementById('nav-home'),
        navProducts: document.getElementById('nav-products'),
        cartBtn: document.getElementById('cart-btn'),
        heroCta: document.getElementById('hero-cta'),
        modal: document.getElementById('product-modal'),
        modalBody: document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close'),
        modalOverlay: document.getElementById('modal-overlay'),
        catalogView: document.getElementById('catalog-view'),
        cartView: document.getElementById('cart-view'),
        cartFullList: document.getElementById('cart-full-list'),
        summarySubtotal: document.getElementById('summary-subtotal'),
        summaryTotal: document.getElementById('summary-total'),
        checkoutFinalBtn: document.getElementById('checkout-final-btn'),
        continueShopping: document.getElementById('continue-shopping'),
        sortSelect: document.getElementById('sort-select'),
    };
}

// ==========================================
// 3. AUTENTICACIÓN Y SEGURIDAD
// ==========================================

/**
 * Inicializa el sistema de autenticación comprobando la sesión local.
 * @function inicializarAuth
 */
function inicializarAuth() {
    const sesion = localStorage.getItem('usuario_sesion');
    configurarEventosAuth();

    if (sesion) {
        estado.usuario = JSON.parse(sesion);
        cambiarVista('app');
    } else {
        cambiarVista('landing');
    }
}

/**
 * Genera un desafío matemático aleatorio para el login.
 * @function generarCaptcha
 */
function generarCaptcha() {
    if (!elementos.captchaLabel) return;
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    estado.captchaEsperado = num1 + num2;
    elementos.captchaLabel.textContent = `Pregunta de seguridad: ¿Cuánto es ${num1} + ${num2}?`;
}

/**
 * Configura los escuchadores de eventos para los formularios de acceso.
 * @function configurarEventosAuth
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

    elementos.loginForm?.addEventListener('submit', manejarLogin);
    elementos.registerForm?.addEventListener('submit', manejarRegistro);
    elementos.logoutBtn?.addEventListener('click', manejarLogout);
}

/**
 * Procesa el intento de inicio de sesión.
 * @async
 * @function manejarLogin
 * @param {Event} e - Evento de formulario
 */
async function manejarLogin(e) {
    e.preventDefault();
    const username = elementos.loginForm.username.value;
    const password = elementos.loginForm.password.value;
    const captchaValue = parseInt(elementos.captchaInput.value);
    const errorMsg = document.getElementById('login-error');

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
 * Registra un nuevo usuario en el sistema.
 * @async
 * @function manejarRegistro
 * @param {Event} e - Evento de formulario
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
            document.querySelector('[data-target="login"]').click();
        }
    } catch (error) {
        console.error('Error registro:', error);
    }
}

/**
 * Cierra la sesión activa y limpia los datos locales.
 * @function manejarLogout
 */
function manejarLogout() {
    estado.usuario = null;
    localStorage.removeItem('usuario_sesion');
    if (elementos.app) elementos.app.innerHTML = '';
    cambiarVista('landing');
}

// ==========================================
// 4. GALERÍA LANDING
// ==========================================

/**
 * Carga imágenes aleatorias para la galería de la página de aterrizaje.
 * @async
 * @function cargarGaleriaAleatoria
 */
async function cargarGaleriaAleatoria() {
    if (!elementos.galleryGrid) return;
    elementos.galleryGrid.innerHTML = '<div class="gallery__loading">Cargando inspiración navideña...</div>';

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
// 5. NAVEGACIÓN Y VISTAS
// ==========================================

/**
 * Cambia entre la vista de aterrizaje y la aplicación principal.
 * @function cambiarVista
 * @param {string} vista - Nombre de la vista ('app'|'landing')
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
 * Cambia la sub-vista dentro de la aplicación principal.
 * @function cambiarVistaApp
 * @param {string} vista - Sub-vista ('catalog'|'cart')
 * @param {string|null} [destino] - ID del elemento para scroll
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
        if (destino) {
            const el = document.getElementById(destino);
            setTimeout(() => el?.scrollIntoView({ behavior: 'smooth' }), 10);
        } else {
            window.scrollTo(0, 0);
        }
    }
}

/**
 * Inyecta los eventos de navegación y clicks globales.
 * @function inyectarNavEventos
 */
function inyectarNavEventos() {
    elementos.navToggle?.addEventListener('click', () => elementos.navMenu.classList.add('show-menu'));
    elementos.navClose?.addEventListener('click', () => elementos.navMenu.classList.remove('show-menu'));
    elementos.modalClose?.addEventListener('click', cerrarModal);
    elementos.modalOverlay?.addEventListener('click', cerrarModal);

    elementos.logoNav?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog'); });
    elementos.navHome?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog'); });
    elementos.navProducts?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog', 'nuestros-platos'); });
    elementos.cartBtn?.addEventListener('click', () => cambiarVistaApp('cart'));
    elementos.heroCta?.addEventListener('click', (e) => { e.preventDefault(); cambiarVistaApp('catalog', 'nuestros-platos'); });
    elementos.continueShopping?.addEventListener('click', () => cambiarVistaApp('catalog'));
    elementos.checkoutFinalBtn?.addEventListener('click', simularCheckout);
}

// ==========================================
// 6. PRODUCTOS Y FILTROS
// ==========================================

/**
 * Inicializa el contenido del catálogo y carga los filtros.
 * @async
 * @function cargarContenidoApp
 */
async function cargarContenidoApp() {
    actualizarConfiguracion();
    try {
        await obtenerCategorias();
        await obtenerProductos('Seafood');
        window.addEventListener('scroll', manejarScroll);
        conectarFiltros();
        conectarOrdenacion();
        actualizarCarritoUI();
    } catch (error) {
        console.error('Error contenido app:', error);
    }
}

/**
 * Ajusta la configuración de carga según el tamaño de la ventana.
 * @function actualizarConfiguracion
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

/**
 * Obtiene las categorías de platos desde la API.
 * @async
 * @function obtenerCategorias
 */
async function obtenerCategorias() {
    try {
        const res = await fetch(`${URL_BASE_API}${ENDPOINT_CATEGORIAS}`);
        const datos = await res.json();
        estado.categorias = datos.categories;
    } catch (e) { console.error(e); }
}

/**
 * Obtiene los productos filtrados por una categoría específica.
 * @async
 * @function obtenerProductos
 * @param {string} categoria - Nombre de la categoría
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
            const cats = ['Seafood', 'Pasta', 'Dessert'];
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
 * Carga el siguiente segmento de productos en el catálogo.
 * @function cargarSiguienteBloque
 * @param {number} cantidad - Número de items a cargar
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
 * Renderiza un bloque de productos en el contenedor principal.
 * @function renderizarBloque
 * @param {Producto[]} lista - Lista de productos a dibujar
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

/**
 * Establece los listeners para los botones de filtrado.
 * @function conectarFiltros
 */
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

/**
 * Conecta el selector de ordenación con su lógica correspondiente.
 * @function conectarOrdenacion
 */
function conectarOrdenacion() {
    elementos.sortSelect?.addEventListener('change', (e) => ordenarProductos(e.target.value));
}

/**
 * Ordena el catálogo actual basándose en diferentes criterios.
 * @function ordenarProductos
 * @param {string} criterio - Criterio de ordenación ('price-asc'|'price-desc'|'name-az')
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
// 7. SCROLL E INFINITE LOAD
// ==========================================

/**
 * Gestiona la carga automática de productos al hacer scroll.
 * @function manejarScroll
 */
function manejarScroll() {
    if (estado.modoBoton || estado.cargando || estado.indiceActual >= estado.todosLosProductos.length) return;
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        cargarSiguienteBloque(estado.itemsPorPagina);
    }
}

/**
 * Crea e inyecta el botón "Cargar más" para versiones móviles.
 * @function gestionarBotonCargarMas
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

/**
 * Elimina el contenedor del botón "Cargar más" si existe.
 * @function eliminarBotonCargarMas
 */
function eliminarBotonCargarMas() {
    document.querySelector('.load-more-container')?.remove();
}

// ==========================================
// 8. CARRITO DE COMPRA
// ==========================================

/**
 * Añade un producto al carrito de compras.
 * @function agregarAlCarrito
 * @param {string} id - ID del producto a añadir
 */
function agregarAlCarrito(id) {
    const plato = estado.todosLosProductos.find(p => p.idMeal === id);
    if (!plato) return;
    const item = estado.carrito.find(i => i.idMeal === id);
    if (item) item.cantidad++;
    else estado.carrito.push({ ...plato, cantidad: 1, precio: parseFloat((plato.idMeal / 1000).toFixed(2)) });

    guardarCarrito();
    actualizarCarritoUI();
    if (!elementos.cartView.classList.contains('hidden')) renderizarCarrito();
}

/**
 * Persiste el estado del carrito en LocalStorage.
 * @function guardarCarrito
 */
function guardarCarrito() { localStorage.setItem('carrito', JSON.stringify(estado.carrito)); }

/**
 * Actualiza el contador visual de items en el carrito.
 * @function actualizarCarritoUI
 */
function actualizarCarritoUI() {
    if (elementos.badgeCarrito) {
        elementos.badgeCarrito.textContent = estado.carrito.reduce((acc, i) => acc + i.cantidad, 0);
    }
}

/**
 * Renderiza la lista detallada de productos en la vista de carrito.
 * @function renderizarCarrito
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

/**
 * Elimina todas las unidades de un producto específico del carrito.
 * @function eliminarDelCarrito
 * @param {string} id - ID del producto
 */
function eliminarDelCarrito(id) {
    estado.carrito = estado.carrito.filter(i => i.idMeal !== id);
    guardarCarrito(); actualizarCarritoUI(); renderizarCarrito();
}

/**
 * Incrementa o decrementa la cantidad de un item en el carrito.
 * @function cambiarCantidad
 * @param {string} id - ID del producto
 * @param {number} delta - Cambio (+1 o -1)
 */
function cambiarCantidad(id, delta) {
    const item = estado.carrito.find(i => i.idMeal === id);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad <= 0) eliminarDelCarrito(id);
        else { guardarCarrito(); actualizarCarritoUI(); renderizarCarrito(); }
    }
}

/**
 * Simula el proceso de checkout y envía una confirmación vía EmailJS.
 * @async
 * @function simularCheckout
 */
async function simularCheckout() {
    if (estado.carrito.length === 0) return;
    const btn = elementos.checkoutFinalBtn;
    btn.disabled = true; btn.textContent = 'Procesando pedido... ❄️';

    const total = estado.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const orderId = "SN-" + Math.floor(Math.random() * 100000);

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
        estado.carrito = [];
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
// 9. DETALLES PLATO (Modal)
// ==========================================

/**
 * Abre el modal de detalles para un plato específico cargando datos de la API.
 * @async
 * @function abrirModal
 * @param {string} id - ID del plato a mostrar
 */
async function abrirModal(id) {
    if (!elementos.modal) return;
    elementos.modalBody.innerHTML = '<div class="skeleton" style="height:300px"></div>';
    elementos.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    try {
        const res = await fetch(`${URL_BASE_API}/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];

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

/**
 * Cierra el modal de detalles del producto.
 * @function cerrarModal
 */
function cerrarModal() { elementos.modal?.classList.add('hidden'); document.body.style.overflow = 'auto'; }

// ==========================================
// 10. INICIO
// ==========================================

/**
 * Orquestador principal de inicio de la aplicación.
 * @async
 * @function iniciar
 */
async function iniciar() {
    capturarElementos();
    actualizarConfiguracion();

    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

    inicializarAuth();
    inyectarNavEventos();

    window.addEventListener('resize', actualizarConfiguracion);
}

document.addEventListener('DOMContentLoaded', iniciar);

// Exportación para interactividad global (onclick en HTML)
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.cerrarModal = cerrarModal;
window.cambiarVistaApp = cambiarVistaApp;

// Exportación para tests (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        estado,
        agregarAlCarrito,
        eliminarDelCarrito,
        cambiarCantidad
    };
}
