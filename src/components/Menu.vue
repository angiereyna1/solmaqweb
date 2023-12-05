<script setup>
/////////////////////////////////// TO DO ////////////////////////////////////
// Optimizar codigo
//☑ comprobar que al borrar un permiso propio se actuliza la navbar LISTO
//☑ agregar btn de carrito LISTO
import { ref, onMounted, onBeforeMount } from "vue";
import { loginStore } from "../stores/login";
import { carritoStore } from "../stores/carrito"
import { usuariosStore } from "../stores/usuarios";
import { permisosRolesStore } from '../stores/permisosRoles';
import router from "../router/index";

const { cerrarSesion, getUser } = loginStore();
const { obtenerIdPorUser, obtenerIdUsuarioPorUser } = usuariosStore();
const { obtenerPermisos } = permisosRolesStore();
const { guardarCarrito } = carritoStore();

const props = defineProps(["interfaz"]);
const interfaz = props.interfaz;

const visibleRoles = ref("");
const visibleUsuarios = ref("");
const visibleClientes = ref("");
const visibleCatalogo = ref("");
const visibleRFQ = ref("");
const visiblePedidos = ref("");
const visibleReportes = ref("");
const visiblePedir = ref("");

const Usuario = getUser();

let idUsuario = '';

async function logOut() {
  idUsuario = await obtenerIdUsuarioPorUser(Usuario);
  console.log(idUsuario);
  guardarCarrito(idUsuario);
  await cerrarSesion();
  // Redirige al usuario a la página de inicio de sesión después de cerrar sesión
  redirigir("login");
}

function redirigir(interfaz) {
  router.push({ name: interfaz });
}

//buttons

const inicio = ref(null);
const roles = ref(null);
const usuarios = ref(null);
const clientes = ref(null);
const catalogo = ref(null);
const rfq = ref(null);
const pedidos = ref(null);
const reportes = ref(null);
const carrito = ref(null);

onMounted(async () => {
  const idRol = await obtenerIdPorUser(Usuario);
  console.log(Usuario);
  console.log(idRol);
  const permisos = await obtenerPermisos(idRol);
  console.log(permisos);

  permisos.includes("Consultar Roles") ? visibleRoles.value = true : visibleRoles.value = false;
  permisos.includes("Consultar Usuarios") ? visibleUsuarios.value = true : visibleUsuarios.value = false;
  permisos.includes("Consultar Clientes") ? visibleClientes.value = true : visibleClientes.value = false;
  permisos.includes("Consultar Catalogo") ? visibleCatalogo.value = true : visibleCatalogo.value = false;
  permisos.includes("Consultar RFQ") ? visibleRFQ.value = true : visibleRFQ.value = false;
  permisos.includes("Consultar Pedidos") ? visiblePedidos.value = true : visiblePedidos.value = false;
  permisos.includes("Generar Reportes") ? visibleReportes.value = true : visibleReportes.value = false;
  permisos.includes("Realizar Pedidos") ? visiblePedir.value = true : visiblePedir.value = false;

  //aun no jala - YA JALA LO HIZO MI NOVIO BONITO 12/10
  switch (interfaz) {
    case "menu":
      inicio.value.style.borderColor = "white";
      inicio.value.style.borderBottom = "#FFCA0A";
      inicio.value.style.borderStyle = "solid";
      inicio.value.style.fontWeight = "bold";
      break;
    case "roles":
      roles.value.style.borderColor = "white";
      roles.value.style.borderBottom = "#FFCA0A";
      roles.value.style.borderStyle = "solid";
      roles.value.style.fontWeight = "bold";
      break;
    case "usuarios":
      usuarios.value.style.borderColor = "white";
      usuarios.value.style.borderBottom = "#FFCA0A";
      usuarios.value.style.borderStyle = "solid";
      usuarios.value.style.fontWeight = "bold";
      break;
    case "clientes":
      clientes.value.style.borderColor = "white";
      clientes.value.style.borderBottom = "#FFCA0A";
      clientes.value.style.borderStyle = "solid";
      clientes.value.style.fontWeight = "bold";
      break;
    case "catalogo":
      catalogo.value.style.borderColor = "white";
      catalogo.value.style.borderBottom = "#FFCA0A";
      catalogo.value.style.borderStyle = "solid";
      catalogo.value.style.fontWeight = "bold";
      break;
    case "rfq":
      rfq.value.style.borderColor = "white";
      rfq.value.style.borderBottom = "#FFCA0A";
      rfq.value.style.borderStyle = "solid";
      rfq.value.style.fontWeight = "bold";
      break;
    case "pedidos":
      pedidos.value.style.borderColor = "white";
      pedidos.value.style.borderBottom = "#FFCA0A";
      pedidos.value.style.borderStyle = "solid";
      pedidos.value.style.fontWeight = "bold";
      break;
    case "reportes":
      reportes.value.style.borderColor = "white";
      reportes.value.style.borderBottom = "#FFCA0A";
      reportes.value.style.borderStyle = "solid";
      reportes.value.style.fontWeight = "bold";
      break;
  }
})


