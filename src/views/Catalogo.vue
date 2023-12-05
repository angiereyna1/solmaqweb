<script setup>
import { ref, computed, onMounted } from "vue";
import { catalogoStore } from "../stores/catalogo"
import { permisosRolesStore } from '../stores/permisosRoles';
import { usuariosStore } from "../stores/usuarios";
import { loginStore } from "../stores/login";
import cabecera from "../components/Menu.vue";

const { obtenerPermisos } = permisosRolesStore();
const { getUser } = loginStore();
const { obtenerIdPorUser } = usuariosStore();
const { obtenerPiezas } = catalogoStore();

const visibleGestionar = ref("");
const Usuario = getUser();

const piezasArray = ref([]);
const piezasDesplegadas = ref([]);
const piezaExistente = ref(false);

let nombre;

onMounted(async () => {
    try {
        // Carga piezas activos por defecto al entrar en la página
        filtrarPiezas(1);
    
        // Permisos
        const idRol = await obtenerIdPorUser(Usuario);
        console.log(Usuario);
        console.log(idRol);
        const permisos = await obtenerPermisos(idRol);
        console.log(permisos)
        permisos.includes("Gestionar Catalogo") ? visibleGestionar.value = true : visibleGestionar.value = false;
    } catch (error) {
        console.error(error);
    }
});

const consultarCatalogo = async (activo) => {
    try {
        const response = await obtenerPiezas(activo);
        const piezas = response.data.body.filter(pieza => pieza.Activo === activo);
        
        piezasArray.value = piezas;
        piezasDesplegadas.value = piezasArray.value;
    } catch (error) {
        console.error(error);
    }
};


const filtrarPiezas = (activo) => {
    consultarCatalogo(activo);
};

const botonesClases = computed(() => {
    return {
        activos: piezasDesplegadas.value.some(pieza => pieza.Activo === 1),
        inactivos: piezasDesplegadas.value.some(pieza => pieza.Activo === 0)
    };
});

