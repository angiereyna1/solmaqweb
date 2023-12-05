import { defineStore } from "pinia";
import axios from "axios";

export const piezasrfqStore = defineStore("piezasrfq", {
    state: () => ({
        piezasrfq: [],
        idPiezaRFQActual: null
    }),
    actions: {

        setpiezaRFQ(idPiezaRFQ) {

            this.idPiezaRFQActual = idPiezaRFQ;
            console.log(this.idPiezaRFQActual)
        },

        getPiezaRFQ() {
            console.log(this.idPiezaRFQActual)
            return this.idPiezaRFQActual;
        },

        async obtenerpiezaRFQ() {
            try {
                const res = await axios.get('http://localhost:4000/api/piezasrfq')
                return res;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },

        async obtenerpiezaRFQPorId(idPiezaRFQ) {
            try {
                const res = await axios.get('http://localhost:4000/api/piezasrfq/' + idPiezaRFQ)
                return res.data.body;

            } catch (error) {
                console.log(error)
                throw (error);
            }
        },
        async obtenerPorRFQ(idRFQ){
            try {
                const res = await axios.post('http://localhost:4000/api/piezasrfq/rfqid',{"idRFQ":idRFQ})
                // console.log(res.data.body)
                return res;
            } catch (error) {
                console.log(error)
            }
        },
        async agregarPiezas(noPiezaRFQ, idRFQ, idTipoPieza, idMaterial, Altura, Espesor, Largo, Diametro, Cantidad, Comentarios){
            try {
                const res = await axios.post('http://localhost:4000/api/piezasrfq',{"idPiezaRFQ":0,
                "NoPiezaRFQ":noPiezaRFQ, "idRFQ": idRFQ, "idTipoPieza":idTipoPieza, "idMaterial": idMaterial, "Altura": Altura, "Espesor":Espesor, "Largo":Largo, "Diametro":Diametro,"Cantidad":Cantidad, "Comentarios":Comentarios
               })
    
               console.log(res)
                return ;
                
            } catch (error) {
                console.log(error)
                return ;
                
            }
        },
        async actualizarCostos(idPiezaRFQ, costo){
            try {
                const res = await axios.post('http://localhost:4000/api/piezasrfq',{"idPiezaRFQ":idPiezaRFQ,
                "CostoUnitario":costo
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