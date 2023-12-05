import { defineStore } from "pinia";
import axios from "axios";

export const pedidosStore = defineStore("pedidos", {
    state: () => ({
        pedidos: [],
        idPedidoActual: null
    }),
    actions: {

        setPedido(idPedido) {

            this.idPedidoActual = idPedido;
            console.log(this.idPedidoActual)
        },

        getPedido() {
            console.log(this.idPedidoActual)
            return this.idPedidoActual;
        },

        async obtenerPedidos() {
            try {
                const res = await axios.get('http://localhost:4000/api/pedidos')
                return res;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async obtenerPedidoPorId(idPedido) {
            try {
                const res = await axios.get('http://localhost:4000/api/pedidos/' + idPedido)
                return res.data.body;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async agregarPedido(idPedido, idUsuario, fecha, fechaentrega, total) {
            try {
                const res = await axios.post('http://localhost:4000/api/pedidos', {
                    "idPedido": 0, "NoPedido": idPedido, idUsuario: idUsuario,
                    "FechaPedido": fecha, "FechaEntrega": fechaentrega, "Estado": 0, "Total": total
                })

                console.log(res)
                return;

            } catch (error) {
                console.log(error)
                return;

            }
        },

        async cambiarEstatus(idPedido, estatus){
            try {
                const res = await axios.post('http://localhost:4000/api/pedidos', {
                    "idPedido": idPedido, "Estado": estatus
                })
                
                console.log(res)
                return;

            } catch (error) {
                console.log(res)
                return;
            }
        }

    }
})