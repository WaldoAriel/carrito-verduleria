//Verduleros: Ivan Nieva, Juan Ordoñez, Waldo Fernández

class ProductoBase {
    constructor(nombre, precio, imagen, id){
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.imagen = imagen;
    }

    obtenerPrecio(){
        return ` $${this.precio.toFixed(2)} `
    }

    obtenerDetalle(){
        return {
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            imagen: this.imagen
        };
    };
};



// Definimos la clase SelectorProducto para manejar la lógica de sumar y restar la cantidad de cada producto
class SelectorProducto extends ProductoBase {
    constructor(nombre, precio, imagen, id, btnResta, btnSuma, mostrarCantidad) {
        super (nombre, precio, imagen, id)
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

    obtenerInfoCarrito(){
        return {
            ...this.obtenerDetalle(), //usamos el método heredado
            cantidad: this.cantidadActual
        }
    }
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
function agregarAlCarrito(indice) {
    const selector = instancias[indice];
    const infoProducto = selector.obtenerInfoCarrito();

    const productoEnCarrito = carrito.find(item => item.id === infoProducto.id);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += infoProducto.cantidad;
    } else {
        carrito.push(infoProducto);
    };

    totalPrecio += infoProducto.precio * infoProducto.cantidad;
    
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
            e.stopPropagation(); // para frenar la propagación del click
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
    const tarjeta = btnResta.closest('.tarjeta'); //obtengo tarjeta del prod

    //obtengo datos del prod
    const nombre = tarjeta.querySelector('h3').textContent;
    const precio = parseFloat(tarjeta.querySelector('h5').textContent.replace('Precio: $', ''));
    const imagen = tarjeta.querySelector('.producto').src;
    
    // instancia cn todos los parámetros
    const selector = new SelectorProducto(
        nombre,
        precio,
        imagen,
        indice,
        btnResta,
        btnSumas[indice],
        mostrarCantidades[indice]);

    instancias.push(selector);
});

// Configurar los botones "Agregar al carrito"
const botonesAgregar = document.querySelectorAll('.agregar-al-carrito');

botonesAgregar.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        agregarAlCarrito(index);
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

// Evento para cerrar el modal dando click fuera del modal
carritoModal.addEventListener('click', (event) => {
    if (!event.target.closest('.contenidoModal')) {
        cerrarCarritoModal();
    }
});

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