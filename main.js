const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const si = require('systeminformation');
const printer = require('node-printer');
const fs = require('fs');
const os = require('os');
const { createIcon } = require('./assets/icon');
require('@electron/remote/main').initialize();

let mainWindow;
let tray;
let ws;
let apiKey;
let serverUrl = 'ws://localhost:5001'; // Default server URL

// Load config if exists
try {
    const config = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'config.json')));
    if (config.apiKey) apiKey = config.apiKey;
    if (config.serverUrl) serverUrl = config.serverUrl;
} catch (err) {
    console.log('No config file found or invalid config');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: createIcon(),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    require('@electron/remote/main').enable(mainWindow.webContents);
    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools(); // Add this for debugging
    
    // Hide window on close
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

function createTray() {
    // Create tray with icon
    tray = new Tray(createIcon());
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show App', 
            click: () => mainWindow.show() 
        },
        { 
            label: 'Status', 
            submenu: [
                { label: 'Disconnected', enabled: false }
            ]
        },
        { type: 'separator' },
        { 
            label: 'Quit', 
            click: () => {
                app.isQuitting = true;
                app.quit();
            } 
        }
    ]);
    tray.setToolTip('Windsurf Print Client');
    tray.setContextMenu(contextMenu);
}

async function connectWebSocket() {
    if (!apiKey) {
        console.error('No API key configured');
        return;
    }

    ws = new WebSocket(serverUrl);

    ws.on('open', async () => {
        console.log('Connected to server');
        updateTrayStatus('Connected');
        
        // Send initial system info
        const systemInfo = await getSystemInfo();
        const printerInfo = await getPrinterInfo();
        
        ws.send(JSON.stringify({
            type: 'client_info',
            apiKey: apiKey,
            systemInfo: systemInfo,
            printerInfo: printerInfo
        }));

        // Start periodic updates
        setInterval(async () => {
            const systemInfo = await getSystemInfo();
            const printerInfo = await getPrinterInfo();
            
            ws.send(JSON.stringify({
                type: 'status_update',
                apiKey: apiKey,
                systemInfo: systemInfo,
                printerInfo: printerInfo
            }));
        }, 30000);
    });

    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            
            if (message.type === 'print_job') {
                handlePrintJob(message);
            }
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
        updateTrayStatus('Disconnected');
        setTimeout(connectWebSocket, 5000);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        updateTrayStatus('Error');
    });
}

async function getSystemInfo() {
    try {
        const [cpu, mem] = await Promise.all([
            si.currentLoad(),
            si.mem()
        ]);

        return {
            os: `${os.platform()} ${os.release()}`,
            hostname: os.hostname(),
            cpu_usage: cpu.currentLoad,
            memory_usage: (mem.used / mem.total) * 100
        };
    } catch (err) {
        console.error('Error getting system info:', err);
        return {};
    }
}

async function getPrinterInfo() {
    try {
        const printers = printer.getPrinters();
        return printers.map(p => ({
            name: p.name,
            isDefault: p.isDefault,
            isOnline: true, // We'll assume online if we can detect it
            status: p.status,
            jobs: 0 // You might want to implement job counting
        }));
    } catch (err) {
        console.error('Error getting printer info:', err);
        return [];
    }
}

function handlePrintJob(job) {
    try {
        // Download the file
        // Print using node-printer
        // Update job status
        console.log('Print job received:', job);
        
        // Implement printing logic here
        // This is where you'd handle the actual printing
        
        ws.send(JSON.stringify({
            type: 'job_status',
            jobId: job.id,
            status: 'completed'
        }));
    } catch (err) {
        console.error('Error handling print job:', err);
        ws.send(JSON.stringify({
            type: 'job_status',
            jobId: job.id,
            status: 'failed',
            error: err.message
        }));
    }
}

function updateTrayStatus(status) {
    if (!tray) return;
    
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show App', 
            click: () => mainWindow.show() 
        },
        { 
            label: 'Status', 
            submenu: [
                { label: status, enabled: false }
            ]
        },
        { type: 'separator' },
        { 
            label: 'Quit', 
            click: () => {
                app.isQuitting = true;
                app.quit();
            } 
        }
    ]);
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    createWindow();
    createTray();
    connectWebSocket();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
