import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as escpos from 'escpos';
import * as usb from 'escpos-usb';
import { Store } from './services/Store';
import { Logger } from './services/Logger';
import { WindowsPrinterManager } from './services/WindowsPrinterManager';
import { CloudConnection } from './services/CloudConnection';
import { TrayManager } from './services/TrayManager';

interface PrinterInfo {
    name: string;
    isDefault: boolean;
}

export class App {
    private store: Store;
    private logger: Logger;
    private printerManager: WindowsPrinterManager;
    private cloudConnection: CloudConnection;
    private trayManager: TrayManager;

    constructor() {
        this.store = new Store();
        this.logger = new Logger();
        this.printerManager = new WindowsPrinterManager();
        this.cloudConnection = new CloudConnection(this.store, this.logger);
        this.trayManager = new TrayManager(
            this.printerManager,
            this.cloudConnection,
            this.store,
            this.logger
        );

        this.setupEventHandlers();
        this.setupAutoUpdater();
    }

    private setupEventHandlers() {
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            // Handle macOS dock click
        });

        this.cloudConnection.on('print', async (job: any) => {
            try {
                this.logger.info('Received print job', { jobId: job.id });
                await this.printerManager.print(job.content);
                await this.cloudConnection.markJobCompleted(job.id);
                this.logger.info('Print job completed', { jobId: job.id });
            } catch (error: any) {
                if (error instanceof Error) {
                    await this.cloudConnection.markJobFailed(job.id, error.message);
                    this.logger.error(
                        'Failed to print job',
                        {
                            jobId: job.id,
                            error: error.message
                        }
                    );
                } else {
                    await this.cloudConnection.markJobFailed(job.id, 'Unknown error occurred');
                    this.logger.error(
                        'Failed to print job',
                        {
                            jobId: job.id,
                            error: 'Unknown error'
                        }
                    );
                }
            }
        });

        this.cloudConnection.on('configure-printer', async () => {
            try {
                const devices = usb.findPrinter();
                if (devices.length === 0) {
                    throw new Error('No USB printers found');
                }

                const printers = devices.map((device: any, index: number) => ({
                    name: `USB Printer ${index + 1}`,
                    device
                }));

                const response = await dialog.showMessageBox({
                    type: 'question',
                    title: 'Select Printer',
                    message: 'Please select a USB printer:',
                    buttons: printers.map(p => p.name),
                    cancelId: -1
                });

                if (response.response !== -1) {
                    const selectedPrinter = printers[response.response];
                    this.store.set('printerName', selectedPrinter.name);
                    this.printerManager = new WindowsPrinterManager();
                    this.logger.info('Printer updated', { name: selectedPrinter.name });
                }
            } catch (error: any) {
                this.logger.error('Failed to configure printer', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                dialog.showErrorBox(
                    'Printer Configuration Error',
                    error instanceof Error ? error.message : 'Failed to configure printer'
                );
            }
        });

        this.cloudConnection.on('test-print', async () => {
            try {
                const testContent = {
                    elements: [
                        {
                            type: 'text',
                            text: 'Test Print',
                            size: 2,
                            align: 'center'
                        },
                        {
                            type: 'line'
                        },
                        {
                            type: 'text',
                            text: 'This is a test print from Lucky Sole Printer Client',
                            align: 'center'
                        },
                        {
                            type: 'line'
                        },
                        {
                            type: 'text',
                            text: new Date().toLocaleString(),
                            align: 'center'
                        }
                    ]
                };

                await this.printerManager.print(testContent);
                this.logger.info('Test print completed');
            } catch (error: any) {
                this.logger.error('Test print failed', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                dialog.showErrorBox(
                    'Test Print Error',
                    error instanceof Error ? error.message : 'Failed to print test page'
                );
            }
        });
    }

    private setupAutoUpdater() {
        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox({
                type: 'info',
                title: 'Update Ready',
                message: 'A new version has been downloaded. Restart the application to apply the updates.',
                buttons: ['Restart', 'Later']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });

        autoUpdater.on('error', (error) => {
            this.logger.error('Auto updater error', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        });

        // Check for updates
        autoUpdater.checkForUpdates();
    }

    private async getPrinters(): Promise<PrinterInfo[]> {
        const devices = usb.findPrinter();
        return devices.map((device: any, index: number) => ({
            name: `USB Printer ${index + 1}`,
            isDefault: index === 0
        }));
    }

    async start() {
        try {
            await app.whenReady();
            this.logger.info('Application started');
            await this.cloudConnection.connect();
        } catch (error: any) {
            this.logger.error('Failed to start application', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            app.quit();
        }
    }
} 