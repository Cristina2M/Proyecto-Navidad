# Checklist del Proyecto - Tienda On-line

## 1. Configuración e Infraestructura
- [x] Inicializar repositorio Git y crear rama `develop`
- [ ] Configurar `json-server` (Backend simulado)
- [x] API seleccionada: [TheMealDB](https://www.themealdb.com/) (Tienda de comida - JustEat)
- [ ] Estructura inicial de carpetas

## 2. Desarrollo JS: Autenticación y Core
- [ ] **Login**: Implementar login contra Json Server
- [ ] **Seguridad**: Protección básica en login/pedidos (anti-bot)
- [ ] **Tokens**: Simulación de JWT o manejo de sesión

## 3. Desarrollo JS: Catálogo de Productos
- [ ] **Listado**: Mostrar productos desde la API externa
- [ ] **Paginación**: Implementar Scroll Infinito (o carga progresiva)
- [ ] **Filtros**: Filtrar por categoría
- [ ] **Ordenación**: Ordenar ascendente/descendente (precio/nombre)
- [ ] **Diseño Card**: Mostrar Imagen, Nombre y Precio en listado
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
- [ ] **Metodología**: Usar BEM
- [ ] **Variables**: Definir al menos 4 variables CSS
- [ ] **Responsive**: Adaptable a Móvil (576px), Tablet (1024px), Desktop
- [ ] **Componentes**:
    - [ ] Barra de navegación (colapsable)
    - [ ] Formularios y tablas estilizados
    - [ ] Galería de imágenes (Grid irregular)
- [ ] **Extras**:
    - [ ] Favicon
    - [ ] 4 Animaciones/Efectos

## 6. Despliegue (Susana)
- [ ] **CI/CD**: Configurar GitHub Actions
- [ ] **Contenedor**: Dockerizar aplicación
- [ ] **AWS**: Desplegar en instancia EC2
- [ ] **Documentación**: Ruta `/documentacion`
