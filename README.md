# Lucky Sole Printer Client

Windows desktop application for managing thermal printer integration with Lucky Sole cloud application.

## Features

- Windows system tray application
- Automatic printer detection
- Secure cloud connection
- Print job management
- Automatic updates
- Windows service integration
- Error reporting and logging

## Requirements

- Windows 10 or later
- .NET Framework 4.7.2 or later
- Supported thermal printer (Rollo, etc.)
- Internet connection
- Lucky Sole cloud account and API key

## Installation

1. Download the latest installer from the releases page
2. Run the installer and follow the setup wizard
3. Select your thermal printer during setup
4. Enter your Lucky Sole location ID and API key
5. The application will start automatically

## Development Setup

1. Install Node.js 16 or later
2. Install required build tools:
```bash
npm install --global windows-build-tools
```

3. Clone the repository:
```bash
git clone https://github.com/lucky-sole/printer-client.git
cd printer-client
```

4. Install dependencies:
```bash
npm install
```

5. Start development server:
```bash
npm run dev
```

## Building

To create a Windows installer:

```bash
npm run build
```

The installer will be created in the `dist` folder.

## Configuration

The application can be configured through the system tray menu or by editing the config file at:
```
%APPDATA%\Lucky Sole Printer Client\config.json
```

Available settings:
- `printerName`: Name of the Windows printer to use
- `apiKey`: Your Lucky Sole API key
- `locationId`: Your store location ID
- `serverUrl`: Cloud server URL
- `autoStart`: Start with Windows (default: true)
- `startMinimized`: Start in system tray (default: true)

## Troubleshooting

### Printer Not Found
1. Check that the printer is powered on and connected
2. Verify the printer is installed in Windows
3. Try selecting the printer again through the system tray menu

### Connection Issues
1. Check your internet connection
2. Verify your API key and location ID
3. Check the application logs at:
```
%APPDATA%\Lucky Sole Printer Client\logs\
```

### Print Jobs Not Processing
1. Check the Windows service is running
2. Verify printer permissions
3. Check the application logs for errors

## Support

For support, please contact:
- Email: support@luckysole.com
- Phone: (555) 123-4567

## License

Copyright © 2024 Lucky Sole. All rights reserved.
