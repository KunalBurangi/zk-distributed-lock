export declare class MyClass {
    private lock;
    private readonly lockPath;
    constructor(zkConnectString: string);
    acquireLockAndDoWork(): any;
}
