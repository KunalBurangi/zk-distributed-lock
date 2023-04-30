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
exports.DistributedLock = void 0;
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
const zookeeper = require("node-zookeeper-client");
class DistributedLock {
    constructor(zkConnectString, lockPath) {
        this.zkConnectString = zkConnectString;
        this.lockPath = lockPath;
        this.zkClient = zookeeper.createClient(this.zkConnectString);
        this.ready = this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.zkClient.once('connected', () => {
                console.log("zk connected");
            });
            yield this.zkClient.connect();
        });
    }
    acquireLock(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ready;
            this.zkClient.create(this.lockPath, null, zookeeper.CreateMode.EPHEMERAL, (error, lockPath) => {
                if (error) {
                    callback(error);
                    return;
                }
                callback();
            });
        });
    }
    releaseLock(lockPath, callback) {
        this.zkClient.remove(lockPath, (error) => {
            if (error) {
                callback(error);
                return;
            }
            callback();
        });
    }
    close() {
        this.zkClient.close();
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
