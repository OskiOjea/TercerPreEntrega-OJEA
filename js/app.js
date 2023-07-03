//Desarrolo de un carrito de compra con la funcionalidad de almacenamiento local, para el storage decidí resolverlo por etapas ya que el
//objetivo que buscaba era que si el usuario finalizaba la compra exitosamente se borre por completo el dato almacenado, si bien el
//codigo puede ser mas extenso es mas funcional para lo que intento realizar.

// Variable que mantiene el estado visible del carrito
let carritoVisible = false;

// Esperamos a que todos los elementos de la página carguen para ejecutar el script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  // Agrego funcionalidad a los botones eliminar del carrito
  let botonesEliminarItem = document.getElementsByClassName("btn-eliminar");
  for (let i = 0; i < botonesEliminarItem.length; i++) {
    let button = botonesEliminarItem[i];
    button.addEventListener("click", eliminarItemCarrito);
  }

  // Agrego funcionalidad al botón sumar cantidad
  let botonesSumarCantidad = document.getElementsByClassName("sumar-cantidad");
  for (let i = 0; i < botonesSumarCantidad.length; i++) {
    let button = botonesSumarCantidad[i];
    button.addEventListener("click", sumarCantidad);
  }

  // Agrego funcionalidad al botón restar cantidad
  let botonesRestarCantidad =
    document.getElementsByClassName("restar-cantidad");
  for (let i = 0; i < botonesRestarCantidad.length; i++) {
    let button = botonesRestarCantidad[i];
    button.addEventListener("click", restarCantidad);
  }

  // Agrego funcionalidad al botón Agregar al carrito
  let botonesAgregarAlCarrito = document.getElementsByClassName("boton-item");
  for (let i = 0; i < botonesAgregarAlCarrito.length; i++) {
    let button = botonesAgregarAlCarrito[i];
    button.addEventListener("click", agregarAlCarritoClicked);
  }

  // Agrego funcionalidad al botón comprar
  document
    .getElementsByClassName("btn-pagar")[0]
    .addEventListener("click", pagarClicked);
  // Cargar datos del carrito desde el almacenamiento local
  cargarCarritoDesdeStorage();
}

// Elimino todos los elementos del carrito y lo oculto
function pagarClicked() {
  Swal.fire({
    title: "<strong>¡Gracias!</strong>",
    icon: "success",
    html: "<b>¡Nos interesa su opinión!</b> Valórenos ahora.",
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: '<i class="fa fa-thumbs-up"></i> ¡Genial!',
    confirmButtonAriaLabel: "Thumbs up, great!",
    cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
    cancelButtonAriaLabel: "Thumbs down",
  });

  // Elimino todos los elementos del carrito
  let carritoItems = document.getElementsByClassName("carrito-items")[0];
  while (carritoItems.hasChildNodes()) {
    carritoItems.removeChild(carritoItems.firstChild);
  }
  actualizarTotalCarrito();
  ocultarCarrito();
  // Borro los datos del carrito en el almacenamiento local
  guardarCarritoEnStorage([]);
}

// Función que controla el botón clickeado de agregar al carrito
function agregarAlCarritoClicked(event) {
  let button = event.target;
  let item = button.parentElement;
  let titulo = item.getElementsByClassName("titulo-item")[0].innerText;
  let precio = item.getElementsByClassName("precio-item")[0].innerText;
  let imagenSrc = item.getElementsByClassName("img-item")[0].src;
  agregarItemAlCarrito(titulo, precio, imagenSrc);
  hacerVisibleCarrito();
  // Guardar el carrito actualizado en el almacenamiento local
  guardarCarritoEnStorage(obtenerCarritoDesdeHTML());
}

// Función que hace visible el carrito (incluyo algo de estilo)
function hacerVisibleCarrito() {
  carritoVisible = true;
  let carrito = document.getElementsByClassName("carrito")[0];
  carrito.style.marginRight = "0";
  carrito.style.opacity = "1";
  let items = document.getElementsByClassName("contenedor-items")[0];
  items.style.width = "60%";
}

