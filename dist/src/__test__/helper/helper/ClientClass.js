"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyClass = void 0;
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-explicit-any */
const zklock_1 = require("../zklock");
class MyClass {
    constructor(zkConnectString) {
        this.lockPath = '/my-lock';
        this.lock = new zklock_1.DistributedLock(zkConnectString, this.lockPath);
        this.lock.on('connected', () => {
            console.log('ZooKeeper client connected');
            this.acquireLockAndDoWork();
        });
        this.lock.on('expired', () => {
            console.error('ZooKeeper session expired');
        });
        this.lock.on('authenticationFailed', () => {
            console.error('ZooKeeper authentication failed');
        });
        this.lock.on('disconnected', () => {
            console.error('ZooKeeper client disconnected');
        });
        this.lock.on('error', (error) => {
            console.error('ZooKeeper error:', error);
        });
    }
    acquireLockAndDoWork() {
        this.lock.acquireLock(this.lockPath, (error) => {
            if (error) {
                console.error('Failed to acquire lock:', error);
                return;
            }
            console.log('Lock acquired, doing some work...');
            // Do some work here...
            this.lock.releaseLock(this.lockPath, (error) => {
                if (error) {
                    console.error('Failed to release lock:', error);
                    return 'Failed to release lock:';
                }
                else {
                    console.log('Lock released');
                    return 'task done';
                }
            });
            return 'task done';
        });
    }
}
exports.MyClass = MyClass;

//# sourceMappingURL=ClientClass.js.map

//# sourceMappingURL=ClientClass.js.map
