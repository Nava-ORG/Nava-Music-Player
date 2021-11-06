const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron')
const windowSateKeeper = require('electron-window-state')
let mainWin
let tray
let status = 'پخش'

const createWindow = () => {
	let stateMainWindow = windowSateKeeper({
		defaultWidth: 900,
		defaultHeight: 650,
	})
	mainWin = new BrowserWindow({
		icon: './static/images/icon.png',
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

const setContext = () => {
	const contextMenu = Menu.buildFromTemplate([
		{
			label: status,
			click: () => mainWin.webContents.send('controller', 'play'),
		},
		{
			label: 'بعدی',
			click: () => mainWin.webContents.send('controller', 'next'),
		},
		{
			label: 'قبلی',
			click: () => mainWin.webContents.send('controller', 'prev'),
		},
	])
	tray.setContextMenu(contextMenu)
}

ipcMain.on('setStatus', (e, arg) => {
	status = arg
	setContext()
})

const createTray = () => {
	tray = new Tray('./static/images/icon.png')
	setContext()
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
	createTray()
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
