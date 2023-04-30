export declare class DistributedLock {
    private readonly zkClient;
    private readonly zkConnectString;
    private readonly lockPath;
    constructor(zkConnectString: string, lockPath: string);
    acquireLock(lockPath: string, callback: (error?: Error) => void): void;
    releaseLock(lockPath: string, callback: (error?: Error) => void): void;
    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
}
