export declare class MyClass {
    private lock;
    private readonly lockPath;
    response: string;
    constructor(zkConnectString: string);
    acquireLockAndDoWork(): Promise<any>;
}
