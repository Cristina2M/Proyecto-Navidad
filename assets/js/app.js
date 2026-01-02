/**
 * Tienda Online - Core JS
 * Rama: feature/pagination
 * 
 * ¡Hola! Aquí está toda la lógica de nuestra tienda.
 * He añadido comentarios para que sepamos qué hace cada parte
 * y podamos modificarlo fácilmente en el futuro.
 */

// --- Configuración ---
const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';
const ENDPOINT_RANDOM = '/random.php';
const URL_JSON_SERVER = 'http://localhost:3000'; // Nuestro backend simulado

// --- Gestión del Estado ---
const estado = {
    usuario: null, // Si es null, mostramos Landing. Si tiene datos, mostramos App.
    categorias: [],
    todosLosProductos: [],
    productosVisibles: [],
    carrito: JSON.parse(localStorage.getItem('carrito')) || [],
    captchaEsperado: 0,
    categoriaActual: 'all',
    cargando: false,
    indiceActual: 0,
    itemsIniciales: 6,
    itemsPorPagina: 3,
    modoBoton: false,
};

// --- Elementos del DOM ---
let elementos = {};

/**
 * Captura los elementos del DOM. Se llama al inicio y cuando sea necesario
 * asegurar que los elementos están disponibles.
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

        // Vistas principales
        catalogView: document.getElementById('catalog-view'),
        cartView: document.getElementById('cart-view'),

        // Nav e Interacciones
        logoNav: document.getElementById('logo-nav'),
        navHome: document.getElementById('nav-home'),
        navProducts: document.getElementById('nav-products'),
        cartBtn: document.getElementById('cart-btn'),
        heroCta: document.getElementById('hero-cta'),
        captchaLabel: document.getElementById('captcha-label'),
        captchaInput: document.getElementById('login-captcha'),

        // Contenedores del Carrito View
        cartFullList: document.getElementById('cart-full-list'),
        summarySubtotal: document.getElementById('summary-subtotal'),
        summaryTotal: document.getElementById('summary-total'),
        checkoutFinalBtn: document.getElementById('checkout-final-btn'),
        continueShopping: document.getElementById('continue-shopping'),
    };

    // Debug para saber qué está fallando
    if (!elementos.app) console.error("CRÍTICO: No se encuentra el contenedor #app");
    if (!elementos.mainApp) console.error("CRÍTICO: No se encuentra #main-app");
}

// --- Gestión de Autenticación ---

/**
 * Inicializa la autenticación revisando si había una sesión guardada.
 */
function inicializarAuth() {
    const sesion = localStorage.getItem('usuario_sesion');
    configurarEventosAuth(); // Los formularios deben funcionar siempre

    if (sesion) {
        estado.usuario = JSON.parse(sesion);
        cambiarVista('app');
    } else {
        cambiarVista('landing');
    }
}

/**
 * Carga 6 fotos aleatorias de la API para la galería de la Landing
 */
async function cargarGaleriaAleatoria() {
    if (!elementos.galleryGrid) return;

    elementos.galleryGrid.innerHTML = '<div class="gallery__loading">Cargando inspiración...</div>';

    // Necesitamos 10 imágenes. Las pedimos todas a la vez para evitar saltos.
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
        console.error('Error cargando imágenes de la galería:', error);
        elementos.galleryGrid.innerHTML = '<p>Lo sentimos, no pudimos cargar la galería.</p>';
    }
}
// --- Utilidades Auth ---

function generarCaptcha() {
    if (!elementos.captchaLabel) return;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    estado.captchaEsperado = num1 + num2;

    elementos.captchaLabel.textContent = `Pregunta de seguridad: ¿Cuánto es ${num1} + ${num2}?`;
}

/**
 * Controla qué parte de la web se muestra (Landing o App Principal)
 */
function cambiarVista(vista) {
    // Re-capturamos para asegurar que no hay referencias perdidas
    capturarElementos();

    if (vista === 'app') {
        if (elementos.landing) elementos.landing.classList.add('hidden');
        if (elementos.mainApp) elementos.mainApp.classList.remove('hidden');

        // Pequeño retardo para asegurar que el DOM se ha actualizado
        setTimeout(() => {
            capturarElementos(); // Re-capturamos tras el cambio de clase
            if (estado.usuario && elementos.userWelcome) {
                elementos.userWelcome.innerHTML = `Hola, ${estado.usuario.nombre || estado.usuario.username}`;
            }
            console.log("Entrando a la App: Cargando contenido...");
            cargarContenidoApp();
        }, 10);
    } else {
        if (elementos.landing) {
            elementos.landing.classList.remove('hidden');
            generarCaptcha();
            cargarGaleriaAleatoria(); // Restablecemos la galería
        }
        if (elementos.mainApp) {
            elementos.mainApp.classList.add('hidden');
        }
    }
}

