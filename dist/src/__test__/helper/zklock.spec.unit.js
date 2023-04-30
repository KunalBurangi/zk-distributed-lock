"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const ZooKeeper = require("node-zookeeper-client");
const zklock_1 = require("./zklock");
const ClientClass_1 = require("./helper/ClientClass");
const zkConnectString = 'localhost:2181';
const testLockPath = '/test-lock';
describe('myClass', function test() {
    this.timeout(5000);
    let client;
    let lock;
    let myInstance;
    before((done) => {
        // Create a new ZooKeeper client and connect to the server
        client = ZooKeeper.createClient(zkConnectString);
        client.connect();
        // Check if the test lock node exists
        client.exists(testLockPath, (error, stat) => {
            if (error) {
                return done(error);
            }
            if (stat) {
                return done();
            }
            // Create the test lock node if it doesn't exist
            client.create(testLockPath, null, ZooKeeper.CreateMode.PERSISTENT, (error) => {
                if (error && error.code !== ZooKeeper.Exception.NODE_EXISTS) {
                    return done(error);
                }
                done();
            });
        });
    });
    after(() => {
        // Disconnect the client
        client.close();
    });
    beforeEach((done) => {
        // Create a lock instance
        lock = new zklock_1.DistributedLock(zkConnectString, '/test-lock');
        // Register event listeners for the lock instance
        lock.on('connected', () => {
            console.log('Lock connected to ZooKeeper');
            lock.acquireLock(testLockPath, (error) => {
                if (error) {
                    console.error('Failed to acquire lock:', error);
                }
                else {
                    console.log('Lock acquired the lock');
                    myInstance = new ClientClass_1.MyClass('localhost:2182');
                    done();
                }
            });
        });
        lock.on('disconnected', () => {
            console.error('Lock disconnected from ZooKeeper');
        });
        lock.on('error', (error) => {
            console.error('Lock error:', error);
        });
    });
    afterEach((done) => {
        // Release the lock and wait for the lock release callback to complete
        lock.releaseLock(testLockPath, (error) => {
            if (error) {
                console.error('Failed to release lock:', error);
            }
            else {
                console.log('Lock released the lock');
            }
            done(error);
        });
    });
    it('should do some task after acquiring the lock', () => {
        const result = myInstance.acquireLockAndDoWork();
        assert.strictEqual(result, 'task done');
    });
});

//# sourceMappingURL=zklock.spec.unit.js.map

//# sourceMappingURL=zklock.spec.unit.js.map
