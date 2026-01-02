/**
 * Tienda Online "Sabor Navideño" - Mi Código Core
 * 
 * ¡Hola! Este es el archivo donde he programado toda la magia de la tienda.
 * He organizado todo por secciones para que sea fácil de leer y entender.
 * 
 * NOTA PARA EL FUTURO: Si quieres cambiar colores o estilos, mejor ve al CSS.
 * Aquí solo tocamos la "lógica": qué pasa cuando haces click, cómo se traen los datos, etc.
 */

// ==========================================
// 1. CONFIGURACIÓN Y APIS
// ==========================================

// URLs de la API de comida (TheMealDB) que usamos para el catálogo
const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';
const ENDPOINT_RANDOM = '/random.php';

// URL de nuestro servidor local (json-server) para los usuarios
const URL_JSON_SERVER = 'http://localhost:3000';

/**
 * CONFIGURACIÓN DE EMAILJS
 * Aquí es donde conectamos el botón de compra con tu correo real.
 * Si en el futuro cambias de cuenta de EmailJS, solo tienes que actualizar estos 3 IDs.
 */
const EMAILJS_PUBLIC_KEY = 'IAQlDtLB8I4gvNOSC';
const EMAILJS_SERVICE_ID = 'service_h6gqoor';
const EMAILJS_TEMPLATE_ID = 'template_nzh1gkb';

// ==========================================
// 2. GESTIÓN DEL ESTADO (La "memoria" de la web)
// ==========================================

const estado = {
    usuario: null,           // Guardamos quién ha entrado (nombre, email, etc.)
    categorias: [],          // Lista de categorías que nos da la API (Seafood, Dessert...)
    todosLosProductos: [],   // Todos los platos de la categoría seleccionada
    productosVisibles: [],   // Los que se están viendo ahora mismo en pantalla
    carrito: JSON.parse(localStorage.getItem('carrito')) || [], // El carrito se guarda aunque cierres la pestaña
    captchaEsperado: 0,      // La respuesta correcta de la suma del login
    categoriaActual: 'all',  // Qué estamos filtrando ahora
    cargando: false,         // Para evitar que se pida mil veces lo mismo a la vez
    indiceActual: 0,         // Para saber por qué producto vamos cargando (paginación)
    itemsIniciales: 6,       // Cuántos platos salen al principio
    itemsPorPagina: 3,       // Cuántos más se cargan al hacer scroll o dar al botón
    modoBoton: false,        // En móvil usamos botón "Cargar más", en PC scroll infinito
};

// Aquí guardaremos las referencias a las etiquetas HTML para no tener que buscarlas todo el rato
let elementos = {};

/**
 * Esta función es súper importante: captura todos los IDs del HTML 
 * para que podamos usarlos en JavaScript fácilmente.
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
        galleryGrid: document.querySelector('.gallery__grid'),
        navToggle: document.getElementById('nav-toggle'),
        navMenu: document.getElementById('nav-menu'),
        navClose: document.getElementById('nav-close'),
        modal: document.getElementById('product-modal'),
        modalBody: document.getElementById('modal-body'),
        modalClose: document.getElementById('modal-close'),
        modalOverlay: document.getElementById('modal-overlay'),

        // Secciones principales de la App
        catalogView: document.getElementById('catalog-view'),
        cartView: document.getElementById('cart-view'),

        // Botones y enlaces de navegación
        logoNav: document.getElementById('logo-nav'),
        navHome: document.getElementById('nav-home'),
        navProducts: document.getElementById('nav-products'),
        cartBtn: document.getElementById('cart-btn'),
        heroCta: document.getElementById('hero-cta'),
        captchaLabel: document.getElementById('captcha-label'),
        captchaInput: document.getElementById('login-captcha'),

        // Cosas de la vista del carrito
        cartFullList: document.getElementById('cart-full-list'),
        summarySubtotal: document.getElementById('summary-subtotal'),
        summaryTotal: document.getElementById('summary-total'),
        checkoutFinalBtn: document.getElementById('checkout-final-btn'),
        continueShopping: document.getElementById('continue-shopping'),
    };
}

// ==========================================
// 3. AUTENTICACIÓN (Login, Registro y Seguridad)
// ==========================================

/**
 * Se ejecuta al abrir la web para ver si el usuario ya estaba logueado.
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
 * Genera una suma aleatoria para evitar que entren bots (el Captcha).
 */
function generarCaptcha() {
    if (!elementos.captchaLabel) return;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    estado.captchaEsperado = num1 + num2;

    elementos.captchaLabel.textContent = `Pregunta de seguridad: ¿Cuánto es ${num1} + ${num2}?`;
}

/**
 * Maneja el envío del formulario de entrada.
 */
