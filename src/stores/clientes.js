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
        return this.idUsuarioActual
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
    
    async agregarCliente(nombreEmpresa, rfc, calle, numero, colonia, cp){
        try {
            const res = await axios.post('http://localhost:4000/api/clientes',{"idCliente":0,
            "RazonSocial":nombreEmpresa, "RFC": rfc, "Calle": calle, "Numero":numero, "Colonia":colonia,"CP":cp, "Activo":1
           })

           console.log(res)
            return ;
            
        } catch (error) {
            console.log(error)
            return ;
            
        }
    },
    async actualizarCliente(idCliente, nombreEmpresa, rfc, calle, numero, colonia, cp){
        try {
            const res = await axios.post('http://localhost:4000/api/clientes',{"idCliente":idCliente,
            "RazonSocial":nombreEmpresa, "RFC": rfc, "Calle": calle, "Numero":numero, "Colonia":colonia,"CP":cp
           })

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
    }   
  } 
})