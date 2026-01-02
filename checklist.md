# Checklist del Proyecto - Tienda On-line

## 1. Configuración e Infraestructura
- [x] Inicializar repositorio Git y crear rama `develop`
- [x] Configurar `json-server` (Backend simulado)
- [x] API seleccionada: [TheMealDB](https://www.themealdb.com/) (Tienda de comida - JustEat)
- [x] Estructura inicial de carpetas

## 2. Desarrollo JS: Autenticación y Core
- [ ] **Login**: Implementar login contra Json Server
- [ ] **Seguridad**: Protección básica en login/pedidos (anti-bot)
- [ ] **Tokens**: Simulación de JWT o manejo de sesión

## 3. Desarrollo JS: Catálogo de Productos
- [x] **Listado**: Mostrar productos desde la API externa
- [x] **Paginación**: Implementar Scroll Infinito (o carga progresiva)
    - [x] Scroll infinito en PC/Tablet (6/3 y 4/2)
    - [x] Botón "Cargar más" en Móvil (+4 productos)
    - [x] Sincronización con breakpoints CSS (matchMedia)
- [ ] **Filtros**: Filtrar por categoría
- [ ] **Ordenación**: Ordenar ascendente/descendente (precio/nombre)
- [x] **Diseño Card**: Mostrar Imagen, Nombre y Precio en listado
- [ ] **Detalle**: Vista detallada del producto al seleccionar

## 4. Desarrollo JS: Carrito de Compra
- [ ] **Añadir**: Agregar productos al carrito
- [ ] **Visualizar**: Ver contenido completo del carrito
- [ ] **Persistencia**: Guardar carrito en LocalStorage (1 pto)
- [ ] **Cantidades**: Manejar incrementos de cantidad (0.5 pto)
- [ ] **Edición**: Modificar unidades o borrar ítems (0.5 pto)
- [ ] **Checkout**: Simulación de pedido
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
    - [ ] Formularios y tablas estilizados
    - [ ] Galería de imágenes (Grid irregular)
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
