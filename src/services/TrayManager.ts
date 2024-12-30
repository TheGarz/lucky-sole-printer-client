import { app, Tray, Menu } from 'electron';
import { WindowsPrinterManager } from './WindowsPrinterManager';
import { CloudConnection } from './CloudConnection';
import { Store } from './Store';
import { Logger } from './Logger';
import * as path from 'path';

export class TrayManager {
    private tray: Tray | null = null;
    private printerManager: WindowsPrinterManager;
    private cloudConnection: CloudConnection;
    private store: Store;
    private logger: Logger;
    private isReady: boolean = false;

    constructor(
        printerManager: WindowsPrinterManager,
        cloudConnection: CloudConnection,
        store: Store,
        logger: Logger
    ) {
        this.printerManager = printerManager;
        this.cloudConnection = cloudConnection;
        this.store = store;
        this.logger = logger;

        this.setupTray();
        this.setupEventHandlers();
    }

    private setupTray() {
        const iconPath = path.join(__dirname, '../../src/assets/icons/printer-ready-32.png');
        this.tray = new Tray(iconPath);
        this.tray.setToolTip('Lucky Sole Printer Client');
        this.updateTrayIcon();
    }

    private setupEventHandlers() {
        // Listen for printer status changes
        this.printerManager.onStatusChange((isReady: boolean) => {
            this.isReady = isReady;
            this.updateTrayIcon();
        });

        // Listen for cloud connection changes
        this.cloudConnection.on('connected', () => {
            this.updateTrayIcon();
        });

        this.cloudConnection.on('disconnected', () => {
            this.updateTrayIcon();
        });
    }

    private updateTrayIcon() {
        if (!this.tray) return;

        let iconName = 'printer-disconnected';
        if (this.isReady) {
            iconName = 'printer-ready';
        } else if (!this.cloudConnection.isConnected()) {
            iconName = 'printer-error';
        }

        const iconPath = path.join(__dirname, `../../src/assets/icons/${iconName}-32.png`);
        this.tray.setImage(iconPath);
        this.updateContextMenu();
    }

    private updateContextMenu() {
        if (!this.tray) return;

        const contextMenu = Menu.buildFromTemplate([
            {
                label: this.getStatusLabel(),
                enabled: false
            },
            { type: 'separator' },
            {
                label: 'Exit',
                click: () => {
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(contextMenu);
    }

    private getStatusLabel(): string {
        if (!this.isReady) {
            return 'Printer Not Ready';
        }
        if (!this.cloudConnection.isConnected()) {
            return 'Disconnected from Server';
        }
        return 'Ready';
    }
} 