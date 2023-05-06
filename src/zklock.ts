/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import * as zookeeper from "node-zookeeper-client";
import { logger } from "./logger";
import { type Logger } from "winston";

/**
 * logger - Custom Logger
 * retries - number of retries before giving error
 * retryAfter - Retry after (ms) time
 */
export interface DistributedLockOptions {
  logger: Logger;
  retryCount: number;
  retryAfter: number;
}
export class DistributedLock {
  public readonly zkClient: zookeeper.Client;
  private readonly zkConnectString: string;
  private readonly lockPath: string;
  private readonly ready: Promise<any>;
  private options: DistributedLockOptions = {
    logger: logger,
    retryCount: 0,
    retryAfter: 0,
  };

  constructor(
    zkConnectString: string,
    lockPath: string,
    options?: DistributedLockOptions
  ) {
    this.zkConnectString = zkConnectString;
    this.lockPath = lockPath;
    this.zkClient = zookeeper.createClient(this.zkConnectString);
    this.options = options ? options : this.options;
    this.ready = this.init();
  }

  public async init(): Promise<void> {
    this.zkClient.once("connected", () => {
      this.options.logger.info("Distributed Lock initialised");
    });

    await this.zkClient.connect();
  }

  // public async acquireLock(callback: (error?: Error) => void): Promise<void> {
  //   await this.ready;
  //   this.zkClient.create(
  //     this.lockPath,
  //     null as any,
  //     zookeeper.CreateMode.EPHEMERAL,
  //     (error: any, lockPath: any) => {
  //       if (error) {
  //         this.options.logger.error(
  //           `Error in acquiring lock on path ${lockPath} error: ${error.message}`
  //         );
  //         callback(error as Error | undefined);
  //         return;
  //       }
  //       this.options.logger.info(`Lock acquiring successfully on path ${lockPath}`);

  //       callback();
  //     }
  //   );
  // }

  // public async acquireLock(callback: (error?: Error) => void): Promise<void> {
  //   await this.ready;
  //   let retryCount = 0;

  //   for (let i = 0; i <= this.options.retryCount; i++) {
  //     try {
  //       await new Promise<void>((resolve, reject) => {
  //         this.zkClient.create(
  //           this.lockPath,
  //           null as any,
  //           zookeeper.CreateMode.EPHEMERAL,
  //           (error: any, lockPath: any) => {
  //             if (error) {
  //               this.options.logger.error(
  //                 `Error in acquiring lock on path ${lockPath} error: ${error.message}`
  //               );
  //               reject(error as Error | undefined);
  //             } else {
  //               this.options.logger.info(
  //                 `Lock acquiring successfully on path ${lockPath}`
  //               );
  //               resolve();
  //             }
  //           }
  //         );
  //       });
  //       if (callback) callback();
  //       return;
  //     } catch (error) {
  //       retryCount++;
  //       this.options.logger.error(`Error in acquiring lock, retrying...`);
  //       await new Promise((resolve) =>
  //         setTimeout(resolve, this.options.retryCount)
  //       );
  //     }
  //   }
  //   if (callback)
  //     callback(
  //       new Error(`Failed to acquire lock after ${retryCount} retries.`)
  //     );
  // }

  public acquireLock(callback: (error?: Error) => void): void;
  public async acquireLock(
    callback: (error?: Error) => void,
    retryable: boolean
  ): Promise<void>;
  public async acquireLock(
    callback: (error?: Error) => void,
    retryable: boolean = this.options.retryCount > 0 ? true : false
  ): Promise<void> {
    if (!retryable) {
      // Call the original acquireLock function without retry mechanism
      this.acquireLockWithoutRetry(callback);
      return;
    }

    // Call the original acquireLock function with retry mechanism
    await this.acquireLockWithRetry(callback, this.options.retryCount);
  }

  private async acquireLockWithRetry(
    callback: (error?: Error) => void,
    retryCount: number
  ): Promise<void> {
    await this.ready;

    for (let i = 0; i < retryCount; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.zkClient.create(
            this.lockPath,
            null as any,
            zookeeper.CreateMode.EPHEMERAL,
            (error: any, lockPath: any) => {
              if (error) {
                this.options.logger.error(
                  `Error in acquiring lock on path ${lockPath} error: ${error.message}`
                );
                reject(error as Error | undefined);
              } else {
                this.options.logger.info(
                  `Lock acquiring successfully on path ${lockPath}`
                );
                resolve();
              }
            }
          );
        });
        if (callback) callback();
        return;
      } catch (error) {
        this.options.logger.error(`Error in acquiring lock, retrying...`);
        await new Promise((resolve) =>
          setTimeout(resolve, this.options.retryAfter)
        );
      }
    }

    if (callback)
      callback(
        new Error(
          `Failed to acquire lock after ${this.options.retryCount} retries.`
        )
      );
  }

  private async acquireLockWithoutRetry(
    callback: (error?: Error) => void
  ): Promise<void> {
    await this.ready;
    this.zkClient.create(
      this.lockPath,
      null as any,
      zookeeper.CreateMode.EPHEMERAL,
      (error: any, lockPath: any) => {
        if (error) {
          this.options.logger.error(
            `Error in acquiring lock on path ${lockPath} error: ${error.message}`
          );
          callback(error as Error | undefined);
          return;
        }
        this.options.logger.info(
          `Lock acquiring successfully on path ${lockPath}`
        );

        callback();
      }
    );
  }

  public releaseLock(
    lockPath: string,
    callback: (error?: Error) => void
  ): void {
    this.zkClient.remove(lockPath, (error: any) => {
      if (error) {
        this.options.logger.error(
          `Error in releasing lock on path ${lockPath}  error: ${error.message}`
        );

        callback(error as Error | undefined);
        return;
      }
      this.options.logger.info(
        `Lock released successfully on path ${lockPath}`
      );
      callback();
    });
  }

  public close(): void {
    this.options.logger.info("Distributed Lock closing connextion");
    this.zkClient.close();
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.zkClient.on(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void): void {
    this.zkClient.once(event, listener);
  }
}