// Función para actualizar la tabla al hacer una consulta
function actualizarTabla(nombre) {
    if (nombre.trim() === "") {
        piezaExistente.value = piezasArray.value;
        piezasDesplegadas.value = piezasArray.value; // Restablece la tabla cuando el campo de búsqueda está vacío
    } else {
        piezasDesplegadas.value = piezasArray.value.filter(pieza =>
            pieza.NoPieza.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}
</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="catalogo"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <!-- Primera parte del contenido: Barra de búsqueda -->
        <div class="buscador">
            <div style="justify-content: left;display: flex;width: 50%; margin-bottom: 15px;">
                <div class="container-fluid custom-container">
                    <div class="input-group mb-3">
                        <input id="buscador" type="text" class="form-control form-control-sm rounded-pill"
                            style="height: 40px; padding-right: 30px; padding-left: 30px; position: relative;"
                            placeholder="Buscar" v-model="nombre" @input="actualizarTabla(nombre)" />
                        <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%);">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div style="justify-content: right; display: flex; width: 50%; margin-bottom: 15px;">
                <div>
                    <router-link to="catalogo/agregarPieza" style="text-decoration: none;">
                        <button v-show="visibleGestionar" class="btn btn-custom btn-sm mt-2 no-margin-top" type="submit">
                            <b>Agregar &nbsp;</b><i class="fas fa-plus fa-plus-icon"></i>
                        </button>
                    </router-link>
                </div>
            </div>
        </div>
        <!-- Segunda parte del contenido: Tabla de consulta -->
        <div>
            <div class="table-container">
                <h1 class="titulo"><b>Piezas de Catálogo </b></h1>
                <div class="botones" v-show="visibleGestionar">
                    <button @click="filtrarPiezas(1)"
                        :class="{ 'btn btn-verde': botonesClases.activos, 'btn btn-gris': !botonesClases.activos }">Activos</button>
                    <button @click="filtrarPiezas(0)"
                        :class="{ 'btn btn-rojo': botonesClases.inactivos, 'btn btn-gris': !botonesClases.inactivos }">Inactivos</button>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="row">
                <div class="col-md-3 col-sm-6 mx-3" style="max-width: 250px;" v-for="pieza in piezasDesplegadas"
                    :key="pieza.idPieza">
                    <router-link :to="{ name: 'detallesPieza', params: { id: pieza.idPieza } }"
                        class="router-link-no-underline">
                        <div class="product-grid d-flex flex-column align-items-center justify-content-center">
                            <div class="product-image">
                                <a href="#" class="image">
                                    <img class="pic-1" :src="`http://localhost:4000/images/${pieza.Foto}`"
                                        alt="Imagen de la pieza">
                                </a>
                            </div>
                            <div class="product-content">
                                <h3 class="title"><b>{{ pieza.NoPieza }}</b></h3>
                                <div class="price"><b>${{ pieza.PrecioUnitario }}</b></div>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contenido {
    margin: 20px;
}

.product-grid {
    background-color: #f4f4f4;
    font-family: 'Montserrat', sans-serif;
    text-align: left;
    margin-bottom: 30px;
    border-radius: 10px;    
    border: 1px solid #ccc;    
    /* Asegura que el contenido no sobresalga del card */
    overflow: hidden;
    /* Agrega una transición suave para cambios de estilo */
    transition: all 0.3s ease;    
    width: 250px;    
    height: 300px;    
    padding: 0;    
    margin: 0;    
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
}

.product-grid .product-image {
    max-width: 250px;
    max-height: 220px;
    vertical-align: top;    
    transition: all 0.3s ease 0s;
}

.pic-1 {
    width: 250px;
    height: 220px;
}

.product-grid .product-content {
    text-align: left !important;
    width: 240px;
    height: 80px !important;
    padding: 15px 15px;
}

.product-grid .title {
    font-size: 18px;
    font-weight: 500;
    text-transform: capitalize;
    margin: 0 0 8px;
}

.product-grid .title a {
    color: #585858;
    transition: all 0.3s ease 0s;
    /* Elimina el subrayado del enlace en el título */
    text-decoration: none;
}

.product-grid .price {
    /* Elimina el subrayado del precio */
    text-decoration: none;
    font-size: 15px;
}

.router-link-no-underline {
    text-decoration: none;
    color: inherit;    
}

.table-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2%;
}

.titulo {
    /* Establece el tipo de letra como Barlow */
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;    
}

.botones button {
    margin-right: 10px;    
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: center;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    height: auto;
    width: 95%;
}

.buscador {
    display: flex;
    align-items: center;    
    justify-content: space-between;
    border-bottom: 1px solid black;
    margin-bottom: 20px;
}

.btn-custom {
    background-color: #FFCA0A;
    color: white;
    border-color: #FFCA0A;
    height: 40px;
    width: 120px;    
    border-radius: 25px;
    font-family: 'Barlow', sans-serif;
}

.no-margin-top {
    margin-top: 0 !important;
}

.custom-container {
    height: 40px !important;    
}

.custom-container .input-group {
    height: 100%;    
}

.custom-container .form-control {
    height: 100%;    
}

.fa-plus-icon {
    font-weight: bold;
    transform: scale(1.2);    
}

.btn-verde {
    background-color: #E5FFE1;
    color: green;
    font-weight: bold;    
    width: 90px;
    border: none;
}

.btn-rojo {
    background-color: #FFE1E1;
    color: red;
    font-weight: bold;    
    width: 90px;
    border: none;
}

.btn-gris {
    background-color: #f4f4f4;
    color: black;
    width: 90px;
    border: none;
}

.btn-verde:focus,
.btn-rojo:focus,
.btn-gris:focus {
    /* Elimina el contorno y la sombra al hacer clic */
    outline: none;
    box-shadow: none;    
}
</style>
