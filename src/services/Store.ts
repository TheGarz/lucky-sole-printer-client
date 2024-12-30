import ElectronStore from 'electron-store';

interface StoreSchema {
    settings: {
        apiKey?: string;
        apiUrl?: string;
        printerName?: string;
        characterSet?: string;
        autoStart?: boolean;
        startMinimized?: boolean;
    };
}

export class Store {
    private store: ElectronStore<StoreSchema>;

    constructor() {
        this.store = new ElectronStore<StoreSchema>({
            defaults: {
                settings: {}
            }
        });
    }

    get<T>(key: string, defaultValue?: T): T {
        return this.store.get(`settings.${key}`, defaultValue) as T;
    }

    set(key: string, value: any): void {
        this.store.set(`settings.${key}`, value);
    }

    clearApiKey(): void {
        const settings = this.store.get('settings');
        if (settings.apiKey) {
            const { apiKey, ...rest } = settings;
            this.store.set('settings', rest);
        }
    }
} 