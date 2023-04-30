/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import * as zookeeper from 'node-zookeeper-client'
import { logger } from './logger'
import { type Logger } from 'winston'

export interface DistributedLockOptions {
  logger: Logger
}
export class DistributedLock {
  public readonly zkClient: zookeeper.Client
  private readonly zkConnectString: string
  private readonly lockPath: string
  private readonly ready: Promise<any>
  private readonly logger: Logger
  constructor (
    zkConnectString: string,
    lockPath: string,
    options?: DistributedLockOptions
  ) {
    this.zkConnectString = zkConnectString
    this.lockPath = lockPath
    this.zkClient = zookeeper.createClient(this.zkConnectString)
    this.logger = (options != null) && options.logger ? options.logger : logger
    this.ready = this.init()
  }

  public async init (): Promise<void> {
    this.zkClient.once('connected', () => {
      this.logger.info('Distributed Lock initialised')
    })

    await this.zkClient.connect()
  }

  public async acquireLock (callback: (error?: Error) => void): Promise<void> {
    await this.ready
    this.zkClient.create(
      this.lockPath,
      null as any,
      zookeeper.CreateMode.EPHEMERAL,
      (error: any, lockPath: any) => {
        if (error) {
          this.logger.error(
            `Error in acquiring lock on path ${lockPath} error: ${error.message}`
          )
          callback(error as Error | undefined)
          return
        }
        this.logger.info(`Lock acquiring successfully on path ${lockPath}`)

        callback()
      }
    )
  }

  public releaseLock (
    lockPath: string,
    callback: (error?: Error) => void
  ): void {
    this.zkClient.remove(lockPath, (error: any) => {
      if (error) {
        this.logger.error(
          `Error in releasing lock on path ${lockPath}  error: ${error.message}`
        )

        callback(error as Error | undefined)
        return
      }
      this.logger.info(`Lock released successfully on path ${lockPath}`)
      callback()
    })
  }

  public close (): void {
    this.logger.info('Distributed Lock closing connextion')
    this.zkClient.close()
  }

  public on (event: string, listener: (...args: any[]) => void): void {
    this.zkClient.on(event, listener)
  }

  public once (event: string, listener: (...args: any[]) => void): void {
    this.zkClient.once(event, listener)
  }
}
