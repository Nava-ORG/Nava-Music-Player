'use strict';

const
    electron = require('electron'),
    { ipcMain } = require('electron'),

    app = electron.app,
    BrowserWindow = electron.BrowserWindow;


let mainWindow;


const createWindow = () =>
{
    mainWindow = new BrowserWindow(
        {
            title: 'Nava Music Player',
            'accept-first-mouse':true,
            width: 900,
            height: 650,
            'minWidth': 400,
            'minHeight': 300,
            frame: false,
            icon: __dirname+'/img/icon.png',
            webPreferences:
                {
                    nodeIntegration: true,
                    contextIsolation: false
                }
        });

    mainWindow.loadURL(`file://${__dirname}/template/player.html`)

    mainWindow.setResizable(true)

    mainWindow.on('closed', () =>
    {
        mainWindow = null
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit()
    }
})

app.on('activate',  () =>
{
    if (mainWindow === null)
    {
        createWindow()
    }
})

ipcMain.on('maximize', () =>
{
    let browserWindow = BrowserWindow.getFocusedWindow();

    browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize();
})

ipcMain.on('minimize', () =>
{
    let browserWindow = BrowserWindow.getFocusedWindow();
    browserWindow.minimize();
});