import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Store } from './Store';
import { Logger } from './Logger';

export class CloudConnection extends EventEmitter {
    private ws: WebSocket | null = null;
    private store: Store;
    private logger: Logger;
    private connected: boolean = false;
    private reconnectTimer: NodeJS.Timeout | null = null;

    constructor(store: Store, logger: Logger) {
        super();
        this.store = store;
        this.logger = logger;
    }

    public async connect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
        }

        const apiUrl = this.store.get<string>('apiUrl');
        const apiKey = this.store.get<string>('apiKey');

        if (!apiUrl || !apiKey) {
            throw new Error('API URL and API Key are required');
        }

        try {
            this.ws = new WebSocket(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            this.ws.on('open', () => {
                this.connected = true;
                this.emit('connected');
                this.logger.info('Connected to server');
            });

            this.ws.on('close', () => {
                this.connected = false;
                this.emit('disconnected');
                this.logger.info('Disconnected from server');
                this.scheduleReconnect();
            });

            this.ws.on('error', (error) => {
                this.logger.error('WebSocket error', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                } catch (error) {
                    this.logger.error('Failed to parse message', {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            });
        } catch (error) {
            this.logger.error('Failed to connect', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch((error) => {
                this.logger.error('Failed to reconnect', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            });
        }, 5000);
    }

    private handleMessage(message: any): void {
        switch (message.type) {
            case 'print':
                this.emit('print', message.data);
                break;

            case 'configure-printer':
                this.emit('configure-printer');
                break;

            case 'test-print':
                this.emit('test-print');
                break;

            default:
                this.logger.warn('Unknown message type', { type: message.type });
        }
    }

    public async markJobCompleted(jobId: string): Promise<void> {
        await this.sendMessage({
            type: 'job-completed',
            data: { jobId }
        });
    }

    public async markJobFailed(jobId: string, error: string): Promise<void> {
        await this.sendMessage({
            type: 'job-failed',
            data: { jobId, error }
        });
    }

    private async sendMessage(message: any): Promise<void> {
        if (!this.ws || !this.connected) {
            throw new Error('Not connected to server');
        }

        try {
            this.ws.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send message', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }
} 