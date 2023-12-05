import { defineStore } from "pinia";
import axios from "axios";

export const detallePedidoStore = defineStore("detallePedido", {
    state: () => ({
        detallePedido: [],
        idDetalleActual: null
    }),
    actions: {

        setDetalle(idDetalle) {

            this.idDetalleActual = idDetalle;
            console.log(this.idDetalleActual)
        },

        getDetalle() {
            console.log(this.idDetalleActual)
            return this.idDetalleActual;
        },

        async obtenerDetalles() {
            try {
                const res = await axios.get('http://localhost:4000/api/detallesPedidos')
                return res;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async obtenerDetallePorId(idDetalle) {
            try {
                const res = await axios.get('http://localhost:4000/api/detallesPedidos/' + idDetalle)
                return res.data.body;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async obtenerPorPedido(idPedido) {
            try {
                const res = await axios.post('http://localhost:4000/api/detallesPedidos/pedidoid', { "idPedido": idPedido })
                // console.log(res.data.body)
                return res;
            } catch (error) {
                console.log(error)
            }
        },

        async agregarDetalles(pedido) {
            try {
                const res = await axios.post('http://localhost:4000/api/detallesPedidos',pedido)

                console.log(res)
                return;

            } catch (error) {
                console.log(error)
                return;

            }
        },
    }
})