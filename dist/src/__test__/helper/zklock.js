"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedLock = void 0;
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
const zookeeper = require("node-zookeeper-client");
class DistributedLock {
    constructor(zkConnectString, lockPath) {
        this.zkConnectString = zkConnectString;
        this.lockPath = lockPath;
        this.zkClient = zookeeper.createClient(this.zkConnectString);
    }
    acquireLock(lockPath, callback) {
        this.zkClient.once('connected', () => {
            this.zkClient.create(this.lockPath, null, zookeeper.CreateMode.EPHEMERAL, (error, lockPath) => {
                if (error) {
                    callback(error);
                    return;
                }
                callback();
            });
        });
        this.zkClient.connect();
    }
    releaseLock(lockPath, callback) {
        this.zkClient.remove(lockPath, (error) => {
            if (error) {
                callback(error);
                return;
            }
            callback();
            this.zkClient.close();
        });
    }
    on(event, listener) {
        this.zkClient.on(event, listener);
    }
    once(event, listener) {
        this.zkClient.once(event, listener);
    }
}
exports.DistributedLock = DistributedLock;

//# sourceMappingURL=zklock.js.map

//# sourceMappingURL=zklock.js.map
