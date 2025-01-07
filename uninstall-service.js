const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
    name: 'WindsurfPrintClient',
    description: 'Windsurf Print Client Service',
    script: path.join(__dirname, 'service.js')
});

// Listen for the "uninstall" event
svc.on('uninstall', function() {
    console.log('Service uninstalled successfully');
});

// Uninstall the service
svc.uninstall();
