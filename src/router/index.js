import { createRouter, createWebHistory } from 'vue-router'
import { loginStore } from "../stores/login";

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Roles from '../views/Roles.vue'
import cambiarPermisos from '../views/cambiarPermisos.vue'
import Usuarios from '../views/Usuarios.vue'
import agregarUsuario from '../views/agregarUsuario.vue'
import modificarUsuario from '../views/modificarUsuario.vue'
import Clientes from '../views/Clientes.vue'
import agregarCliente from '../views/agregarCliente.vue'
import modificarCliente from '../views/modificarCliente.vue'
import Catalogo from '../views/Catalogo.vue'
import detallesPieza from '../views/detallesPieza.vue'
import agregarPieza from '../views/agregarPieza.vue'
import modificarPieza from '../views/modificarPieza.vue';
import RFQ from '../views/RFQ.vue'
import detallesRFQ from '../views/detallesRFQ.vue'
import agregarRFQ from '../views/agregarRFQ.vue'
import modificarCostosRFQ from '../views/modificarCostosRFQ.vue'
import Pedidos from '../views/Pedidos.vue'
import detallesPedido from '../views/detallesPedido.vue'
import Reportes from '../views/Reportes.vue'
import Carrito from '../views/Carrito.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Ruta de coincidencia para manejar ubicaciones no encontradas
    {
      path: '/',
      redirect: { name: 'home' } // Puedes redirigir a una ruta específica, como 'home'      
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/roles',
      name: 'roles',
      component: Roles
    },
    {
      path: '/permisos/:idRol',
      name: 'permisos',
      component: cambiarPermisos
    },        
    {
      path: '/usuarios',
      name: 'usuarios',
      component: Usuarios
    },
    {
      path: '/usuarios/agregarUsuario',
      name: 'agregarUsuario',
      component: agregarUsuario
    },
    {
      path: '/usuarios/:idUsuario',
      name: 'modificarUsuario',
      component: modificarUsuario
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: Clientes
    },
    {
      path: '/clientes/agregarCliente',
      name: 'agregarCliente',
      component: agregarCliente
    },
    {
      path: '/clientes/:idCliente',
      name: 'modificarCliente',
      component: modificarCliente
    },
    {
      path: '/catalogo',    
      name: 'catalogo',
      component: Catalogo
    },
    {
      path: '/detallesPieza/:id',
      name: 'detallesPieza',
      component: detallesPieza
    },
    {
      path: '/catalogo/agregarPieza',
      name: 'agregarPieza',
      component: agregarPieza
    },
    {
      path: '/catalago/:idPieza',
      name: 'modificarPieza',
      component: modificarPieza
    },
    {
      path: '/rfq',
      name: 'rfq',
      component: RFQ
    },
    {
      path: '/detallesRFQ/:id',
      name: 'detallesRFQ',
      component: detallesRFQ
    },
    {
      path: '/rfq/agregarRFQ',
      name: 'agregarRFQ',
      component: agregarRFQ
    },
    {
      path: '/rfq/:idRFQ',
      name: 'modificarCostosRFQ',
      component: modificarCostosRFQ
    },
    {
      path: '/pedidos',    
      name: 'pedidos',
      component: Pedidos
    },
    {
      path: '/detallesPedido/:id',
      name: 'detallesPedido',
      component: detallesPedido
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: Reportes
    },
    {
      path: '/carrito',    
      name: 'carrito',
      component: Carrito
    }
  ]  
})

router.beforeEach(async (to, from, next) => {
  const store = loginStore();

  // Verificar si la sesión está activa
  const sesionActiva = await store.reanudarSesion();
  
  if (sesionActiva) {
    console.log('Sesión iniciada');

    // Si la ruta a la que se dirige es la página de inicio de sesión, redirige a la página de inicio
    if (to.name === 'login') {
      next({ name: 'home' });
    } else {
      // Verificar si la interfaz o ruta existe 
      const rutaExistente = router.hasRoute(to.name);
      
      if (rutaExistente) {
        try {
          // Obtener el nombre de la interfaz
          const nombreInterfaz = to.name;
          console.log(nombreInterfaz)

          // Hacer la petición para verificar permisos y esperar la respuesta
          const tienePermisos = await store.permisos(nombreInterfaz);
          console.log("Tiene permisos:", tienePermisos);

          if (tienePermisos) {
            // Permitir acceso si tiene permisos
            next(); 
          } else {
            console.log('No tiene permisos para acceder a esta interfaz');
            alert('No tiene permisos para acceder a esta interfaz, redirigiendo al inicio')
            // Redirigir a la página de inicio si no tiene permisos
            next({ name: 'home' }); 
          }
        } catch (error) {
          console.error('Error al verificar permisos:', error);
          // Manejar errores redirigiendo a la página de inicio
          next({ name: 'home' }); 
        }
      } else {
        console.log('Interfaz no encontrada');
        alert('Interfaz no encontrada, redirigiendo al inicio');
        // Redirigir al home si la interfaz no existe
        next({ name: 'home' }); 
      }
    }
  } else {
    console.log('Sesión no iniciada');

    // Si se intenta acceder a una ruta que no sea la de inicio de sesión
    //  y no hay sesión iniciada, redirigir a la página de inicio de sesión
    if (to.name !== 'login') {
      next({ name: 'login' });
    } else {
      // Permitir el acceso a la página de inicio de sesión
      next();
    }
  }
});

export default router