async function manejarLogin(e) {
    e.preventDefault();
    const username = elementos.loginForm.username.value;
    const password = elementos.loginForm.password.value;
    const captchaValue = parseInt(elementos.captchaInput.value);
    const errorMsg = document.getElementById('login-error');

    // Primero miramos si el captcha es correcto
    if (captchaValue !== estado.captchaEsperado) {
        errorMsg.textContent = '¡Ups! La suma no es correcta. Inténtalo de nuevo.';
        errorMsg.classList.remove('hidden');
        generarCaptcha();
        elementos.captchaInput.value = '';
        return;
    }

    try {
        // Buscamos al usuario en nuestro "servidor" (db.json)
        const res = await fetch(`${URL_JSON_SERVER}/users?username=${username}&password=${password}`);
        const usuarios = await res.json();

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            estado.usuario = usuario;
            localStorage.setItem('usuario_sesion', JSON.stringify(usuario));
            errorMsg.classList.add('hidden');
            cambiarVista('app');
            actualizarCarritoUI();
        } else {
            errorMsg.textContent = 'Usuario o contraseña incorrectos.';
            errorMsg.classList.remove('hidden');
            generarCaptcha();
        }
    } catch (error) {
        console.error('Error en login:', error);
    }
}

// ==========================================
// 4. GALERÍA ALEATORIA (Landing Page)
// ==========================================

/**
 * Trae 10 platos al azar para la galería bonita de la portada.
 */
async function cargarGaleriaAleatoria() {
    if (!elementos.galleryGrid) return;
    elementos.galleryGrid.innerHTML = '<div class="gallery__loading">Cargando inspiración...</div>';

    // Pedimos 10 fotos a la vez para que carguen rápido
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
        console.error('Error en galería:', error);
    }
}

// ==========================================
// 5. NAVEGACIÓN Y VISTAS
// ==========================================

/**
 * Cambia entre la Landing (visitantes) y la App (usuarios registrados).
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
 * Cambia entre Catálogo y Carrito dentro de la App Principal.
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

        // Si nos pasan un destino (ej: 'nuestros-platos'), hacemos scroll hasta allí
        if (destino) {
            const el = document.getElementById(destino);
            setTimeout(() => el?.scrollIntoView({ behavior: 'smooth' }), 10);
        } else {
            window.scrollTo(0, 0);
        }
    }
}

// ==========================================
// 6. CATÁLOGO Y PRODUCTOS (La chicha de la tienda)
// ==========================================

/**
 * Carga los platos según la categoría elegida (Pescados, Postres, etc.)
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
            // Si elegimos "Todos", mezclamos un poco de cada cosa
            const categoriasTienda = ['Seafood', 'Pasta', 'Dessert'];
            const promesas = categoriasTienda.map(cat =>
                fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${cat}`).then(r => r.json())
            );
            const resultados = await Promise.all(promesas);
            resultados.forEach(data => {
                if (data.meals) listaFinal = [...listaFinal, ...data.meals];
            });
        } else {
            const res = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
            const datos = await res.json();
            listaFinal = datos.meals || [];
        }

        estado.todosLosProductos = listaFinal;
        cargarSiguienteBloque(estado.itemsIniciales);
    } catch (error) {
        console.error('Error al traer productos:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Función para ir cargando los platos poco a poco (paginación).
 */
function cargarSiguienteBloque(cantidad) {
    if (estado.indiceActual >= estado.todosLosProductos.length) {
        eliminarBotonCargarMas();
        return;
    }

    const siguienteIndice = estado.indiceActual + cantidad;
    const nuevosProductos = estado.todosLosProductos.slice(estado.indiceActual, siguienteIndice);

    estado.productosVisibles = [...estado.productosVisibles, ...nuevosProductos];
    estado.indiceActual = siguienteIndice;

    renderizarBloque(nuevosProductos);

    // En móvil mostramos el botón manualmente
    if (estado.modoBoton) gestionarBotonCargarMas();
}

/**
 * Dibuja las tarjetas (cards) de los platos en la pantalla.
 */
function renderizarBloque(listaProductos) {
    if (!elementos.app) return;

    const htmlBloque = listaProductos.map(producto => `
        <article class="card fade-in" onclick="abrirModal('${producto.idMeal}')">
            <img src="${producto.strMealThumb}" alt="${producto.strMeal}" class="card__image">
            <div class="card__data">
                <h3 class="card__title">${producto.strMeal}</h3>
                <span class="card__price">$${(producto.idMeal / 1000).toFixed(2)}</span>
                <button class="btn btn--primary" onclick="event.stopPropagation(); agregarAlCarrito('${producto.idMeal}')">Añadir</button>
            </div>
        </article>
    `).join('');

    elementos.app.insertAdjacentHTML('beforeend', htmlBloque);
}

// ==========================================
// 7. CARRITO DE COMPRA
// ==========================================

/**
 * Añade un plato al carrito o sube su cantidad si ya estaba.
 */
