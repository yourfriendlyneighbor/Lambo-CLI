const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path')

app.on('ready', () => {
    var mainWindow = new BrowserWindow({
        name: 'Lambo',
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon/png/64x64.png')
    })
    mainWindow.setMenu(null);
    mainWindow.loadURL('file://' + __dirname + '/index.html')

    mainWindow.webContents.openDevTools({detach:true})
})