/**
 * Configura los clicks de los formularios de login/registro
 */
function configurarEventosAuth() {
    // Cambio entre pestañas de Login y Registro
    const tabs = document.querySelectorAll('.auth__tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.target;
            if (target === 'login') {
                elementos.loginForm.classList.remove('hidden');
                elementos.registerForm.classList.add('hidden');
            } else {
                elementos.loginForm.classList.add('hidden');
                elementos.registerForm.classList.remove('hidden');
            }
        });
    });

    // Envío del Login
    elementos.loginForm.addEventListener('submit', manejarLogin);
    // Envío del Registro
    elementos.registerForm.addEventListener('submit', manejarRegistro);
    // Botón de Logout
    elementos.logoutBtn.addEventListener('click', manejarLogout);
}

async function manejarLogin(e) {
    e.preventDefault();
    const username = elementos.loginForm.username.value;
    const password = elementos.loginForm.password.value;
    const captchaValue = parseInt(elementos.captchaInput.value);
    const errorMsg = document.getElementById('login-error');

    // Validación básica de captcha
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
            const usuario = usuarios[0];
            estado.usuario = usuario;
            localStorage.setItem('usuario_sesion', JSON.stringify(usuario));
            errorMsg.classList.add('hidden');
            cambiarVista('app');
            actualizarCarritoUI(); // Actualizar badge y carrito
        } else {
            errorMsg.textContent = 'Usuario o contraseña incorrectos.';
            errorMsg.classList.remove('hidden');
            generarCaptcha(); // Cambiar pregunta si fallan credenciales
        }
    } catch (error) {
        console.error('Error en login:', error);
    }
}

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
        // Primero comprobamos si el usuario ya existe
        const checkRes = await fetch(`${URL_JSON_SERVER}/users?username=${nuevoUsuario.username}`);
        const existe = await checkRes.json();

        if (existe.length > 0) {
            alert('El nombre de usuario ya está cogido.');
            return;
        }

        const res = await fetch(`${URL_JSON_SERVER}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        if (res.ok) {
            const usuarioCreado = await res.json();
            alert('¡Cuenta creada con éxito! Ya puedes entrar.');
            // Cambiamos a la pestaña de login
            document.querySelector('[data-target="login"]').click();
        }
    } catch (error) {
        console.error('Error en registro:', error);
    }
}

function manejarLogout() {
    estado.usuario = null;
    localStorage.removeItem('usuario_sesion');
    // Limpiamos la app para que al volver a entrar esté fresca
    elementos.app.innerHTML = '';
    cambiarVista('landing');
}

// --- Funciones de Configuración Responsive ---

/**
 * Ajusta cuántos productos cargamos según el tamaño de la pantalla (PC, Tablet o Móvil)
 */
function actualizarConfiguracion() {
    const ancho = window.innerWidth;

    if (ancho >= 968) {
        estado.itemsIniciales = 6;
        estado.itemsPorPagina = 3;
        estado.modoBoton = false;
    } else if (ancho >= 768) {
        estado.itemsIniciales = 4;
        estado.itemsPorPagina = 2;
        estado.modoBoton = false;
    } else {
        estado.itemsIniciales = 3;
        estado.itemsPorPagina = 3;
        estado.modoBoton = true;
    }
}

async function iniciar() {
    // 1. Capturamos elementos nada más empezar
    capturarElementos();

    // 2. Configuramos dimensiones iniciales (Mobile vs Pc)
    actualizarConfiguracion();

    // 3. Iniciamos Auth (esto decidirá si vemos Landing o App)
    inicializarAuth();

    // 4. Conectamos la navegación
    inyectarNavEventos();

    // 4. Cargamos el carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        estado.carrito = JSON.parse(carritoGuardado);
        actualizarCarritoUI();
    }

    // Si cambian el tamaño de la ventana, recalculamos
    window.addEventListener('resize', actualizarConfiguracion);
}

/**
 * Activa los eventos del menú responsivo
 */
function inyectarNavEventos() {
    if (elementos.navToggle && elementos.navMenu) {
        elementos.navToggle.addEventListener('click', () => {
            elementos.navMenu.classList.add('show-menu');
        });
    }

    if (elementos.navClose && elementos.navMenu) {
        elementos.navClose.addEventListener('click', () => {
            elementos.navMenu.classList.remove('show-menu');
        });
    }

    // Eventos del Modal
    if (elementos.modalClose) {
        elementos.modalClose.addEventListener('click', cerrarModal);
    }
    if (elementos.modalOverlay) {
        elementos.modalOverlay.addEventListener('click', cerrarModal);
    }

    // Navegación entre Vistas (Catalog vs Cart)
    if (elementos.logoNav) elementos.logoNav.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVistaApp('catalog');
    });
    if (elementos.navHome) elementos.navHome.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVistaApp('catalog');
    });
    if (elementos.navProducts) elementos.navProducts.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVistaApp('catalog', 'nuestros-platos');
    });
    if (elementos.cartBtn) elementos.cartBtn.addEventListener('click', () => {
        cambiarVistaApp('cart');
    });
    if (elementos.heroCta) elementos.heroCta.addEventListener('click', (e) => {
        e.preventDefault();
        cambiarVistaApp('catalog', 'nuestros-platos');
    });
    if (elementos.continueShopping) elementos.continueShopping.addEventListener('click', () => {
        cambiarVistaApp('catalog');
    });
    if (elementos.checkoutFinalBtn) elementos.checkoutFinalBtn.addEventListener('click', simularCheckout);
}

/**
 * Alterna entre la vista de catálogo y la vista de carrito completo
 */
function cambiarVistaApp(vista, destino = null) {
    if (vista === 'cart') {
        if (elementos.catalogView) elementos.catalogView.classList.add('hidden');
        if (elementos.cartView) elementos.cartView.classList.remove('hidden');

        // Marcamos el link activo
        if (elementos.navHome) elementos.navHome.classList.remove('active-link');

        renderizarCarrito();
        window.scrollTo(0, 0);
    } else {
        if (elementos.catalogView) elementos.catalogView.classList.remove('hidden');
        if (elementos.cartView) elementos.cartView.classList.add('hidden');

        if (elementos.navHome) elementos.navHome.classList.add('active-link');

        if (destino) {
            const el = document.getElementById(destino);
            if (el) {
                // Pequeño retardo para asegurar que la vista es visible antes de scrollear
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 10);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }

    // Cerramos menú móvil por si acaso
    if (elementos.navMenu) elementos.navMenu.classList.remove('show-menu');
}

/**
 * Carga todo lo necesario cuando el usuario entra a la app
 */
async function cargarContenidoApp() {
    actualizarConfiguracion();
    try {
        await obtenerCategorias();
        await obtenerProductos('Seafood');

        // Pequeño retardo extra para asegurar renderizado tras transición
        setTimeout(() => {
            if (estado.productosVisibles.length > 0) {
                console.log("Forzando renderizado de seguridad...");
                renderizarBloque(estado.productosVisibles);
            }
        }, 100);

        window.addEventListener('scroll', manejarScroll);
        // ¡Importante! Conectamos los filtros y ordenación ahora que la app es visible
        conectarFiltros();
        conectarOrdenacion();
        actualizarCarritoUI(); // Aseguramos que el badge del carrito esté actualizado
    } catch (error) {
        console.error('Error cargando contenido:', error);
    }
}

/**
 * Agrega eventos a los botones de categoría
 */
function conectarFiltros() {
    const botones = document.querySelectorAll('.filter-btn');
    botones.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI: Cambiamos clase activa
            botones.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Lógica: Cargamos nueva categoría
            const cat = btn.dataset.category;
            estado.categoriaActual = cat;
            obtenerProductos(cat);
        });
    });
}

/**
 * Conecta el selector de ordenación
 */
function conectarOrdenacion() {
    const selector = document.getElementById('sort-select');
    if (selector) {
        selector.addEventListener('change', (e) => {
            ordenarProductos(e.target.value);
        });
    }
}

/**
 * Ordena la lista actual de productos en memoria
 */
function ordenarProductos(criterio) {
    if (!estado.todosLosProductos || estado.todosLosProductos.length === 0) return;

    console.log(`Ordenando por: ${criterio}`);

    switch (criterio) {
        case 'price-asc':
            // Usamos idMeal como precio simulado
            estado.todosLosProductos.sort((a, b) => a.idMeal - b.idMeal);
            break;
        case 'price-desc':
            estado.todosLosProductos.sort((a, b) => b.idMeal - a.idMeal);
            break;
        case 'name-az':
            estado.todosLosProductos.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
            break;
        default:
            // Si es default, no hacemos nada especial (o barajamos)
            break;
    }

    // Reiniciamos la vista con el nuevo orden
    estado.indiceActual = 0;
    if (elementos.app) elementos.app.innerHTML = '';
    cargarSiguienteBloque(estado.itemsIniciales);
}

/**
 * Obtener Categorías de la API
 */
async function obtenerCategorias() {
    estado.cargando = true;
    try {
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_CATEGORIAS}`);
        const datos = await respuesta.json();
        estado.categorias = datos.categories;
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Obtener Productos por Categoría
 * Si es 'all', traemos varias categorías representativas para llenar el catálogo
 */
