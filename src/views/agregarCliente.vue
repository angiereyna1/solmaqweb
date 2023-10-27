<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../router";
import { clientesStore } from "../stores/clientes";

import cabecera from "../components/Menu.vue";

const { obtenerClientes, cambiarEstatus, eliminarCliente, setCliente } = clientesStore();

const clientesIds = ref({});
const clientes = ref([]);
const clientesArray = ref([]);
const clientesDesplegados = ref([]);
const buscador = ref({});
const idClienteCambiarEstatus = ref();
const estadoCambiarEstatus = ref(null);
const nuevoCliente = ref(""); // variable para almacenar el nuevo cliente
const campoVacio = ref(false);
const clienteExistente = ref(false);

const usuariosIds = ref({});
const usuarios = ref([]);
const usuariosArray = ref([]);
const usuariosDesplegados = ref([]);

let modalConfirmacion;
let nombre;


</script>

<template>
<!-- Cabecera -->
<cabecera interfaz="clientes"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Crear Nuevo Cliente </b></h1>
        <div>
            
        </div>
    </div>

</template>

<style scoped>
.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: left;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    height: 450px;
    width: 70%;
}

.titulo {
    /* Establece el tipo de letra como Barlow */
    font-family: 'Barlow', sans-serif;    
    font-size: 30px;
    margin-right: 20px;    
    margin-left: 30px;
    margin-top: 1%;
    
}
</style>