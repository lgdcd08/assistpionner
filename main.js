console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clientModel = require('./src/models/Clientes.js')

//Importação do pacote(biblioteca) (npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

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
            { label: 'Sair', click: () => app.quit(), accelarator: 'Alt+F4' },
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {label: 'Relatórios', 
                click: () =>relatorioClientes()
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
// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('client-window', () => {
    clientWindow()
})

ipcMain.on('os-window', () => {
    osWindow()
})

//======================================
//== CLIENTES CRUD CREATE

// recebimento do objeto que contem
ipcMain.on('new-client', async (event, client) => {
    // IMPORTANTE!! teste do passo dois
    console.log(client)
    // Cadastrar a estrutura de dados do banco de dados Mongodb
    //ATENÇÃO !! os atributos deve ser identicos ao modelo de dados clientes.js
    //
    try {
        //cria uma nova estrutura de dados usando classe  modelo
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli,
            emailCliente: client.emailCli,
            foneCliente: client.foneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.logradouroCli,
            numeroCliente: client.numberCli,
            complementoCliente: client.complementCli,
            bairroCliente: client.neighborhoodClient,
            cidadeCliente: client.cityCli
        })
        //salvar os dados Clientes no banco de dados
        await newClient.save()

        // Mensagem de confirmação ...primeiro slvar para depois confirmar
        dialog.showMessageBox({
            //customização
            type: 'info',
            title: "Aviso", // titulo da caixa de mensagem
            message: "Cliente cadastrado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            //ação ao pressionar o botão (result = 0)
            if (result.response === 0) {
                //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas(rótulo 'reset-form' do preload.js)
                event.reply('reset-form') //menda o pedido para o renderizador limpar o formulario
            }

        })
    } catch (error) {
        //cath trata as exceções
        //se o código de erro for 1100 (cpf duplicado) enviar uma mensagem ao usuário
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF cadastradado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    //limpar a caixa imput do cpf,focar essa caixa e deixar a borda em vermelho

                }
            })
        }
        console.log(error)
    }
})

//== FIM - CLIENTES - CRUD CREATE

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
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8) //(5mm, 8 mm) x, y
        // definir o tamanho da fonte (tamanho equivalente ao word)  (Folha A4 210mm x 297mm)
        doc.setFontSize(16)
        // escrever um texto (título)
        doc.text("Relatório de clientes", 14, 45) // x,y (mm)
        //inserir a data atual no relatório
        const dataAtual = new Date().toLocaleDateString('pt-Br')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 165, 10)
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


        // definir o tamanho da fonte (tamanho equivalente ao word)
        doc.setFontSize(16)
        // escrever um texto (título)
        doc.text("Relatório de clientes", 14, 20) // x,y (mm)

        
        // desenhar uma linha de 0.5
        doc.setLineWidth(0.5) //expessura da linha
        doc.line(10, y, 200, y) //1-0(inicio ----20- (fim))

         doc.text(c.nomeCliente, 14, y),
            doc.text(c.emailCliente, 80, y),
            doc.text(c.emailCliente || "N/A", 150, y)
            y += 10 //quebra de linha
        })


        // Adicionar numeração automática em paginas
        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i<= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 105, 290, {aling:'center'})
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

//=============Fim relatorio de clientes===========================