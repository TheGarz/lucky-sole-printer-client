import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import * as escpos from 'escpos';
import * as usb from 'escpos-usb';

interface PrinterInfo {
    name: string;
    status?: number;
}

export class WindowsPrinterManager {
    private printer: escpos.Printer | null = null;
    private device: usb.USB | null = null;
    private statusChangeCallback: ((isReady: boolean) => void) | null = null;

    constructor() {
        this.initializePrinter();
    }

    private initializePrinter() {
        try {
            const devices = usb.findPrinter();
            if (devices.length === 0) {
                throw new Error('No USB printer found');
            }

            this.device = new usb.USB(devices[0]);
            this.printer = new escpos.Printer(this.device);

            if (this.statusChangeCallback) {
                this.statusChangeCallback(true);
            }
        } catch (error) {
            if (this.statusChangeCallback) {
                this.statusChangeCallback(false);
            }
            throw error;
        }
    }

    onStatusChange(callback: (isReady: boolean) => void) {
        this.statusChangeCallback = callback;
        if (this.printer) {
            callback(true);
        } else {
            callback(false);
        }
    }

    async print(content: any) {
        if (!this.printer || !this.device) {
            throw new Error('Printer not initialized');
        }

        try {
            await new Promise<void>((resolve, reject) => {
                this.device!.open((error: Error | null) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    for (const element of content.elements) {
                        switch (element.type) {
                            case 'text':
                                if (element.size) {
                                    this.printer!.size(element.size, element.size);
                                }
                                if (element.align === 'center') {
                                    this.printer!.align('CT');
                                } else if (element.align === 'right') {
                                    this.printer!.align('RT');
                                } else {
                                    this.printer!.align('LT');
                                }
                                this.printer!.text(element.text || '');
                                this.printer!.size(1, 1);
                                break;

                            case 'qr':
                                this.printer!.qrcode(element.content || '', {
                                    type: 1,
                                    size: element.size || 3,
                                    correction: 'M'
                                });
                                break;

                            case 'line':
                                this.printer!.text('='.repeat(32));
                                break;

                            case 'field':
                                this.printer!.text(`${element.label}: ${element.value}`);
                                break;
                        }
                    }

                    this.printer!
                        .cut()
                        .close(() => {
                            resolve();
                        });
                });
            });
        } catch (error) {
            throw new Error(`Failed to print: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    getPrinterStatus(): boolean {
        return this.printer !== null;
    }
} 