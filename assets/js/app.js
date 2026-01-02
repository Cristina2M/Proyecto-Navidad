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
    carrito: [],
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
        cargarGaleriaAleatoria();
    }
}

/**
 * Carga 6 fotos aleatorias de la API para la galería de la Landing
 */
async function cargarGaleriaAleatoria() {
    if (!elementos.galleryGrid) return;

    elementos.galleryGrid.innerHTML = '';

    // Necesitamos 6 imágenes
    for (let i = 1; i <= 6; i++) {
        try {
            const res = await fetch(`${URL_BASE_API}${ENDPOINT_RANDOM}`);
            const data = await res.json();
            const meal = data.meals[0];

            const item = document.createElement('div');
            item.className = `gallery__item gallery__item--${i} fade-in`;
            item.innerHTML = `<img src="${meal.strMealThumb}" alt="${meal.strMeal}">`;
            elementos.galleryGrid.appendChild(item);
        } catch (error) {
            console.error('Error cargando imagen aleatoria:', error);
        }
    }
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
        if (elementos.landing) elementos.landing.classList.remove('hidden');
        if (elementos.mainApp) elementos.mainApp.classList.add('hidden');
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
    const errorMsg = document.getElementById('login-error');

    try {
        const res = await fetch(`${URL_JSON_SERVER}/users?username=${username}&password=${password}`);
        const usuarios = await res.json();

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            estado.usuario = usuario;
            localStorage.setItem('usuario_sesion', JSON.stringify(usuario));
            errorMsg.classList.add('hidden');
            cambiarVista('app');
        } else {
            errorMsg.classList.remove('hidden');
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
    console.log('Tienda Online iniciando...');

    // 1. Capturamos elementos nada más empezar
    capturarElementos();

    // 2. Iniciamos Auth (esto decidirá si vemos Landing o App)
    inicializarAuth();

    // 3. Conectamos la navegación
    inyectarNavEventos();

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
        conectarFiltros();
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
            obtenerProductos(cat);
        });
    });
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
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
        const datos = await respuesta.json();
        estado.todosLosProductos = datos.meals || [];
        cargarSiguienteBloque(estado.itemsIniciales);
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
        <article class="card fade-in">
            <img src="${producto.strMealThumb}" alt="${producto.strMeal}" class="card__image">
            <div class="card__data">
                <h3 class="card__title">${producto.strMeal}</h3>
                <span class="card__price">$${(producto.idMeal / 1000).toFixed(2)}</span>
                <button class="btn btn--primary" onclick="agregarAlCarrito('${producto.idMeal}')">Añadir</button>
            </div>
        </article>
    `).join('');

    elementos.app.insertAdjacentHTML('beforeend', htmlBloque);
}

// --- Carrito de Compra (Básico) ---

function agregarAlCarrito(idProducto) {
    const producto = estado.todosLosProductos.find(p => p.idMeal === idProducto);
    if (producto) {
        estado.carrito.push(producto);
        actualizarCarritoUI();
        alert(`¡${producto.strMeal} añadido al carrito!`);
    }
}

function actualizarCarritoUI() {
    if (elementos.badgeCarrito) {
        elementos.badgeCarrito.textContent = estado.carrito.length;
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', iniciar);

// Exportar para que podamos probar en la consola si queremos
window.estadoApp = estado;
window.agregarAlCarrito = agregarAlCarrito; // Global para el onclick del render
