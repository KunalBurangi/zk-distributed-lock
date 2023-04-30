/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import * as zookeeper from 'node-zookeeper-client';

export class DistributedLock {
  public readonly zkClient: zookeeper.Client;
  private readonly zkConnectString: string;
  private readonly lockPath: string;
  private readonly ready: Promise<any>;

  constructor(zkConnectString: string, lockPath: string) {
    this.zkConnectString = zkConnectString;
    this.lockPath = lockPath;
    this.zkClient = zookeeper.createClient(this.zkConnectString);
    this.ready = this.init();

  }

  public async init():Promise<void>{
  this.zkClient.once('connected', () => {
      console.log("zk connected");
  });

  await this.zkClient.connect();
  }
  public async acquireLock(
    callback: (error?: Error) => void,
  ): Promise<void> {
    await this.ready;
    this.zkClient.create(
      this.lockPath,
      null as any,
      zookeeper.CreateMode.EPHEMERAL,
      (error:any, lockPath:any) => {
        if (error) {
          callback(error as Error | undefined);
          return;
        }

        callback();
      },
    );
  }

  public releaseLock(
    lockPath: string,
    callback: (error?: Error) => void,
  ): void {
    this.zkClient.remove(lockPath, (error:any) => {
      if (error) {
        callback(error as Error | undefined);
        return;
      }

      callback();
    });
  }

  public close():void{
    this.zkClient.close();
  }
  public on(event: string, listener: (...args: any[]) => void): void {
    this.zkClient.on(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void): void {
    this.zkClient.once(event, listener);
  }
}
