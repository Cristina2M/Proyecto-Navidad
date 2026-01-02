# Proyecto Final Trimestre - Tienda on-line

## Sergio (JS) - Funcionalidad
Haciendo uso de JS vamos a realizar una aplicación para una tienda on-line. Para ello nos vamos a basar en una API (https://fakestoreapi.com/ , http://www.omdbapi.com/ o similar ) la cual nos simula el Backend necesario para este desarrollo. Tu primera tarea será pues estudiar esta API y hacer las pruebas oportunas antes de comenzar el desarrollo.

La aplicación debe, basándose en el desarrollo de interfaz entregado:
1. Login contra Json Server.
2. Seguridad anti boot en el login o confirmación de pedido.
3. Simulación de Token JWT o en su defecto cualquier otro token.
4. Mostrar listados de productos.
5. Los productos se listan de 8 en 8, cargando nuevos si los hay mediante la técnica conocida como Scroll Infinito o paginación. Cuando este se realice debe darse información al respecto al usuario mediante algún tipo de preload o mensaje.
6. Mostrar listados por categoría.
7. Ordenar los listados ascendentemente o descendentemente.
8. Mostrar inicialmente un listado de productos, teniendo cada uno de ellos al menos un nombre, imagen y precio.
9. Gestionar un carrito de la compra, de tal modo que cada producto debe ser posible agregarlo al carrito.
10. Si se selecciona un artículo debe mostrarse el detalle completo para éste (todos los datos que proporciona la API), dando la posibilidad de comprarlo.
11. Debe ser posible acceder al carro de la compra completo para simular la realización final del pedido.

### Puntos Adicionales
Todos los puntos anteriores son los mínimos e imprescindibles para alcanzar un total de 7 puntos. El resto de puntos hasta el 10 se obtienen según lo siguiente:
1. **(1 punto)** Almacena en local el carrito del usuario, de tal modo que si vuelve a cargar la página en el mismo navegador, el carrito se mostrará tal y como lo dejó.
2. **(0.5 punto)** El carrito es capaz de manejar, para cada artículo, un número mayor a 1 de elementos. Por tanto si añado una nueva unidad de un artículo ya presente en el carrito, debe incrementarse este valor y no duplicar el artículo.
3. **(0,5 punto)** El carrito permite modificar el número de artículos, pudiendo borrarlos o modificar su número de unidades.
4. **(1 punto)** Haciendo uso de la librería emailjs.com haz que tu web envíe emails al usuario al finalizar pedido.
5. La interfaz será según las especificaciones al respecto del proyecto correspondiente del módulo Desarrollo de Interfaces Web. Debe desarrollarse una web del tipo SAP en la que en ningún momento se produce recarga, tan sólo cambiamos las vistas (Este punto es opcional).

**Entrega:**
La entrega del proyecto se hará a través de un repositorio github, indicando claramente en el README la URL. La nota final se consigue tras la defensa personalizada del proyecto para comprobar que el alumno/a entiende perfectamente su código y es capaz de realizar cambios sencillos conforme se le piden. La incapacidad para comprender y defender su propio código supone el suspenso del proyecto.

### SCROLL INFINITO
Como podéis ver consiste en trabajar el evento scroll que saltará cada vez que se mueve la barra de scroll. Luego comprobamos cuando queremos que salte. En el siguiente ejemplo salta justo al llegar al final, pero sería deseable hacerlo antes (así el usuario no ve que llegas al final y espera hasta recibir nuevos datos, sino que cuando llegue estos ya están maquetados). Para ello basta cambiar la comparación , por ejemplo ">= window.scrollY-200" para que salte 200px antes del final.

**IMPORTANTE:** El evento va a saltar cada vez que mováis el ratón, con lo que puede que lancéis muchísimas peticiones AJAX seguidas. Debemos evitar esto, para lo cual es tan sencillo como, mediante una variable, marcar que ya se ha lanzado una petición y hasta que no llega la respuesta y cambiamos esa petición no debemos dejar que se lance ninguna otra. Del mismo modo podéis probar a habilitar una imagen (gif animado) a modo de preload.
[Referencia Scroll Infinito](https://dev.to/tingchun0113/how-to-implement-infinite-scroll-with-vanilla-js3791)

## Ana (CSS) - Diseño
Utiliza metodología BEM para la estructura de la página.
Utiliza al menos 4 variables.
Toda la página web debe ser responsiva, se adapta a cualquier dispositivos, letras, imágenes, componentes, menú, etc. Los tamaños a tener en cuenta son: 
- **Móvil:** 576px
- **Tablet:** 1024px
- **Desktop:** a partir de 1024px 

Debe contener una barra de navegación. El Menú se contrae y expande correctamente cuando la página cambia de tamaños de pantalla.
Añade formularios y tablas.
Añade una galería de imágenes que estén maquetadas en grid-layout de manera irregular.
Añade al menos 4 animaciones y efectos diferentes.
Añade a tu página web un favicón.
Contenido Propio.
Originalidad y creatividad.

## Susana (Despliegue) - DevOps
Todo el código debe llevar control de versiones y seguir una metodología Git Flow.
La parte de Sergio, puro código, debe estar documentado.
El despliegue se hará con github Actions en un contenedor, por supuesto securizado, en una instancia EC2.
El nombre de la aplicación debe ser adecuado (DNS).
La documentación deberá estar en el dominio de la aplicación pero /documentación, es decir si la aplicación es https://www.aplicacion.es, entonces la documentación será https://www.aplicaciones.es/documentacion (también generada de manera automática por si había dudas)

*Nota:* Cómo pensaréis eso supone un único virutalhost porque tengo un solo dominio. Quizás sería hora de animarnos y lanzar contenedores de aplicaciones en php para tener un poco de backend. El único problema es que php necesita almacenamiento nfs, por lo demás no es complicado, además tenéis experiencia con el backend en Tomcat (pero esto hacerlo independiente que no quiero que me maten los compañeros por estropear su aplicación).