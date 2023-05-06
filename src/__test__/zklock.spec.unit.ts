import { expect } from "chai";
import { MyClass } from "./helper/ClientClass";
import { logger } from "../logger";
import { DistributedLockOptions } from "../zklock";
function delay(ms: number): Promise<void> {
  return new Promise((rs) => setTimeout(rs, ms));
}

describe("myClass", function test() {
  this.timeout(10000);
  const options = {
    logger: logger,
    retryCount: 0,
    retryAfter: 0,
  };
  const optionsRetry: DistributedLockOptions = {
    logger: logger,
    retryCount: 2,
    retryAfter: 2000,
  };
  it("should do some task after acquiring the lock", async () => {
    const myclass = new MyClass("localhost:2182");
    const result = await myclass.acquireLockAndDoWork();
    await delay(3000);
    expect(result).equal("task done");
    expect(myclass.response).equal("Lock released");
  });
  it("should create 2 instance of app and only one instance should do some task after acquiring the lock", async () => {
    const myclass1 = new MyClass("localhost:2182", options);
    const myclass2 = new MyClass("localhost:2182", options);
    const promises: Array<any> = [];
    promises.push(myclass1.acquireLockAndDoWork());
    promises.push(myclass2.acquireLockAndDoWork());
    await Promise.all(promises);
    await delay(5000);
    if (
      (myclass1.response === "Lock released" &&
        myclass2.response === "initial") ||
      (myclass2.response === "Lock released" && myclass1.response === "initial")
    ) {
      expect(true).equal(true);
    } else {
      expect(true).equal(false);
    }
  });
  it("should create 2 instance of app and only one instance should do some task after acquiring the lock, Other should Wait and retry and should get successful", async () => {
    const myclass1 = new MyClass("localhost:2182", optionsRetry);
    const myclass2 = new MyClass("localhost:2182", optionsRetry);
    const promises: Array<any> = [];
    promises.push(myclass1.acquireLockAndDoWork());
    promises.push(myclass2.acquireLockAndDoWork());
    await Promise.all(promises);
    await delay(5000);
    if (
      (myclass1.response === "Lock released" &&
        myclass2.response === "initial") ||
      (myclass2.response === "Lock released" && myclass1.response === "initial")
    ) {
      expect(true).equal(false);
    } else {
      expect(true).equal(true);
    }
  });
});
