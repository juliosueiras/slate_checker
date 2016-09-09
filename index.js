'use strict';
const electron = require('electron');
const {Menu, Tray} = require('electron')
let db = require('diskdb');
let tray = null

const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

db = db.connect('./db', ['alerts', 'emails'])

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();

    var axios = require('axios');
    var cheerio = require('cheerio');

    var result;
    var result_content = [];

    axios({
        url: 'https://slate.sheridancollege.ca/d2l/MiniBar/313983/ActivityFeed/GetAlerts?Category=1&_d2l_prc%24headingLevel=2&_d2l_prc%24scope=&_d2l_prc%24hasActiveForm=false&isXhr=true&requestId=3',
        method: 'get',
        headers: {
            Cookie: "d2lSessionVal=RUHuxZ2zxGpHjF7TxwsUwaJWC; d2lSecureSessionVal=cVg4mqlVB1NcEEbiMixK2mTh1;" }
    }).then((res) => {
        result = JSON.parse(res.data.split('while(1);')[1]).Payload.Html;
        let $ = cheerio.load(result.replace(/\t|\r|\n/g, '')); 
        let result_items = $('.d2l-datalist-item-content')
        result_items.each((index,item) => { 
            result_content.push({ 'title': item.attribs.title });
        });

        db.alerts.save(result_content);
        console.log("Finish Grabbing Alerts")

    });

    tray = new Tray('./logo.jpg')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    tray.displayBalloon({ title: "Fucker" , content: "Fuck off"});

});
