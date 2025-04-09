//importação dos recursos do framework mongoose
const Module = require('module');
//importação dos recursos do framework mongoose
const {model , Schema} = require('mongoose')


// criação da estrutura da coleção clientes

    const osSchema = new Schema({
        statusOS: {
          type: String
          
        },
        equipamentoModelo: {
          type: String,
          required: true,
        },
        numerodeSerie:{
            type: String,
            unique: true, // garante que o numero de série é unico
        },
        problemaRelatado: {
            type: String,
            required: true, // garante que o proiblema seja informado
        },
        diagnosticoTecnico: {
            type:String,
            require: true,
        },
        tecnico:{
            type:String,
            require: true,
        },  
        valor:{
            type:String,
            require: true,
        },
    },{versionKey:false})
        
            

        
        

//Exportar o modelo do banco de dados
//OBS: "ordem_serviços" será o nome da coleção no MongoDB
module.exports = model('os',osSchema);
   
    
