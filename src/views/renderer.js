/**
 * PROCESSO DE RENDERIZAÇAO
 * TELA PRINCIPAL
 */

console.log("Processo de Rendenização")

function clientes() {
   //console.log("teste do botão cliente")
   api.clientWindow()
}
function os() {
    //console.log("teste do botão os")
    api.osWindow()
}
// Troca do ícone do banco de dados (usando a api do preload.js)
api.dbStatus((event, message) => {
    //teste do recebimento da mensagem do main
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})
