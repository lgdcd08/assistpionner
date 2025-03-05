/**
 * arquivo de pré carregamento(mais desempenho) e reforço de segurança na comuninicação entre processos (IPC)
 * 
 */

//IMPORTAÇÃO DOS RECURSOS DO FRAMEWORK ELECTRON
// contextbridge(segurança) ipcRendeer (comunicação)
const { contextBridge, ipcRenderer} = require('electron')

//expor (autorizar a comunicaao entre processos)
contextBridge.exposeInMainWorld('api',{
    clientWindow:() => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window')
})