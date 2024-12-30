declare module 'escpos' {
    export class Printer {
        constructor(device: any);
        text(content: string): this;
        align(alignment: 'LT' | 'CT' | 'RT'): this;
        size(width: number, height: number): this;
        qrcode(content: string, options: { type: number; size: number; correction: string }): this;
        cut(): this;
        close(callback: () => void): void;
    }

    export class USB {
        constructor(device: any);
        open(callback: (error: Error | null) => void): void;
    }
}

declare module 'escpos-usb' {
    export function findPrinter(): any[];
    export class USB {
        constructor(device: any);
        open(callback: (error: Error | null) => void): void;
    }
} 