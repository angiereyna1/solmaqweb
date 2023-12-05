import { defineStore } from "pinia";
import axios from "axios";

export const materialesStore = defineStore("materiales", {
  state: () => ({
    materiales: [],
    idMaterialActual: null
  }),
  actions: {

    setMaterial(idMaterial) {

      this.idMaterialActual = idMaterial;
      console.log(this.idMaterialActual)
    },

    getMaterial() {
      console.log(this.idMaterialActual)
      return this.idMaterialActual;
    },

    async obtenerMateriales() {
      try {
        const res = await axios.get('http://localhost:4000/api/materiales')
        return res;

      } catch (error) {
        console.log(error)
        throw (error);
      }
    },

    async obtenerUnMaterial(idMaterial) {
      try {
        if (idMaterial == "") {
          throw error
        }
        const res = await axios.get('http://localhost:4000/api/materiales/' + idMaterial)
        return res.data.body;
      } catch (error) {
        throw error
      }
    }
  }
})