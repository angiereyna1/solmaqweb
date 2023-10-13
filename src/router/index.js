import { createRouter, createWebHistory } from 'vue-router'
import { loginStore } from "../stores/login";

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Roles from '../views/Roles.vue'

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
    }
  ]
})

export default router