/**
 * Tienda Online - Core JS
 * Rama: feature/sergio-js-core
 */

// --- Configuración ---
const URL_BASE_API = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINT_CATEGORIAS = '/categories.php';
const ENDPOINT_FILTRO = '/filter.php?c=';

// --- Gestión del Estado ---
const estado = {
    categorias: [],
    productos: [],
    carrito: [],
    categoriaActual: 'all',
    cargando: false,
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
        // Carga por defecto (ej. Seafood o todos)
        await obtenerProductos('Seafood');
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
 * Obtener Productos por Categoría
 * @param {string} categoria 
 */
async function obtenerProductos(categoria) {
    console.log(`Obteniendo productos para la categoría: ${categoria}`);
    estado.cargando = true;
    try {
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
        const datos = await respuesta.json();
        estado.productos = datos.meals;
        console.log('Productos cargados:', estado.productos);
        renderizarProductos();
    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Renderizar productos en el DOM
 */
function renderizarProductos() {
    if (!elementos.app) {
        console.warn('Elemento DOM #app no encontrado. Esperando fusión con rama de interfaz.');
        return;
    }

    elementos.app.innerHTML = estado.productos.map(producto => `
        <article class="card">
            <img src="${producto.strMealThumb}" alt="${producto.strMeal}" class="card__image">
            <div class="card__data">
                <h3 class="card__title">${producto.strMeal}</h3>
                <span class="card__price">$${(producto.idMeal / 1000).toFixed(2)}</span>
                <button class="btn btn--primary" onclick="agregarAlCarrito('${producto.idMeal}')">Añadir</button>
            </div>
        </article>
    `).join('');
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', iniciar);

// Exportar para depuración/pruebas
window.estadoApp = estado;
