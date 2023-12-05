import { defineStore } from "pinia";
import axios from "axios";

export const rfqStore = defineStore("rfq", {
    state: () => ({
        rfq: [],
        idRFQActual: null
    }),
    actions: {

        setRFQ(idRFQ) {

            this.idRFQActual = idRFQ;
            console.log(this.idRFQActual)
        },

        getRFQ() {
            console.log(this.idRFQActual)
            return this.idRFQActual;
        },

        async obtenerRFQ() {
            try {
                const res = await axios.get('http://localhost:4000/api/rfq')
                return res;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async obtenerRFQPorId(idRFQ) {
            try {
                const res = await axios.get('http://localhost:4000/api/rfq/' + idRFQ)
                return res.data.body;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },
        async cambiarEstatus(idRFQ, sumaCostos){
            try {
                const res = await axios.post('http://localhost:4000/api/rfq',{"idRFQ":idRFQ,
                "Estatus": 1, "CostoTotal": sumaCostos
               })
               console.log(sumaCostos)
               console.log(res)
                return ;
                
            } catch (error) {
                console.log(error)
                return ;
                
            }
        },

        async cambiarPedido(idRFQ){
            try {
                const res = await axios.post('http://localhost:4000/api/rfq',{"idRFQ":idRFQ,
                "pedido": 1
               })               
               console.log(res)
                return ;
                
            } catch (error) {
                console.log(error)
                return ;
                
            }
        },

        async agregarRFQ(idRFQ, idUsuario, fecha){
            try {
                const res = await axios.post('http://localhost:4000/api/rfq',{"idRFQ":0, "NoRFQ": idRFQ, idUsuario: idUsuario,
                "FechaRFQ":fecha, "Estatus":0, "pedido":0
               })
    
               console.log(res)
                return ;
                
            } catch (error) {
                console.log(error)
                return ;
                
            }
        }
    }
})