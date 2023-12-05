import { defineStore } from "pinia";
import axios from "axios";

export const catalogoStore = defineStore("catalogo",{
  state: ()=>({
    piezas: [],
    idPiezaActual:null
  }), 
  actions:{

    setPieza(idPieza){
       
        this.idPiezaActual = idPieza;
        console.log(this.idPiezaActual)
    },

    getPieza(){
        console.log(this.idPiezaActual)
        return this.idPiezaActual;
    },

    async obtenerPiezas(){
        try {
            const res = await axios.get('http://localhost:4000/api/catalogo')
            return res;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },    

    async obtenerPiezaPorId(idPieza){
        try {
            const res = await axios.get('http://localhost:4000/api/catalogo/'+idPieza)
            return res.data.body;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },

    async agregarPieza(pieza){
        try {            
            const res = await axios.post('http://localhost:4000/api/catalogo/',pieza)

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    async cambiarEstatus(pieza){
        try {
            const res = await axios.post('http://localhost:4000/api/catalogo',pieza)

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    //Trae TODOS las piezas que existen
    async obtenerPzas(){
        try {
            const res = await axios.get('http://localhost:4000/api/catalogo/pzas')
            return res;
        } catch (error) {
            console.log(error)
        }
    },

    async actualizarPieza(pieza){
        try {
            const res = await axios.post('http://localhost:4000/api/catalogo',pieza)
           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },    
  }  
})