import * as zookeeper from 'node-zookeeper-client';
import { type Logger } from 'winston';
export interface DistributedLockOptions {
    logger: Logger;
}
export declare class DistributedLock {
    readonly zkClient: zookeeper.Client;
    private readonly zkConnectString;
    private readonly lockPath;
    private readonly ready;
    private readonly logger;
    constructor(zkConnectString: string, lockPath: string, options?: DistributedLockOptions);
    init(): Promise<void>;
    acquireLock(callback: (error?: Error) => void): Promise<void>;
    releaseLock(lockPath: string, callback: (error?: Error) => void): void;
    close(): void;
    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
}
