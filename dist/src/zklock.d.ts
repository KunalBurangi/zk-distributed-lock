import * as zookeeper from 'node-zookeeper-client';
export declare class DistributedLock {
    readonly zkClient: zookeeper.Client;
    private readonly zkConnectString;
    private readonly lockPath;
    private readonly ready;
    constructor(zkConnectString: string, lockPath: string);
    init(): Promise<void>;
    acquireLock(callback: (error?: Error) => void): Promise<void>;
    releaseLock(lockPath: string, callback: (error?: Error) => void): void;
    close(): void;
    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
}
