const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'WindsurfPrintClient',
    description: 'Windsurf Print Client Service',
    script: path.join(__dirname, 'service.js'),
    nodeOptions: [],
    env: [{
        name: "NODE_ENV",
        value: "production"
    }]
});

// Listen for the "install" event
svc.on('install', function() {
    console.log('Service installed successfully');
    svc.start();
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
    console.log('Service uninstalled successfully');
});

// Just in case the service exists
svc.on('alreadyinstalled', function() {
    console.log('Service is already installed');
    svc.uninstall();
});

// Install the service
svc.install();
