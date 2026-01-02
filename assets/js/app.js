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

// --- Gestión del Estado ---
// Aquí guardamos toda la info de la aplicación mientras la usamos
const estado = {
    categorias: [],
    todosLosProductos: [], // Aquí guardamos TODO lo que nos devuelve la API
    productosVisibles: [], // Aquí solo lo que mostramos en pantalla
    carrito: [],
    categoriaActual: 'all',
    cargando: false,
    indiceActual: 0,

    // Configuración por defecto (se ajustará según el dispositivo)
    itemsIniciales: 6,
    itemsPorPagina: 3,
    modoBoton: false, // Si es true, mostramos botón "Cargar Más". Si es false, Scroll Infinito.
};

// --- Elementos del DOM ---
// Buscamos los elementos en el HTML para poder modificarlos
const elementos = {
    app: document.getElementById('app'),
    badgeCarrito: document.querySelector('.cart-badge'),
};

// --- Funciones de Configuración Responsive ---

/**
 * Esta función decide cómo se comporta la página según el tamaño de la ventana.
 * PC: Scroll Infinito (Carga 6 y luego de 3 en 3).
 * Tablet: Scroll Infinito (Carga 4 y luego de 2 en 2).
 * Móvil: Botón "Cargar Más" (Carga 4 y luego de 4 en 4).
 */
function actualizarConfiguracion() {
    // Usamos matchMedia para coincidir EXACTAMENTE con el CSS (evitando problemas de scrollbar)
    const esPC = window.matchMedia('(min-width: 968px)').matches;
    const esTablet = window.matchMedia('(min-width: 768px)').matches;

    if (esPC) {
        // --- PC (> 968px) ---
        console.log('Modo PC detectado');
        estado.itemsIniciales = 6;
        estado.itemsPorPagina = 3;
        estado.modoBoton = false;
    } else if (esTablet) {
        // --- Tablet (768px - 967px) ---
        console.log('Modo Tablet detectado');
        estado.itemsIniciales = 4;
        estado.itemsPorPagina = 2;
        estado.modoBoton = false;
    } else {
        // --- Móvil (< 768px) ---
        console.log('Modo Móvil detectado');
        estado.itemsIniciales = 4;
        estado.itemsPorPagina = 4;
        estado.modoBoton = true;
    }
}

// --- Funciones Principales ---

/**
 * Inicializar la aplicación
 * Es lo primero que se ejecuta cuando carga la página.
 */
async function iniciar() {
    console.log('Tienda Online iniciando...');

    // 1. Configuramos reglas según dispositivo
    actualizarConfiguracion();

    // Si cambian el tamaño de la ventana, recalculamos
    window.addEventListener('resize', () => {
        actualizarConfiguracion();
        // Nota: Podríamos recargar productos aquí si quisiéramos ser muy estrictos,
        // pero por ahora solo actualizamos la regla para la siguiente carga.
    });

    try {
        await obtenerCategorias();
        // Carga por defecto
        await obtenerProductos('Seafood');

        // Listener para Scroll Infinito (solo funcionará si modoBoton es false)
        window.addEventListener('scroll', manejarScroll);
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
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
        // Aquí podríamos pintar las categorías en el HTML si quisiéramos dinámicas
    } catch (error) {
        console.error('Error al obtener categorías:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Obtener Productos por Categoría
 * OJO: La API nos da TODOS los productos de golpe.
 * Nosotros nos encargamos de guardarlos y mostrarlos poco a poco.
 */
async function obtenerProductos(categoria) {
    console.log(`Obteniendo productos: ${categoria}`);
    estado.cargando = true;

    // Limpiamos todo al cambiar de categoría
    estado.indiceActual = 0;
    estado.todosLosProductos = [];
    estado.productosVisibles = [];

    if (elementos.app) elementos.app.innerHTML = '';
    // Borramos botón anterior si existe
    eliminarBotonCargarMas();

    try {
        const respuesta = await fetch(`${URL_BASE_API}${ENDPOINT_FILTRO}${categoria}`);
        const datos = await respuesta.json();

        // Guardamos la lista completa en memoria
        estado.todosLosProductos = datos.meals || [];
        console.log(`Total encontrados: ${estado.todosLosProductos.length}`);

        // Cargamos el primer bloque (según configuración PC/Tablet/Móvil)
        cargarSiguienteBloque(estado.itemsIniciales);

    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        estado.cargando = false;
    }
}

/**
 * Cargar siguiente bloque de productos
 * @param {number} cantidad - Cuántos productos añadir
 */
function cargarSiguienteBloque(cantidad) {
    // Si ya mostramos todos, paramos
    if (estado.indiceActual >= estado.todosLosProductos.length) {
        eliminarBotonCargarMas();
        return;
    }

    const siguienteIndice = estado.indiceActual + cantidad;
    // Cortamos un trozo del array grande
    const nuevosProductos = estado.todosLosProductos.slice(estado.indiceActual, siguienteIndice);

    estado.productosVisibles = [...estado.productosVisibles, ...nuevosProductos];
    estado.indiceActual = siguienteIndice;

    renderizarBloque(nuevosProductos);

    // Si estamos en móvil (modoBoton), gestionamos el botón al final
    if (estado.modoBoton) {
        gestionarBotonCargarMas();
    }
}

/**
 * Manejador de Scroll (Solo para PC y Tablet)
 */
function manejarScroll() {
    // Si estamos en modo botón (móvil), IGNORAMOS el scroll
    if (estado.modoBoton) return;

    // Si ya estamos cargando o no hay más, salimos
    if (estado.cargando || estado.indiceActual >= estado.todosLosProductos.length) return;

    // Calculamos si llegamos al final de la página
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
        console.log('Scroll final: Cargando más...');
        cargarSiguienteBloque(estado.itemsPorPagina);
    }
}

/**
 * Gestión del Botón "Cargar Más" (Solo Móvil)
 */
function gestionarBotonCargarMas() {
    eliminarBotonCargarMas(); // Borramos el anterior para ponerlo al final

    // Si aún quedan productos por mostrar, añadimos el botón
    if (estado.indiceActual < estado.todosLosProductos.length) {
        const botonTemplate = `
            <div class="load-more-container" style="width: 100%; display: flex; justify-content: center; margin-top: 2rem;">
                <button id="btn-load-more" class="btn btn--outline">Cargar más productos</button>
            </div>
        `;
        elementos.app.insertAdjacentHTML('afterend', botonTemplate);

        // Le damos vida al botón
        document.getElementById('btn-load-more').addEventListener('click', () => {
            cargarSiguienteBloque(estado.itemsPorPagina);
        });
    }
}

function eliminarBotonCargarMas() {
    const botonExistente = document.querySelector('.load-more-container');
    if (botonExistente) botonExistente.remove();
}

/**
 * Renderizar (Pintar) los productos en la pantalla
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

// Exportar para que podamos probar en la consola si queremos
window.estadoApp = estado;
