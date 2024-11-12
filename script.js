// Definimos la clase SelectorProducto para manejar la lógica de sumar y restar la cantidad de cada producto
class SelectorProducto {
    constructor(btnResta, btnSuma, mostrarCantidad) {
        this.btnResta = btnResta;
        this.btnSuma = btnSuma;
        this.mostrarCantidad = mostrarCantidad;
        this.cantidadActual = parseInt(this.mostrarCantidad.textContent);

        this.btnResta.addEventListener("click", () => this.restarCantidad());
        this.btnSuma.addEventListener("click", () => this.sumarCantidad());
    };

    restarCantidad() {
        if (this.cantidadActual > 1) {
            this.cantidadActual--;
            this.mostrarCantidad.textContent = this.cantidadActual;
        };
    };

    sumarCantidad() {
        this.cantidadActual++;
        this.mostrarCantidad.textContent = this.cantidadActual;
    };
};

// Seleccionar los elementos del DOM relacionados con el carrito y el modal
const totalProductoElement = document.getElementById('totalProducto');
const totalPrecioElement = document.getElementById('totalPrecio');
const carritoModal = document.getElementById('carritoModal');
const cerrarModalBtn = document.getElementById('cerrarModal');
const carritoContenido = document.getElementById('carritoContenido');
const totalCompraElement = document.getElementById('totalCompra');

// Inicializar variables del carrito desde localStorage o valores por defecto
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let totalPrecio = parseFloat(localStorage.getItem('totalPrecio')) || 0;

// Función para guardar el carrito en localStorage
function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('totalPrecio', totalPrecio.toString());
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto, cantidad) {
    const productoEnCarrito = carrito.find(item => item.id === producto.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad });
    };

    totalPrecio += producto.precio * cantidad;
    
    guardarCarritoEnStorage();
    actualizarCarrito();
};

// Función para actualizar el modal del carrito
function actualizarCarrito() {
    function sumarCantidadProductos(total, item) {
        return total + item.cantidad;
    };

    const totalProductos = carrito.reduce(sumarCantidadProductos, 0);

    totalProductoElement.textContent = totalProductos;
    totalPrecioElement.textContent = totalPrecio.toFixed(2);

    carritoContenido.innerHTML = '';
    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('carrito-item');
        itemElement.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-imagen">
            <div class="carrito-item-detalles">
                <p>${item.nombre}</p>
                <p>${item.cantidad} Kg / Unid x $${item.precio.toFixed(2)}</p>
            </div>
            <button class="eliminar-item" data-id="${item.id}">Eliminar</button>
        `;
        carritoContenido.appendChild(itemElement);
    });
    
    totalCompraElement.textContent = totalPrecio.toFixed(2);

    const botonesEliminar = carritoContenido.querySelectorAll('.eliminar-item');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const productoId = parseInt(e.target.dataset.id);
            eliminarDelCarrito(productoId);
        });
    });
};

// Función para vaciar el carrito
function vaciarCarrito() {
    carrito = [];
    totalPrecio = 0;
    guardarCarritoEnStorage();
    actualizarCarrito();
};

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productoId) {
    const index = carrito.findIndex(item => item.id === productoId);
    if (index !== -1) {
        const item = carrito[index];
        totalPrecio -= item.precio * item.cantidad;
        carrito.splice(index, 1);
        guardarCarritoEnStorage();
        actualizarCarrito();
    };
};

// Agregar un escuchador al div del carrito para que abra cuando se hace click
const carritoIcono = document.getElementById('barraCarrito');

carritoIcono.addEventListener('click', () => {
    mostrarCarritoModal();
});

// Función para mostrar el modal del carrito
function mostrarCarritoModal() {
    carritoModal.style.display = 'block';
};

// Función para cerrar el modal del carrito
function cerrarCarritoModal() {
    carritoModal.style.display = 'none';
};

// Configurar los selectores de producto
const btnRestas = document.querySelectorAll(".restar");
const btnSumas = document.querySelectorAll(".sumar");
const mostrarCantidades = document.querySelectorAll(".muestraCantidad");

const instancias = [];
btnRestas.forEach((btnResta, indice) => {
    const selector = new SelectorProducto(btnResta, btnSumas[indice], mostrarCantidades[indice]);
    instancias.push(selector);
});

// Configurar los botones "Agregar al carrito"
const botonesAgregar = document.querySelectorAll('.agregar-al-carrito');

botonesAgregar.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        const tarjeta = boton.closest('.tarjeta');
        
        const producto = {
            id: index,
            nombre: tarjeta.querySelector('h3').textContent,
            precio: parseFloat(tarjeta.querySelector('h5').textContent.replace('Precio: $', '')),
            imagen: tarjeta.querySelector('.producto').src            
        };
        
        const cantidad = parseInt(tarjeta.querySelector('.muestraCantidad').textContent);
        
        agregarAlCarrito(producto, cantidad);
    });
});

// Función para simular el procesamiento del pago
function simularPago() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Agrega productos antes de procesar el pago.');
        return;
    };
    
    alert('Redirigiendo a MercadoPago...');
    
    carrito = [];
    totalPrecio = 0;
    guardarCarritoEnStorage();
    actualizarCarrito();
    cerrarCarritoModal();
};

// Evento de click al botón de cerrar el modal
cerrarModalBtn.addEventListener('click', cerrarCarritoModal);

// Evento de click al botón de vaciar el carrito
const vaciarCarritoBtn = document.getElementById('vaciarCarrito');
vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

// Evento de click al botón de pagar
const procesarPagoBtn = document.getElementById('procesarPago');
procesarPagoBtn.addEventListener('click', simularPago);

// Cargar el carrito cuando se inicia la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
});