// Esta funcion amos a usarla para brincar entre interfaces
function jumpTo(nombreDeInterfazAdondeVamos) {
  //el router esta comentado pq no esta importado arriba pq esta comentado jajatl
  router.push({ name: nombreDeInterfazAdondeVamos })
}
</script>

<template>
  <div style="background-color: white;width: 100vw;">
    <div class="side"></div>

    <div style="display: inline; margin: auto;">
      <div class="navbar">
        <!-- En este div va el logo -->
        <div style="justify-content: left;display: flex;width: 50%;"><img class="img-logo"
            src="../assets/LogoSOLMAQ.png" /></div>
        <div style="justify-content: right; display: flex; width: 50%;">
          <div class="user-dropdown d-flex align-items-center">
            <div class="btn-group dropdown-center">
              <button type="button" class="btn btn-custom d-flex align-items-center">
                <i class="fas fa-user me-2"></i>{{ Usuario }}
              </button>
              <button type="button" class="btn btn-custom dropdown-toggle dropdown-toggle-split w-auto"
                data-bs-toggle="dropdown" aria-expanded="false">
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu">
                <li>
                  <button class="btn-menu" @click="logOut">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="second-level">
        <button ref="inicio" class="btn" @click="jumpTo('home')">Inicio</button>
        <button v-show="visibleRoles" ref="roles" class="btn" @click="jumpTo('roles')">Roles</button>
        <button v-show="visibleUsuarios" ref="usuarios" class="btn" @click="jumpTo('usuarios')">Usuarios</button>
        <button v-show="visibleClientes" ref="clientes" class="btn" @click="jumpTo('clientes')">Clientes</button>
        <button v-show="visibleCatalogo" ref="catalogo" class="btn" @click="jumpTo('catalogo')">Catalogo</button>
        <button v-show="visibleRFQ" ref="rfq" class="btn" @click="jumpTo('rfq')">RFQ</button>
        <button v-show="visiblePedidos" ref="pedidos" class="btn" @click="jumpTo('pedidos')">Pedidos</button>
        <button v-show="visibleReportes" ref="reportes" class="btn" @click="jumpTo('reportes')">Reportes</button>
        <!-- Botón del carrito a la derecha -->
        <button v-show="visiblePedir" ref="carrito" class="btn carrito-btn" @click="jumpTo('carrito')"><img
            class="carrito-img" src="../assets/agregar-carrito.png" /></button>
      </div>
    </div>

    <div class="side"></div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  width: 95vw;
  height: 80px;
  align-items: center;
  color: white;
  background-color: white;
  border-bottom: 2px solid black;
  margin: auto;
  /* Centra el div horizontalmente */
  justify-content: space-between;
  /* Ajusta el espacio entre los elementos internos */
}

.second-level {
  display: flex;
  margin-left: 2%;
}

.container {
  width: 100%;
  display: flex;
}

.side {
  width: 10vw;
  background-color: white;
}

.brand {
  display: inherit;
  width: 50%;
  height: 100%;
  align-items: center;
}

.title {
  min-width: 100px;
  text-align: left;
  font-size: xx-large;
  padding-left: 50px;
}

.subtitle {
  text-align: left;
  padding-left: 10px;
  min-width: 160px;
}

.module {
  width: 50vw;
  text-align: right;
  padding-right: 50px;
  font-size: x-large;
}

.profile-btn {
  width: 120px;
  height: 45px;
  border-radius: 30px;
  border: 1px solid black;
}

.btn-menu {
  width: 140px;
  height: 35px;
  border: none;
  background-color: white;
  font-family: 'Barlow', sans-serif;
  font-size: 14px;
}

.btn {
  width: 100px;
  height: 35px;
  border: none;
  background-color: white;
}

.img-logo {
  width: 90px;
}

.btn:hover {
  width: 100px;
  height: 35px;
  border: none;
  background-color: #FFCA0A;
}

.dropdown-menu {
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-top: 0 !important;
  /* Eliminar margen superior */
}

.btn-custom {
  height: 40px;
  background-color: lightgray;
  border-radius: 30px;
  color: black;
  width: auto;
  text-align: center;
}

.btn-custom:hover {
  background-color: lightgray;
  border-color: black;
  color: black;
  height: 40px;
}

/* Asegura que el botón del carrito se quede a la derecha */
.carrito-btn {
  margin-left: auto;
  /* Empuja el botón del carrito a la derecha */
  margin-right: 3%;
  width: 50px !important;
  height: 35px;
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}

.carrito-btn:hover {
  width: 100px;
  height: 35px;
  border: none;
  background-color: white;
}

.carrito-img {
  width: 38px;
  height: auto;
}
</style>