/**
 * arquivo de pré carregamento(mais desempenho) e reforço de segurança na comuninicação entre processos (IPC)
 * 
 */

//IMPORTAÇÃO DOS RECURSOS DO FRAMEWORK ELECTRON
// contextbridge(segurança) ipcRendeer (comunicação)
const { contextBridge, ipcRenderer} = require('electron')

// Enviar ao main um pedido para conexão com o banco de dados e troca do ícone no processo de rendirzação (index.html - renderer.html)
ipcRenderer.send('db-connect')

//expor (autorizar a comunicaao entre processos)
contextBridge.exposeInMainWorld('api',{
    clientWindow:() => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message)
})