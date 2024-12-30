/// <reference types="electron" />

declare namespace Electron {
    interface App {
        getPath(name: string): string;
    }

    interface IpcMain {
        on(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void): this;
        handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any): void;
    }

    interface IpcMainEvent {
        reply(channel: string, ...args: any[]): void;
    }

    interface IpcMainInvokeEvent {
        sender: WebContents;
    }

    interface WebContents {
        send(channel: string, ...args: any[]): void;
    }

    interface Tray {
        setImage(image: string): void;
        setToolTip(toolTip: string): void;
        setContextMenu(menu: Menu): void;
        on(event: string, listener: Function): this;
    }

    interface Menu {
        popup(options?: PopupOptions): void;
    }

    interface PopupOptions {
        window?: BrowserWindow;
        x?: number;
        y?: number;
        positioningItem?: number;
        callback?: () => void;
    }
} 