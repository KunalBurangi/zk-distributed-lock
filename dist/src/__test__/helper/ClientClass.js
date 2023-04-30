"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyClass = void 0;
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-explicit-any */
const zklock_1 = require("../../zklock");
class MyClass {
    constructor(zkConnectString) {
        this.lockPath = '/my-lock';
        this.response = "initial";
        this.lock = new zklock_1.DistributedLock(zkConnectString, this.lockPath);
        this.lock.on('connected', () => {
            console.log('ZooKeeper client connected');
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
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lock.acquireLock((error) => {
                if (error) {
                    console.error('Failed to acquire lock:', error);
                    return;
                }
                console.log('Lock acquired, doing some work...');
                this.response = "Lock Acquired";
                // Do some work here...
                this.lock.releaseLock(this.lockPath, (error) => {
                    if (error) {
                        console.error('Failed to release lock:', error);
                        return 'Failed to release lock:';
                    }
                    else {
                        console.log('Lock released');
                        this.response = "Lock released";
                        return 'task done';
                    }
                });
                return 'task done';
            });
            return 'task done';
        });
    }
}
exports.MyClass = MyClass;

//# sourceMappingURL=ClientClass.js.map

//# sourceMappingURL=ClientClass.js.map
