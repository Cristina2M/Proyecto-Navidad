const { estado, agregarAlCarrito, eliminarDelCarrito } = require('./app');

// Mock localStorage
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

// Mock DOM elements
global.document = {
    getElementById: jest.fn().mockReturnValue({}),
    querySelector: jest.fn().mockReturnValue({})
};

describe('Lógica del Carrito (Sergio/Core)', () => {
    beforeEach(() => {
        estado.carrito = [];
        estado.todosLosProductos = [
            { idMeal: '12345', strMeal: 'Test Meal', strMealThumb: 'url', precio: 12.34 }
        ];
    });

    test('Debe añadir un producto al carrito correctamente', () => {
        agregarAlCarrito('12345');
        expect(estado.carrito.length).toBe(1);
        expect(estado.carrito[0].idMeal).toBe('12345');
        expect(estado.carrito[0].cantidad).toBe(1);
    });

    test('Debe eliminar un producto del carrito', () => {
        agregarAlCarrito('12345');
        eliminarDelCarrito('12345');
        expect(estado.carrito.length).toBe(0);
    });
});
