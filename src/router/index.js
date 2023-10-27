import { createRouter, createWebHistory } from 'vue-router'
import { loginStore } from "../stores/login";

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Roles from '../views/Roles.vue'
import cambiarPermisos from '../views/cambiarPermisos.vue'
import Usuarios from '../views/Usuarios.vue'
import Clientes from '../views/Clientes.vue'
import agregarCliente from '../views/agregarCliente.vue'
import modificarCliente from '../views/modificarCliente.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    }
  ]
})

export default router