import { defineStore } from "pinia";

export const carritoStore = defineStore("carrito", {
  state: () => ({
    items: [], // Contendrá los elementos del carrito
  }),
  actions: {
    // Inicializar el carrito del usuario actual desde el Local Storage
    initCarrito(idUsuario) {
      const carritoUsuario = localStorage.getItem(`carrito_${idUsuario}`);
      if (carritoUsuario) {
        this.items = JSON.parse(carritoUsuario);
      }
    },

    // Agregar un elemento al carrito o incrementar la cantidad si ya existe
    agregarAlCarrito(item, idUsuario) {
      const index = this.items.findIndex(el => el.id === item.id);
      if (index !== -1) {
        // Si el elemento ya está en el carrito, aumenta la cantidad
        this.items[index].cantidad += item.cantidad;
      } else {
        // Si el elemento no está en el carrito, agrégalo
        this.items.push(item);
      }
      this.guardarCarrito(idUsuario);
    },

    // Vaciar el carrito
    vaciarCarrito(idUsuario) {
      this.items = [];
      this.guardarCarrito(idUsuario);
    },

    // Obtener el contenido actual del carrito desde el almacenamiento local
    obtenerCarrito(idUsuario) {
      const carritoUsuario = localStorage.getItem(`carrito_${idUsuario}`);
      if (carritoUsuario) {
        this.items = JSON.parse(carritoUsuario);
      }
      return this.items;
    },

    // Guardar el carrito actual del usuario en el Local Storage
    guardarCarrito(idUsuario) {
      localStorage.setItem(`carrito_${idUsuario}`, JSON.stringify(this.items));
    }
  },
  // Hook de Pinia: 'onCreated' se llama cuando se crea el store
  onCreated() {
    this.initCarrito(); // Cargar el carrito al iniciar
  },
});
