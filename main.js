const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron')
const windowSateKeeper = require('electron-window-state')
let mainWin

const createWindow = () => {
	let stateMainWindow = windowSateKeeper({
		defaultWidth: 900,
		defaultHeight: 650,
	})
	mainWin = new BrowserWindow({
		width: stateMainWindow.width,
		height: stateMainWindow.height,
		'minWidth': stateMainWindow.width,
		'minHeight': stateMainWindow.height,
		frame: false,
		webPreferences: {
			nodeIntegration: true,
		},

	})
	mainWin.loadFile('./views/index.html')


	stateMainWindow.manage(mainWin)
	mainWin.show()

}






const createMenu = () => {
	const template = [
		{
			label: 'File',
			submenu: [
				{
					label: 'Open',
					click: () => mainWin.webContents.send('openFiles'),
				},
			],
		},
	]
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

app.on('ready', () => {
	createWindow()
	createMenu()
})

ipcMain.on('maximize', () =>{
    let browserWindow = BrowserWindow.getFocusedWindow();

    browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize();
})
ipcMain.on('minimize', function () {
	let browserWindow = BrowserWindow.getFocusedWindow();
	browserWindow.minimize();
});
