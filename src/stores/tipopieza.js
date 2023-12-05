import { defineStore } from "pinia";
import axios from "axios";

export const tipoStore = defineStore("tipos", {
  state: () => ({
    tipos: [],
    idTipoPiezaActual: null
  }),
  actions: {

    setTipo(idTipoPieza) {

      this.idTipoPiezaActual = idTipoPieza;
      console.log(this.idTipoPiezaActual)
    },

    getTipo() {
      console.log(this.idTipoPiezaActual)
      return this.idTipoPiezaActual;
    },

    async obtenerTipos() {
      try {
        const res = await axios.get('http://localhost:4000/api/tipopieza')
        return res;

      } catch (error) {
        console.log(error)
        throw (error);
      }
    },

    async obtenerUnTipo(idTipoPieza) {
      try {
        if (idTipoPieza == "") {
          throw error
        }
        const res = await axios.get('http://localhost:4000/api/tipopieza/' + idTipoPieza)
        return res.data.body;
      } catch (error) {
        throw error
      }
    }
  }
})