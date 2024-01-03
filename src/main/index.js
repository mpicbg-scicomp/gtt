import { app, BrowserWindow, session, dialog } from 'electron' // eslint-disable-line
import { autoUpdater } from 'electron-updater';

require('@electron/remote/main').initialize();

const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 580,
    useContentSize: true,
    width: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // mainWindow.webContents.openDevTools();
  require('@electron/remote/main').enable(mainWindow.webContents);

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create the Application's main menu
  require('./menu/mainmenu');

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       'Content-Security-Policy': ['script-src \'*\' \'unsafe-inline\' \'unsafe-eval\' http://localhost:9080'],
  //     },
  //   });
  // });
  require('electron-store').initRenderer();
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.' + info); // eslint-disable-line
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.' + info); // eslint-disable-line
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater.' + err); // eslint-disable-line
});

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond; // eslint-disable-line
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'; // eslint-disable-line
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'; // eslint-disable-line
  sendStatusToWindow(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds' + info); // eslint-disable-line
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  } else if (mainWindow !== null) {
    mainWindow.webContents.session.clearCache(() => {
      console.log('cache cleared.');
    });
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(() => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: info.releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.',
    };

    dialog.showMessageBox(dialogOpts, (response) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  }, 5000);
});

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
});
