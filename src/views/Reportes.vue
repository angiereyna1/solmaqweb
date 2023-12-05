<script setup>
import { ref, computed, onMounted } from "vue";
import cabecera from "../components/Menu.vue";

const tipoSeleccionado = ref("Seleccionar tipo de reporte");
const fechaInicio = ref("");
const fechaFin = ref("");

const limpiarCampos = () => {
    tipoSeleccionado.value = "Seleccionar tipo de reporte";
    fechaInicio.value = "";
    fechaFin.value = "";
};

</script>

<template>
    <!-- Cabecera -->
    <cabecera interfaz="reportes"></cabecera>
    <!-- Contenido -->
    <div class="contenido mx-auto">
        <h1 class="titulo"><b>Generar reporte </b></h1>
        <div class="row">
            <div class="col">
                <label for="tipoReporte" class="form-label">Tipo de Reporte</label>
                <select class="form-select input-f inptElement form-color" aria-label="Default select example"
                    v-model="tipoSeleccionado" required id="tipoReporte">
                    <option>Reporte Estatus</option>
                    <option>Reporte Costos</option>
                </select>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col">
                <label for="inicio" class="form-label">Fecha Inicio</label>
                <input type="date" v-model="fechaInicio" class="form-control form-color" id="inicio" />
            </div>
            <div class="col">
                <label for="fin" class="form-label">Fecha Fin</label>
                <input type="date" v-model="fechaFin" class="form-control form-color" id="fin" />
            </div>
        </div>
        <div class="botones">
            <button class="btn btn-cancelar" @click="limpiarCampos">Limpiar</button>
            <button class="btn btn-primary btn-amarillo" type="submit">
                Generar Reporte
            </button>
        </div>
    </div>
</template>

<style scoped>
.titulo {
    font-family: 'Barlow', sans-serif;
    font-size: 30px;
    margin-right: 20px;
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: left;
}

.contenido {
    margin-top: 1.5%;
    margin-left: 8%;
    margin-right: 8%;
    text-align: left;
    background-color: white;
    border-radius: 20px;
    border: 1px solid gray;
    padding: 20px;
    padding-bottom: 50px;
    width: 70%;
    height: auto;
}

.row {
    margin-left: 20px;
}

.form-color {
    background-color: #f4f4f4;
    width: 400px;
    border-color: #afafaf;
}

.btn-cancelar {
    border-radius: 10px;
    /* Establece el borde redondo */
    background-color: white;
    color: red;
    border: 2px solid red;

}

.btn-amarillo {
    background-color: #FFCA0A;
    border: 2px solid #FFCA0A;
    color: black;
    width: 150px;
    height: 40px;
    border: none;
}

.botones {
    margin-top: 25px;
    margin-right: 30px;
    text-align: right;
}

.botones button {
    margin-top: 10px;
    margin-left: 10px;
}
</style>