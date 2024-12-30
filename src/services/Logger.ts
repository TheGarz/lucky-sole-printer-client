import * as winston from 'winston';
import * as path from 'path';
import { app } from 'electron';

export class Logger {
    private logger: winston.Logger;
    private logsPath: string;

    constructor() {
        // Set up logs directory in AppData
        this.logsPath = path.join(app.getPath('userData'), 'logs');
        
        // Create Winston logger
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                // Write to console in development
                process.env.NODE_ENV !== 'production' && new winston.transports.Console({
                    format: winston.format.simple()
                }),
                // Write to rotating file
                new winston.transports.File({
                    filename: path.join(this.logsPath, 'error.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    tailable: true
                }),
                new winston.transports.File({
                    filename: path.join(this.logsPath, 'combined.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    tailable: true
                })
            ].filter(Boolean) as winston.transport[]
        });

        this.info('Logger initialized');
    }

    public info(message: string, meta?: any) {
        this.logger.info(message, meta);
    }

    public error(message: string, meta?: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message,
            ...(meta && { meta })
        };

        this.logger.error(message, logEntry);
    }

    public warn(message: string, meta?: any) {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta?: any) {
        this.logger.debug(message, meta);
    }

    public getLogsPath(): string {
        return this.logsPath;
    }

    public async clearLogs(): Promise<void> {
        try {
            await Promise.all([
                this.logger.clear(),
                // Additional cleanup if needed
            ]);
            this.info('Logs cleared successfully');
        } catch (error) {
            this.error('Failed to clear logs', error);
            throw error;
        }
    }
} 