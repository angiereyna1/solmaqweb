import { defineStore } from "pinia";
import axios from "axios";

export const clientesStore = defineStore("clientes",{
  state: ()=>({
    clientes: [],
    idClienteActual:null
  }), 
  actions:{
    
    //metodos para recibir cliente y guardar el que se esta modificando
    setCliente(idCliente){
        this.idClienteActual = idCliente
    },

    getCliente(){
        return this.idClienteActual
    },

    async obtenerClientes(){
        try {
            const res = await axios.get('http://localhost:4000/api/clientes')
            return res;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },

    async obtenerClientePorId(idCliente){
        try {
            const res = await axios.get('http://localhost:4000/api/clientes/'+idCliente)
            return res.data.body;
            
        } catch (error) {
            console.log(error)
            throw(error);
        }
    },
    
    async agregarClient(cliente){
        try {            
            const res = await axios.post('http://localhost:4000/api/clientes/',cliente)

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },

    async actualizarClient(cliente){
        try {
            const res = await axios.post('http://localhost:4000/api/clientes',cliente)
           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },    

    async cambiarEstatus(idCliente, estado){
        try {
            const res = await axios.post('http://localhost:4000/api/clientes',{"idCliente":idCliente,
            "Activo": estado
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    
    async eliminarCliente(idCliente){
        try{

        const res = await axios.put('http://localhost:4000/api/clientes',{"idCliente":idCliente
       })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    //Trae TODOS los RFC que existen
    async obtenerRFC(){
        try {
            const res = await axios.get('http://localhost:4000/api/clientes/rfcs')
            return res;
        } catch (error) {
            console.log(error)
        }
    }
  } 
})