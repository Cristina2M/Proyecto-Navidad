# Checklist del Proyecto - Tienda On-line

## 1. Configuración e Infraestructura
- [x] Inicializar repositorio Git y crear rama `develop`
- [x] Configurar `json-server` (Backend simulado)
- [x] API seleccionada: [TheMealDB](https://www.themealdb.com/) (Tienda de comida - JustEat)
- [x] Estructura inicial de carpetas

## 2. Desarrollo JS: Autenticación y Core
- [x] **Login**: Implementar login contra Json Server
- [x] **Registro**: Creación de usuarios en la base de datos
- [x] **Tokens**: Simulación de sesión persistente (LocalStorage)
- [ ] **Seguridad**: Protección básica en login/pedidos (anti-bot)

## 3. Desarrollo JS: Catálogo de Productos
- [x] **Listado**: Mostrar productos desde la API externa
- [x] **Paginación**: Implementar Scroll Infinito (o carga progresiva)
    - [x] Scroll infinito en PC/Tablet (6/3 y 4/2)
    - [x] Botón "Cargar más" en Móvil (+4 productos)
    - [x] Sincronización con breakpoints CSS (matchMedia)
- [x] **Filtros**: Filtrar por categoría (Mariscos, Pasta, Postres, Todos)
- [x] **Ordenación**: Ordenar ascendente/descendente (precio/nombre)
- [x] **Diseño Card**: Mostrar Imagen, Nombre y Precio en listado
- [x] **Detalle**: Vista detallada del producto al seleccionar (Modal interactivo)

## 4. Desarrollo JS: Carrito de Compra
- [x] **Añadir**: Agregar productos al carrito (Boton funcional)
- [x] **Visualizar**: Ver contenido completo del carrito (Vista de Página dedicada)
- [x] **Badge**: Contador dinámico sobre el icono del carrito
- [x] **Persistencia**: Guardar carrito en LocalStorage (1 pto)
- [x] **Cantidades**: Manejar incrementos de cantidad (0.5 pto)
- [x] **Edición**: Modificar unidades o borrar ítems (0.5 pto)
- [x] **Checkout**: Simulación de pedido
- [ ] **Email**: Confirmación via EmailJS (1 pto)

## 5. Diseño CSS (Ana)
- [x] **Metodología**: Usar BEM
- [x] **Variables**: Definir al menos 4 variables CSS (8+ variables definidas)
- [x] **Responsive**: Adaptable a Móvil (576px), Tablet (768-967px), Desktop (968px+)
- [x] **Componentes**:
    - [x] Barra de navegación (colapsable)
    - [x] Botones estilizados (primary, outline)
    - [x] Cards de productos con hover
    - [x] Sistema de Grid responsive
    - [x] Formularios estilizados (Login/Register)
    - [x] Galería de imágenes (Grid irregular dinámico)
- [x] **Extras**:
    - [ ] Favicon
    - [x] 4 Animaciones/Efectos:
        - [x] Fade-in al cargar página
        - [x] Fade-in en productos (scroll)
        - [x] Efecto nieve (22 copos animados)
        - [x] Hover effects en cards/botones

## 6. Despliegue (Susana)
- [ ] **CI/CD**: Configurar GitHub Actions
- [ ] **Contenedor**: Dockerizar aplicación
- [ ] **AWS**: Desplegar en instancia EC2
- [ ] **Documentación**: Ruta `/documentacion`