// Función que agrega un item al carrito
function agregarItemAlCarrito(titulo, precio, imagenSrc) {
  let item = document.createElement("div");
  item.classList.add("item");
  let itemsCarrito = document.getElementsByClassName("carrito-items")[0];

  // Controlo que el item que intenta ingresar no se encuentre en el carrito,
  // si el item ya se encuentra seleccionado emerge un mensaje.
  let nombresItemsCarrito = itemsCarrito.getElementsByClassName(
    "carrito-item-titulo"
  );
  for (let i = 0; i < nombresItemsCarrito.length; i++) {
    if (nombresItemsCarrito[i].innerText === titulo) {
      Swal.fire({
        title:
          "El item ya se encuentra en el carrito, agregue más unidades desde el ítem de compra.",
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
      return;
    }
  }

  let itemCarritoContenido = `
    <div class="carrito-item">
        <img src="${imagenSrc}" width="80px" alt="">
        <div class="carrito-item-detalles">
            <span class="carrito-item-titulo">${titulo}</span>
            <div class="selector-cantidad">
                <i class="fa-solid fa-minus restar-cantidad"></i>
                <input type="text" value="1" class="carrito-item-cantidad" disabled>
                <i class="fa-solid fa-plus sumar-cantidad"></i>
            </div>
            <span class="carrito-item-precio">${precio}</span>
        </div>
        <button class="btn-eliminar">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
  `;
  item.innerHTML = itemCarritoContenido;
  itemsCarrito.append(item);

  // Agrego la funcionalidad eliminar al nuevo item
  item
    .getElementsByClassName("btn-eliminar")[0]
    .addEventListener("click", eliminarItemCarrito);

  // Agrego la funcionalidad restar cantidad del nuevo item
  let botonRestarCantidad = item.getElementsByClassName("restar-cantidad")[0];
  botonRestarCantidad.addEventListener("click", restarCantidad);

  // Agrego la funcionalidad sumar cantidad del nuevo item
  let botonSumarCantidad = item.getElementsByClassName("sumar-cantidad")[0];
  botonSumarCantidad.addEventListener("click", sumarCantidad);
  // Actualizo total
  actualizarTotalCarrito();
}

// Aumento en uno la cantidad del elemento seleccionado
function sumarCantidad(event) {
  let buttonClicked = event.target;
  let selector = buttonClicked.parentElement;
  let cantidadActual = parseInt(
    selector.getElementsByClassName("carrito-item-cantidad")[0].value
  );
  cantidadActual++;
  selector.getElementsByClassName("carrito-item-cantidad")[0].value =
    cantidadActual;
  actualizarTotalCarrito();
  // Guardar el carrito actualizado en el almacenamiento local
  guardarCarritoEnStorage(obtenerCarritoDesdeHTML());
}

// Resto en uno la cantidad del elemento seleccionado
function restarCantidad(event) {
  let buttonClicked = event.target;
  let selector = buttonClicked.parentElement;
  let cantidadActual = parseInt(
    selector.getElementsByClassName("carrito-item-cantidad")[0].value
  );
  cantidadActual--;
  if (cantidadActual >= 1) {
    selector.getElementsByClassName("carrito-item-cantidad")[0].value =
      cantidadActual;
    actualizarTotalCarrito();
    // Guardar el carrito actualizado en el almacenamiento local
    guardarCarritoEnStorage(obtenerCarritoDesdeHTML());
  }
}

// Elimino el item seleccionado del carrito
function eliminarItemCarrito(event) {
  let buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  // Actualizo el total del carrito
  actualizarTotalCarrito();
  // La siguiente función controla si hay elementos en el carrito
  // Si no hay, elimino el carrito
  ocultarCarrito();
  // Guardar el carrito actualizado en el almacenamiento local
  guardarCarritoEnStorage(obtenerCarritoDesdeHTML());
}

// Función que controla si hay elementos en el carrito. Si no hay, oculto el carrito.
function ocultarCarrito() {
  let carritoItems = document.getElementsByClassName("carrito-items")[0];
  if (carritoItems.childElementCount == 0) {
    let carrito = document.getElementsByClassName("carrito")[0];
    carrito.style.marginRight = "-100%";
    carrito.style.opacity = "0";
    carritoVisible = false;
    let items = document.getElementsByClassName("contenedor-items")[0];
    items.style.width = "100%";
  }
}

// Actualizo el total de Carrito
function actualizarTotalCarrito() {
  // Selecciono el contenedor carrito
  let carritoContenedor = document.getElementsByClassName("carrito")[0];
  let carritoItems = carritoContenedor.getElementsByClassName("carrito-item");
  let total = 0;
  // Recorro cada elemento del carrito para actualizar el total
  for (let i = 0; i < carritoItems.length; i++) {
    let item = carritoItems[i];
    let precioElemento = item.getElementsByClassName("carrito-item-precio")[0];
    // Quito el símbolo peso y el punto de milesimos.
    let precio = parseFloat(
      precioElemento.innerText.replace("$", "").replace(".", "")
    );
    let cantidadItem = item.getElementsByClassName("carrito-item-cantidad")[0];
    let cantidad = parseInt(cantidadItem.value);
    total = total + precio * cantidad;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("carrito-precio-total")[0].innerText =
    "$" + total.toLocaleString("es") + ",00";
}

// Función para obtener el contenido del carrito desde el HTML
function obtenerCarritoDesdeHTML() {
  let carritoItems = document.getElementsByClassName("carrito-items")[0];
  let items = carritoItems.getElementsByClassName("carrito-item");
  let carrito = [];
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let titulo = item.getElementsByClassName("carrito-item-titulo")[0]
      .innerText;
    let precio = item.getElementsByClassName("carrito-item-precio")[0]
      .innerText;
    let imagenSrc = item.getElementsByTagName("img")[0].src;
    let cantidad = parseInt(
      item.getElementsByClassName("carrito-item-cantidad")[0].value
    );
    carrito.push({
      titulo: titulo,
      precio: precio,
      imagenSrc: imagenSrc,
      cantidad: cantidad,
    });
  }
  return carrito;
}

// Función para guardar el carrito en el almacenamiento local
function guardarCarritoEnStorage(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para cargar el carrito desde el almacenamiento local
function cargarCarritoDesdeStorage() {
  let carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    let carrito = JSON.parse(carritoGuardado);
    for (let i = 0; i < carrito.length; i++) {
      let item = carrito[i];
      agregarItemAlCarrito(item.titulo, item.precio, item.imagenSrc);
      let cantidadElemento = document.getElementsByClassName(
        "carrito-item-cantidad"
      )[i];
      cantidadElemento.value = item.cantidad;
    }
    hacerVisibleCarrito();
  }

  // Verificar si el carrito está vacío y ocultarlo si es necesario
  let carritoItems = document.getElementsByClassName("carrito-items")[0];
  if (carritoItems.childElementCount == 0) {
    ocultarCarrito();
  }
}
