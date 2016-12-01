'use strict';
const electron = require('electron');
const {Menu, ipcMain, Tray} = require('electron')
const axios = require('axios');
const path = require('path')
const _ = require('lodash');
let tray = null

let locals = {}
var currentCourseId = 0;
const pug = require('electron-pug')({pretty: true}, locals)

const app = electron.app;
const apiBase = 'https://slate.sheridancollege.ca/d2l/api';

let user = {
    username: process.env['SLATE_USERNAME'],
    password: process.env['SLATE_PASSWORD']
}




// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

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
        height: 400,
        frame: false,
	});
    win.loadURL(`file://${__dirname}/views/index.pug`);
    win.toggleDevTools();
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
});

ipcMain.on('login', (event, username, password) => {

    let Nightmare = require('nightmare');
    let nightmare = Nightmare({ show: true })

    nightmare
        .viewport(0,0)
        .goto('https://slate.sheridancollege.ca/')
        .type('form [name=j_username]', username)
        .type('form [name=j_password]', password)
        .click('form [type=submit]')
        .wait(5000)
        .end()
        .cookies.get()
        .then(function (cookie) {
            axios.defaults.headers.common['Cookie'] = `d2lSessionVal=${cookie[3].value}; d2lSecureSessionVal=${cookie[4].value};`;
            console.log("Finish grabbing cookies")
            console.log(axios.defaults.headers.common['Cookie']);
            event.sender.send('login-reply', 'success');
        })
        .catch(function (error) {
            console.error('Faild to get Cookie');
        });
});

ipcMain.on('getCourseContent', (event, courseId) => {
    currentCourseId = courseId;
    console.log(`${apiBase}/le/1.10/${courseId}/content/toc`)
    axios.get(`${apiBase}/le/1.10/${courseId}/content/toc`).then((res) => {
        event.sender.send('getCourseContent-reply', res.data);
    });
});

ipcMain.on('getClasslist', (event, courseId=currentCourseId) => {
    axios.get(`${apiBase}/le/1.10/${courseId}/classlist/`).then((res) => {
        event.sender.send('getClasslist-reply', res.data);
    });
});

ipcMain.on('getCourses', (event, arg) => {
    axios.get(`${apiBase}/lp/1.10/enrollments/myenrollments/`).then((res) => {
        event.sender.send('getCourses-reply', _.filter(res.data.Items, ['OrgUnit.Type.Code', 'Course Offering']));
    });
});

ipcMain.on('getAlerts', (event, arg) => {

    var cheerio = require('cheerio');

    var result;
    var result_content = [];

    axios({
        url: 'https://slate.sheridancollege.ca/d2l/MiniBar/313983/ActivityFeed/GetAlerts?Category=1&_d2l_prc%24headingLevel=2&_d2l_prc%24scope=&_d2l_prc%24hasActiveForm=false&isXhr=true&requestId=3',
        method: 'get'
    }).then((res) => {
        result = JSON.parse(res.data.split('while(1);')[1]).Payload.Html;
        let $ = cheerio.load(result.replace(/\t|\r|\n/g, ''));
        let result_items = $('.d2l-datalist-item-content')
        result_items.each((index,item) => {
            result_content.push({ 'title': item.attribs.title });
        });

        event.sender.send('getAlerts-reply', result_content)
        console.log("Finish Grabbing Alerts")
    });


})
