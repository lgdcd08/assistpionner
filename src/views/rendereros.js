const foco = document.getElementById('inputSearchClient');
 
 document.addEventListener('DOMContentLoaded', () => {
     foco.focus();
        // btnUpdate.disabled = true
         // btnDelete.disabled = true
 });
let frmOs =document.getElementById('FrmOs')
let statusOS = document.getElementById('osStatus')
let equipamentomodelo = document.getElementById('inputEquipamento')
let numerodeserieOS = document.getElementById('inputSerial')
let problemarelatadoOS = document.getElementById('inputProblemaRelatadoOs')
let tecnicoOS = document.getElementById('inputTecnico')
let diagnosticotecnicoOS = document.getElementById('inputDefeito')
let pecasOS = document.getElementById('inputpecas')
let precoOS = document.getElementById('inputValor')




//=====================================================
//==========CRUD CREATE/UPDATE=========================

//Evento associado ao botão submit(uso das validações em html)
frmOs.addEventListener('submit', async (event) => {
    //evitar o comportamento padrão do submit que é enviar os dados
    // do formulario e reiniciar o documento html
    event.preventDefault()

    console.log(statusOS.value, equipamentomodelo.value,numerodeserieOS.value, problemaRelatadoOS.value,tecnicoOS.value,diagnosticotecnicoOS.value,pecasOS.value,precoOS.value)

 
        const Os = {
            statusOS:statusOS.value,
            equipamentomodeloOS: equipamentomodelo.value,
            numerodeserieOS: numerodeserieOS.value,
            problemaRelatadoOS: problemarelatadoOS.value,
            tecnicoOS: tecnicoOS.value,
            diagnosticotecnicoOS:diagnosticotecnicoOS.value,
            pecasOS: pecasOS.value,
            precoOS: precoOS.value,
        }
        

     // Enviar ao main o objeto client- (Passo 2: Fluxo)
     api.newOs(Os)
})
