const WebSocket = require('ws');
const si = require('systeminformation');
const printer = require('node-printer');
const fs = require('fs');
const path = require('path');
const os = require('os');

let ws;
let apiKey;
let serverUrl = 'ws://localhost:5001';
const configPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'windsurf-print-client', 'config.json');

// Load config if exists
try {
    const config = JSON.parse(fs.readFileSync(configPath));
    if (config.apiKey) apiKey = config.apiKey;
    if (config.serverUrl) serverUrl = config.serverUrl;
} catch (err) {
    console.log('No config file found or invalid config');
}

async function getSystemInfo() {
    try {
        const [cpu, mem, os] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo()
        ]);
        
        return {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed,
                cores: cpu.cores
            },
            memory: {
                total: mem.total,
                free: mem.free,
                used: mem.used
            },
            os: {
                platform: os.platform,
                distro: os.distro,
                release: os.release,
                arch: os.arch
            }
        };
    } catch (error) {
        console.error('Error getting system info:', error);
        return {};
    }
}

async function getPrinterInfo() {
    try {
        const printers = printer.getPrinters();
        return printers.map(p => ({
            name: p.name,
            status: p.status,
            isDefault: p.isDefault
        }));
    } catch (error) {
        console.error('Error getting printer info:', error);
        return [];
    }
}

async function handlePrintJob(job) {
    try {
        const { printer: printerName, file, options } = job;
        
        // Print the job
        await printer.printFile({
            filename: file,
            printer: printerName,
            success: function(jobID) {
                console.log("Printed job:", jobID);
                ws.send(JSON.stringify({
                    type: 'print_status',
                    jobId: jobID,
                    status: 'success'
                }));
            },
            error: function(err) {
                console.error("Print error:", err);
                ws.send(JSON.stringify({
                    type: 'print_status',
                    error: err.message
                }));
            }
        });
    } catch (error) {
        console.error('Error handling print job:', error);
        ws.send(JSON.stringify({
            type: 'print_status',
            error: error.message
        }));
    }
}

function connectWebSocket() {
    if (!apiKey) {
        console.error('No API key configured');
        return;
    }

    ws = new WebSocket(serverUrl);

    ws.on('open', async () => {
        console.log('Connected to server');
        
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
        }, 60000); // Update every minute
    });

    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            
            if (message.type === 'print_job') {
                await handlePrintJob(message);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from server');
        setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close();
    });
}

// Start the service
connectWebSocket();

// Handle process termination
process.on('SIGTERM', () => {
    if (ws) {
        ws.close();
    }
    process.exit(0);
});
