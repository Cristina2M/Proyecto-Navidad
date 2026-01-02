/**
 * Tienda Online - Core JS
 * Rama: feature/pagination
 */

// --- Configuración ---
const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';

// --- Gestión del Estado ---
const estado = {
    categorias: [],
    todosLosProductos: [], // Lista completa de la API
    productosVisibles: [], // Lista renderizada
    carrito: [],
    categoriaActual: 'all',
    cargando: false,
    indiceActual: 0,
    itemsIniciales: 6,
    itemsPorPagina: 3,
};

// --- Elementos del DOM ---
const elementos = {
    app: document.getElementById('app'),
    badgeCarrito: document.querySelector('.cart-badge'),
};

// --- Funciones Principales ---

/**
 * Inicializar la aplicación
 */
async function iniciar() {
    console.log('Tienda Online iniciando...');

    try {
        await obtenerCategorias();
        // Carga por defecto
        await obtenerProductos('Seafood');

        // Listener para Scroll Infinito
        window.addEventListener('scroll', manejarScroll);
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
}

/**
 * Obtener Categorías de la API
 */
async function obtenerCategorias() {
    console.log('Obteniendo categorías...');
    estado.cargando = true;
    try {
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_CATEGORIAS}`);
        const datos = await respuesta.json();
        estado.categorias = datos.categories;
        console.log('Categorías cargadas:', estado.categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Obtener Productos por Categoría (Carga Completa + Paginación)
 * @param {string} categoria 
 */
async function obtenerProductos(categoria) {
    console.log(`Obteniendo productos para la categoría: ${categoria}`);
    estado.cargando = true;

    // Resetear estado al cambiar categoría
    estado.indiceActual = 0;
    estado.todosLosProductos = [];
    estado.productosVisibles = [];
    if (elementos.app) elementos.app.innerHTML = '';

    try {
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
        const datos = await respuesta.json();

        estado.todosLosProductos = datos.meals || [];
        console.log(`Total productos encontrados: ${estado.todosLosProductos.length}`);

        // Cargar bloque inicial (6)
        cargarSiguienteBloque(estado.itemsIniciales);

    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Cargar siguiente bloque de productos en memoria y DOM
 * @param {number} cantidad 
 */
function cargarSiguienteBloque(cantidad) {
    if (estado.indiceActual >= estado.todosLosProductos.length) {
        console.log('No hay más productos para cargar.');
        return;
    }

    const siguienteIndice = estado.indiceActual + cantidad;
    const nuevosProductos = estado.todosLosProductos.slice(estado.indiceActual, siguienteIndice);

    estado.productosVisibles = [...estado.productosVisibles, ...nuevosProductos];
    estado.indiceActual = siguienteIndice;

    console.log(`Cargando ${nuevosProductos.length} productos. Total visibles: ${estado.productosVisibles.length}`);
    renderizarBloque(nuevosProductos);
}

/**
 * Manejador de evento Scroll para Scroll Infinito
 */
function manejarScroll() {
    // Si ya estamos cargando o no hay más productos, salir
    if (estado.cargando || estado.indiceActual >= estado.todosLosProductos.length) return;

    // Verificar si estamos cerca del final de la página (buffer de 100px)
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
        console.log('Scroll detectado: Cargando más productos...');
        cargarSiguienteBloque(estado.itemsPorPagina);
    }
}

/**
 * Renderizar bloque de productos en el DOM (Append)
 * @param {Array} listaProductos 
 */
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

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', iniciar);

// Exportar para depuración/pruebas
window.estadoApp = estado;
