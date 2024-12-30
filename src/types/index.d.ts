declare module 'node-thermal-printer' {
    export enum PrinterTypes {
        EPSON = 'epson',
        STAR = 'star'
    }

    export enum CharacterSet {
        PC437_USA = 'PC437_USA',
        PC850_MULTILINGUAL = 'PC850_MULTILINGUAL'
    }

    export interface PrinterOptions {
        type?: PrinterTypes;
        interface: string;
        driver?: any;
        width?: number;
        characterSet?: string;
        removeSpecialCharacters?: boolean;
        lineCharacter?: string;
        options?: {
            timeout?: number;
        };
    }

    export class ThermalPrinter {
        constructor(options: PrinterOptions);
        clear(): Promise<void>;
        execute(): Promise<void>;
        cut(): Promise<void>;
        println(content: string): Promise<void>;
        print(content: string): Promise<void>;
        setTextSize(width: number, height: number): void;
        setTextNormal(): void;
        alignCenter(): void;
        alignLeft(): void;
        alignRight(): void;
        bold(enabled: boolean): void;
        invert(enabled: boolean): void;
        underline(enabled: boolean): void;
        printQR(content: string, options?: { cellSize?: number; correction?: string }): Promise<void>;
    }
}

declare module 'printer' {
    export interface Printer {
        name: string;
        status?: number;
    }

    export function getPrinters(): Printer[];
    export function getDefaultPrinterName(): string;
}

interface PrintJob {
    id: string;
    content: {
        elements: Array<{
            type: string;
            text?: string;
            size?: number;
            align?: string;
            title?: string;
            content?: string[];
            label?: string;
            value?: string;
        }>;
    };
}

interface PrinterDevice {
    name: string;
    status: string;
    isDefault: boolean;
} 