async function obtenerProductos(categoria) {
    console.log(`Petición API: Buscando productos de ${categoria}...`);
    estado.cargando = true;

    estado.indiceActual = 0;
    estado.todosLosProductos = [];
    estado.productosVisibles = [];

    capturarElementos();
    if (elementos.app) {
        elementos.app.innerHTML = '';
    }

    eliminarBotonCargarMas();

    try {
        let listaFinal = [];

        if (categoria === 'all') {
            // Traemos varias categorías en paralelo para "Todos"
            const categoriasTienda = ['Seafood', 'Pasta', 'Dessert'];
            const promesas = categoriasTienda.map(cat =>
                fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${cat}`).then(r => r.json())
            );

            const resultados = await Promise.all(promesas);
            resultados.forEach(data => {
                if (data.meals) listaFinal = [...listaFinal, ...data.meals];
            });
        } else {
            // Categoría única
            const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
            const datos = await respuesta.json();
            listaFinal = datos.meals || [];
        }

        estado.todosLosProductos = listaFinal;

        // Aplicar ordenación actual si existe
        if (elementos.sortSelect && elementos.sortSelect.value !== 'default') {
            ordenarProductos(elementos.sortSelect.value);
        } else {
            cargarSiguienteBloque(estado.itemsIniciales);
        }

    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        estado.cargando = false;
    }
}

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

    if (estado.modoBoton) {
        gestionarBotonCargarMas();
    }
}

function manejarScroll() {
    if (estado.modoBoton) return;
    if (estado.cargando || estado.indiceActual >= estado.todosLosProductos.length) return;

    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
        cargarSiguienteBloque(estado.itemsPorPagina);
    }
}

function gestionarBotonCargarMas() {
    eliminarBotonCargarMas();
    if (estado.indiceActual < estado.todosLosProductos.length) {
        const botonTemplate = `
            <div class="load-more-container" style="width: 100%; display: flex; justify-content: center; margin-top: 2rem;">
                <button id="btn-load-more" class="btn btn--outline">Cargar más productos</button>
            </div>
        `;
        elementos.app.insertAdjacentHTML('afterend', botonTemplate);
        document.getElementById('btn-load-more').addEventListener('click', () => {
            cargarSiguienteBloque(estado.itemsPorPagina);
        });
    }
}

function eliminarBotonCargarMas() {
    const botonExistente = document.querySelector('.load-more-container');
    if (botonExistente) botonExistente.remove();
}

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

// --- Carrito de Compra ---

function agregarAlCarrito(idProducto) {
    const plato = estado.todosLosProductos.find(p => p.idMeal === idProducto);
    if (!plato) return;

    // Buscamos si ya está en el carrito
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

    // Si estamos en la vista de carrito, refrescamos
    if (elementos.cartView && !elementos.cartView.classList.contains('hidden')) {
        renderizarCarrito();
    }
}

function eliminarDelCarrito(idProducto) {
    estado.carrito = estado.carrito.filter(item => item.idMeal !== idProducto);
    guardarCarrito();
    actualizarCarritoUI();
    renderizarCarrito();
}

function cambiarCantidad(idProducto, delta) {
    const item = estado.carrito.find(item => item.idMeal === idProducto);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
        eliminarDelCarrito(idProducto);
    } else {
        guardarCarrito();
        actualizarCarritoUI();
        renderizarCarrito();
    }
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(estado.carrito));
}

function actualizarCarritoUI() {
    if (elementos.badgeCarrito) {
        const totalItems = estado.carrito.reduce((acc, item) => acc + item.cantidad, 0);
        elementos.badgeCarrito.textContent = totalItems;
    }
}

function renderizarCarrito() {
    if (!elementos.cartFullList) return;

    if (estado.carrito.length === 0) {
        elementos.cartFullList.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-flatbed cart-empty__icon"></i>
                <p>Tu carrito está vacío. ¡Vuelve al catálogo para buscar algo rico!</p>
                <button class="btn btn--primary" style="margin-top: 1rem;" onclick="cambiarVistaApp('catalog')">Ir a la Tienda</button>
            </div>
        `;
        elementos.summarySubtotal.textContent = '$0.00';
        elementos.summaryTotal.textContent = '$0.00';
        return;
    }

    let total = 0;
    elementos.cartFullList.innerHTML = estado.carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        return `
            <div class="cart-item fade-in">
                <img src="${item.strMealThumb}" alt="${item.strMeal}" class="cart-item__img">
                <div class="cart-item__info">
                    <h3 class="cart-item__title">${item.strMeal}</h3>
                    <span class="cart-item__category">Plato Tradicional</span>
                </div>
                <div class="cart-item__price-box">
                    <span class="cart-item__price">$${item.precio.toFixed(2)}</span>
                    <div class="cart-item__qty-box">
                        <button class="cart-item__btn" onclick="cambiarCantidad('${item.idMeal}', -1)">-</button>
                        <span class="cart-item__qty">${item.cantidad}</span>
                        <button class="cart-item__btn" onclick="cambiarCantidad('${item.idMeal}', 1)">+</button>
                    </div>
                </div>
                <i class="fa-solid fa-trash-can cart-item__del" onclick="eliminarDelCarrito('${item.idMeal}')"></i>
            </div>
        `;
    }).join('');

    elementos.summarySubtotal.textContent = `$${total.toFixed(2)}`;
    elementos.summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function simularCheckout() {
    if (estado.carrito.length === 0) return;

    alert('¡Gracias por tu pedido! La magia de la cocina navideña está en camino. 🎁🍗');

    estado.carrito = [];
    guardarCarrito();
    actualizarCarritoUI();
    cambiarVistaApp('catalog');
}

// --- Modal de Detalles ---

async function abrirModal(id) {
    console.log(`Abriendo detalles del plato: ${id}`);
    if (!elementos.modal || !elementos.modalBody) return;

    // Mostramos modal con loading
    elementos.modalBody.innerHTML = '<div class="skeleton" style="height: 300px; width: 100%;"></div>';
    elementos.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Bloquear scroll fondo

    try {
        const res = await fetch(`${URL_BASE_API}/lookup.php?i=${id}`);
        const data = await res.json();
        const meal = data.meals[0];

        renderizarDetalle(meal);
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        elementos.modalBody.innerHTML = '<p>Lo sentimos, no hemos podido cargar los detalles.</p>';
    }
}

function renderizarDetalle(meal) {
    // Extraer ingredientes (la API los da por separado del 1 al 20)
    const ingredientes = [];
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const med = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
            ingredientes.push(`${med} ${ing}`);
        }
    }

    elementos.modalBody.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="modal__img">
        <span class="modal__category">${meal.strCategory} | ${meal.strArea}</span>
        <h2 class="modal__title">${meal.strMeal}</h2>
        
        <h3 class="modal__subtitle">Ingredientes</h3>
        <div class="modal__ingredients">
            ${ingredientes.map(i => `<div class="modal__ingredient">${i}</div>`).join('')}
        </div>

        <h3 class="modal__subtitle">Instrucciones de Preparación</h3>
        <p class="modal__instructions">${meal.strInstructions}</p>
        
        <div style="margin-top: 2rem; display: flex; justify-content: center;">
            <button class="btn btn--primary" onclick="agregarAlCarrito('${meal.idMeal}'); cerrarModal();">
                Añadir al Carrito - $${(meal.idMeal / 1000).toFixed(2)}
            </button>
        </div>
    `;
}

function cerrarModal() {
    if (elementos.modal) {
        elementos.modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', iniciar);

// Exportar para que podamos probar en la consola si queremos
window.estadoApp = estado;
window.agregarAlCarrito = agregarAlCarrito; // Global para el onclick del render
