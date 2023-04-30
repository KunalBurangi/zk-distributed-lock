/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DistributedLock } from "../../zklock";
import { logger } from "../../logger";

export class MyClass {
  private lock: DistributedLock;
  private readonly lockPath: string = "/my-lock";
  public response = "initial";
  constructor(zkConnectString: string) {
    this.lock = new DistributedLock(zkConnectString, this.lockPath);
    this.lock.on("connected", () => {
      logger.info("ZooKeeper client connected");
    });

    this.lock.on("expired", () => {
      console.error("ZooKeeper session expired");
    });

    this.lock.on("authenticationFailed", () => {
      console.error("ZooKeeper authentication failed");
    });

    this.lock.on("disconnected", () => {
      console.error("ZooKeeper client disconnected");
    });

    this.lock.on("error", (error) => {
      console.error("ZooKeeper error:", error);
    });
  }

  public async acquireLockAndDoWork(): Promise<any> {
    await this.lock.acquireLock((error) => {
      if (error) {
        console.error("Failed to acquire lock:", error);
        return;
      }

      console.log("Lock acquired, doing some work...");
      this.response = "Lock Acquired";
      // Do some work here...

      this.lock.releaseLock(this.lockPath, (error) => {
        if (error) {
          console.error("Failed to release lock:", error);
          return "Failed to release lock:";
        } else {
          console.log("Lock released");
          this.response = "Lock released";

          return "task done";
        }
      });
      return "task done";
    });
    return "task done";
  }
}