function agregarAlCarrito(idProducto) {
    const plato = estado.todosLosProductos.find(p => p.idMeal === idProducto);
    if (!plato) return;

    const itemExistente = estado.carrito.find(item => item.idMeal === idProducto);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        estado.carrito.push({
            ...plato,
            cantidad: 1,
            precio: parseFloat((plato.idMeal / 1000).toFixed(2))
        });
    }

    guardarCarrito();
    actualizarCarritoUI();
    if (elementos.cartView && !elementos.cartView.classList.contains('hidden')) renderizarCarrito();
}

/**
 * Guarda el carrito en el ordenador del usuario para que no se borre al recargar.
 */
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(estado.carrito));
}

function actualizarCarritoUI() {
    if (elementos.badgeCarrito) {
        const totalItems = estado.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        elementos.badgeCarrito.textContent = totalItems;
    }
}

// ==========================================
// 8. CHECKOUT Y EMAIL (Finalizar Compra)
// ==========================================

/**
 * El botón final de compra. Usa EmailJS para mandar el ticket.
 */
async function simularCheckout() {
    if (estado.carrito.length === 0) return;

    const btn = elementos.checkoutFinalBtn;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Procesando pedido... ❄️';

    const total = estado.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const orderId = "SN-" + Math.floor(Math.random() * 100000);

    // Formateamos los productos para la tabla del email
    const itemsParaEmail = estado.carrito.map(item => ({
        image_url: item.strMealThumb,
        name: item.strMeal,
        units: item.cantidad,
        price: item.precio.toFixed(2)
    }));

    const templateParams = {
        order_id: orderId,
        email: estado.usuario.email,
        orders: itemsParaEmail,
        cost: {
            shipping: "0.00",
            tax: "0.00",
            total: total.toFixed(2)
        }
    };

    try {
        // Solo mandamos el mail si las llaves están puestas
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        }

        alert('¡Gracias por tu pedido! Te hemos enviado un correo de confirmación con el diseño navideño. 🎁🍗');

        // Vaciamos todo tras el éxito
        estado.carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        cambiarVistaApp('catalog');

    } catch (error) {
        console.error('Error EmailJS:', error);
        alert('Pedido registrado, pero no se pudo enviar el correo.');

        estado.carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        cambiarVistaApp('catalog');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// ==========================================
// 9. MODAL DE DETALLES (Ficha del plato)
// ==========================================

/**
 * Abre la ventanita con ingredientes y preparación.
 */
async function abrirModal(id) {
    if (!elementos.modal || !elementos.modalBody) return;

    elementos.modalBody.innerHTML = '<div class="skeleton" style="height: 300px; width: 100%;"></div>';
    elementos.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    try {
        const res = await fetch(`${URL_BASE_API}/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];

        // Procesamos ingredientes (la API nos da hasta 20 posibles huecos)
        const ingredientes = [];
        for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            const med = meal[`strMeasure${i}`];
            if (ing && ing.trim()) ingredientes.push(`${med} ${ing}`);
        }

        elementos.modalBody.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="modal__img">
            <span class="modal__category">${meal.strCategory} | ${meal.strArea}</span>
            <h2 class="modal__title">${meal.strMeal}</h2>
            <h3 class="modal__subtitle">Ingredientes</h3>
            <div class="modal__ingredients">
                ${ingredientes.map(i => `<div class="modal__ingredient">${i}</div>`).join('')}
            </div>
            <h3 class="modal__subtitle">Instrucciones</h3>
            <p class="modal__instructions">${meal.strInstructions}</p>
            <div style="margin-top: 2rem; display: flex; justify-content: center;">
                <button class="btn btn--primary" onclick="agregarAlCarrito('${meal.idMeal}'); cerrarModal();">
                    Añadir al Carrito - $${(meal.idMeal / 1000).toFixed(2)}
                </button>
            </div>
        `;
    } catch (error) {
        elementos.modalBody.innerHTML = '<p>Error al cargar el plato.</p>';
    }
}

function cerrarModal() {
    if (elementos.modal) {
        elementos.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// ==========================================
// 10. INICIO DE TODO (DOMContentLoaded)
// ==========================================

/**
 * El punto de partida de toda la web.
 */
async function iniciar() {
    capturarElementos();
    actualizarConfiguracion(); // Mira si estamos en móvil o PC

    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

    inicializarAuth(); // Mira si hay sesión
    inyectarNavEventos(); // Activa botones de menú, carritos, etc.

    // Cargamos carrito guardado
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        estado.carrito = JSON.parse(carritoGuardado);
        actualizarCarritoUI();
    }

    // Recalcular si el usuario gira el móvil o cambia tamaño de ventana
    window.addEventListener('resize', actualizarConfiguracion);
}

// ¡Arrancamos!
document.addEventListener('DOMContentLoaded', iniciar);

/**
 * FUNCIONES GLOBALES PARA EL HTML
 * (Necesarias para que los botones con 'onclick' funcionen)
 */
window.cambiarCantidad = cambiarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.cerrarModal = cerrarModal;
window.cambiarVistaApp = cambiarVistaApp;
