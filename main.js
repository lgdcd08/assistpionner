console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clientModel = require('./src/models/Clientes.js')
const osModel = require('./src/models/Ordemdeserviço.js')
//Importação do pacote(biblioteca) (npm i jspdf)
const jsPDF = require('jspdf').jsPDF;


//Importação da biblioteca fs (nativa do JavaScript) para  manipulação de arquivos (no caso arquivos pdf)
const fs = require('fs')
const Clientes = require('./src/models/Clientes.js')

// Janela principal
let win
const createWindow = () => {
    // a linha abaixo define o tema (claro ou escuro)
    nativeTheme.themeSource = 'light' //(dark ou light)
    win = new BrowserWindow({
        width: 800,
        height: 600,
        //autoHideMenuBar: true,
        //minimizable: false,
        resizable: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })


    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')

    ipcMain.on('client-window', () => {
        clientWindow()
    })

    ipcMain.on('os-window', () => {
        osWindow()
    })
}
// Janela sobre
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    let about
    if (main) {
        // Criar a janela sobre
        about = new BrowserWindow({
            width: 360,
            height: 220,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true
        })
    }
    //carregar o documento html na janela
    about.loadFile('./src/views/sobre.html')
}
// Janela cliente
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 680,
            //autoHideMenuBar: true,
            //resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center() //iniciar no centro da tela   
}


let os
function osWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        os = new BrowserWindow({
            width: 1010,
            height: 720,
            //autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true
        })
    }
    os.loadFile('./src/views/os.html')
    os.center()
}

// Iniciar a aplicação
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
    let conectado = await conectar()
    // se conectado for igual a true
    if (conectado) {
        // enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s para sincronizar a nuvem
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500) //500ms        
    }
})

// IMPORTANTE ! Desconectar do banco de dados quando a aplicação for encerrada.
app.on('before-quit', () => {
    desconectar()
})

// template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            { label: 'Clientes', click: () => clientWindow() },
            { label: 'OS', click: () => osWindow() },
            { type: 'separator' },
            { label: 'Sair', click: () => app.quit(), accelerator: 'Alt+F4' },
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {
                label: 'Relatórios',
                click: () => relatorioClientes()
            },
            { label: 'OS abertas' },
            { label: 'OS concluídas' }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do desenvolvedor',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]



//======================================

//=============Relatorio de clientes================

async function relatorioClientes() {
    try {
        //Passo 1: consultar banco de dados e obter a listagem de clientes cadastrados por ordem alfabética
        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        //teste de recebimento de listagem de cliemtes
        console.log(clientes)
        //Passo 2: Formatação do documento pdf 
        const doc = new jsPDF('p', 'mm', 'a4')  //l significa landscape, p significa fola de pe , senao d de deitada, mm são milimetros e a4 é o padrao
        //inserir imagem no documento pdf 
        //imagePath (é uma constante criada para gerar o mainho da imagem que será inserida no pdf)
        //imageBase64 (é o uso da biblioteca fs para çler o arquivo no formato png) Sempre converter as imagens para png

        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });  // Aqui já está certo
        doc.addImage('data:image/png;base64,' + imageBase64, 'PNG', 5, 8);
        // definir o tamanho da fonte (tamanho equivalente ao word)  (Folha A4 210mm x 297mm)
        doc.setFontSize(16)
        // escrever um texto (título)
        doc.text("Relatório de clientes", 18, 50) // x,y (mm)
        //inserir a data atual no relatório
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 150, 10)
        //variavel de apoio na formatação
        doc.setFontSize(8)
        let y = 60
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("E-mail", 150, y)
        y += 5
        // desenhar uma linha de 0.5
        doc.setLineWidth(0.5) //expessura da linha
        doc.line(10, y, 200, y) //1-0(inicio ----20- (fim))

        //renderizar os clientes cadastrados no banco
        y += 10 // espaçamento da linha
        //percorrer o vetor clientres(obtido do banco) usando o laço forEach (para percorrer ao laço for)
        clientes.forEach((c) => {
            // adicionar outra página se a folha inteira for preenchida (estratégia é saber o tamanho da folha)
            //a folha A4 y = 297 mm
            if (y > 280) {
                doc.addPage()
                y = 20 //resetar a variavel y
                //redesenhar o cabeçalho para cada folha extra no cadastro
                doc.text("Nome", 14, y)
                doc.text("Telefone", 80, y)
                doc.text("E-mail", 140, y)
                y += 5
                // desenhar uma linha de 0.5
                doc.setLineWidth(0.5) //expessura da linha
                doc.line(10, y, 200, y) //1-0(inicio ----20- (fim))
                y += 10
            }

            doc.text(c.nomeCliente, 14, y),
                doc.text(c.emailCliente, 80, y),
                doc.text(c.emailCliente || "N/A", 150, y)
            y += 10 //quebra de linha
        })


        // Adicionar numeração automática em paginas
        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${paginas}`, 105, 290, { aling: 'center' })
        }

        // Definir o caminho do arquivo temporário, nao vai ser salvo no banco de dados, apenas para imprimir
        const tempDir = app.getPath('temp')
        const filePatch = path.join(tempDir, 'clientes.pdf')

        //salvar temporariamente o arquivo
        doc.save(filePatch)
        // abrir o arquivo no aplicativo padrão de leitura pdf no computador do usuário
        shell.openPath(filePatch)



    } catch (error) {
        console.log(error)
    }


}
//=============FIM Relatorio de clientes================
//== OS CRUD CREATE

// recebimento do objeto que contem
ipcMain.on('new-os', async (event, os) => {
    // IMPORTANTE!! teste do passo dois
    console.log(os)
    // Cadastrar a estrutura de dados do banco de dados Mongodb
    //ATENÇÃO !! os atributos deve ser identicos ao modelo de dados OS.js
    //
    try {
        //cria uma nova estrutura de dados usando classe  modelo
        const newOs = new OSModel({
            statusOS: os.orderStatus,
            equipamento_modelo: os.orderType,
            numerodeserieOS: os.ordernumero,
            problemarelatadoOS: os.problemDescription,// Ajuste o nome da variável conforme seu modelo
            tecnicoOS: os.name,
            diagnosticotecnicoOS: os.relatoriotecnico,
            pecasOS: os.pecas,
            precoOS: os.orderPrice
        })
        //salvar os dados Clientes no banco de dados
        await newOs.save()
    }
        catch{
            console.log(error)
        }
    })
        
//== FIM - OS - CRUD CREATE
