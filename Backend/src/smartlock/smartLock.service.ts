import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { UnlockDoorDto } from './dto/unlockDoor.dto';
import { LockDoorDto } from './dto/lockDoor.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { lastValueFrom, firstValueFrom, timeout } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DoorLog, DoorLogDocument } from 'src/schema/doorLog.schema';
import { LockStatus, LockStatusDocument } from 'src/schema/lockStatus.schema';

@Injectable()
export class SmartLockService {
  private readonly logger = new Logger(SmartLockService.name);
  private readonly responseTimeout = 10000; // 10 giây timeout cho phản hồi từ thiết bị

  private pendingResponses = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      timer: NodeJS.Timeout;
    }
  >();

  constructor(
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    @InjectModel(DoorLog.name) private doorLogModel: Model<DoorLogDocument>,
    @InjectModel(LockStatus.name)
    private lockStatusModel: Model<LockStatusDocument>,
  ) {}

  private registerPendingResponse(
    operationType: string,
    deviceId: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const responseKey = `${operationType}:${deviceId}`;

      const timer = setTimeout(() => {
        //
        if (this.pendingResponses.has(responseKey)) {
          this.pendingResponses.delete(responseKey);
          reject(new Error('Device response timeout'));
        }
      }, this.responseTimeout);

      this.pendingResponses.set(responseKey, { resolve, reject, timer });
    });
  }

  public resolvePendingResponse(
    operationType: string,
    deviceId: string,
    data: any,
  ): boolean {
    const responseKey = `${operationType}:${deviceId}`;
    const pendingResponse = this.pendingResponses.get(responseKey);

    if (pendingResponse) {
      clearTimeout(pendingResponse.timer);

      pendingResponse.resolve(data);

      this.pendingResponses.delete(responseKey);
      return true;
    }

    return false;
  }

  public rejectPendingResponse(
    operationType: string,
    deviceId: string,
    error: any,
  ): boolean {
    const responseKey = `${operationType}:${deviceId}`;
    const pendingResponse = this.pendingResponses.get(responseKey);

    if (pendingResponse) {
      clearTimeout(pendingResponse.timer);

      pendingResponse.reject(error);

      this.pendingResponses.delete(responseKey);
      return true;
    }

    return false;
  }

  async unlockDoor(data: UnlockDoorDto) {
    try {
      const topic = `${MQTT_TOPICS.UNLOCK_DOOR}/${data.deviceId}`;
      const message = {
        deviceId: data.deviceId,
        state: data.state,
        password: data.password,
      };

      this.logger.log(`Sending unlock command to device ${data.deviceId}`);

      const responsePromise = this.registerPendingResponse(
        'unlock',
        data.deviceId,
      );

      await lastValueFrom(this.client.emit(topic, message));

      const response = await responsePromise;

      this.logger.log(
        `Received unlock response for ${data.deviceId}: ${JSON.stringify(response)}`,
      );

      if (response && response.status === 'success') {
        return {
          success: true,
          message: 'Đã mở cửa thành công',
          data: response,
        };
      } else {
        return {
          success: false,
          message: response?.reason || 'Không thể mở cửa',
          data: response,
        };
      }
    } catch (error) {
      this.logger.error(`Error in unlockDoor: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Lỗi khi mở cửa',
      };
    }
  }

  async lockDoor(data: LockDoorDto) {
    try {
      const topic = `${MQTT_TOPICS.LOCK_DOOR}/${data.deviceID}`;
      const message = { deviceId: data.deviceID, state: data.state };

      this.logger.log(`Sending lock command to device ${data.deviceID}`);

      const responsePromise = this.registerPendingResponse(
        'lock',
        data.deviceID,
      );

      await lastValueFrom(this.client.emit(topic, message));

      const response = await responsePromise;

      this.logger.log(
        `Received lock response for ${data.deviceID}: ${JSON.stringify(response)}`,
      );

      if (response && response.status === 'success') {
        return {
          success: true,
          message: 'Đã khóa cửa thành công',
          data: response,
        };
      } else {
        return {
          success: false,
          message: response?.reason || 'Không thể khóa cửa',
          data: response,
        };
      }
    } catch (error) {
      this.logger.error(`Error in lockDoor: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Lỗi khi khóa cửa',
      };
    }
  }

  async changePassword(data: ChangePasswordDto) {
    try {
      const topic = `${MQTT_TOPICS.CHANGE_PASS_DOOR}/${data.deviceID}`;
      const message = {
        deviceId: data.deviceID,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      };

      this.logger.log(
        `Sending change password command to device ${data.deviceID}`,
      );

      const responsePromise = this.registerPendingResponse(
        'changepass',
        data.deviceID,
      );

      await lastValueFrom(this.client.emit(topic, message));

      const response = await responsePromise;

      this.logger.log(
        `Received change password response for ${data.deviceID}: ${JSON.stringify(response)}`,
      );

      if (response && response.status === 'success') {
        return {
          success: true,
          message: 'Đã đổi mật khẩu thành công',
          data: response,
        };
      } else {
        return {
          success: false,
          message: response?.reason || 'Không thể đổi mật khẩu',
          data: response,
        };
      }
    } catch (error) {
      this.logger.error(`Error in changePassword: ${error.message}`);
      return {
        success: false,
        message: error.message || 'Lỗi khi đổi mật khẩu',
      };
    }
  }

  async processLockStatus(deviceId: string, data: any) {
    try {
      this.logger.log(
        `Received lock status from device ${deviceId}: ${JSON.stringify(data)}`,
      );

      if (!data || typeof data.locked === 'undefined') {
        this.logger.warn(`Invalid lock status data from device ${deviceId}`);
        return;
      }

      const lockStatus = new this.lockStatusModel({
        deviceId,
        locked: data.locked,
        failedAttempts: data.failedAttempts || 0,
        timestamp: new Date(),
      });

      await lockStatus.save();
      this.logger.log(`Saved lock status for device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Error processing lock status: ${error.message}`);
    }
  }

  async processDoorLog(deviceId: string, data: any) {
    try {
      this.logger.log(
        `Received door log from device ${deviceId}: ${JSON.stringify(data)}`,
      );

      if (!data || !data.event) {
        this.logger.warn(`Invalid door log data from device ${deviceId}`);
        return;
      }

      const doorLog = new this.doorLogModel({
        deviceId,
        event: data.event,
        status: data.status || 'unknown',
        timestamp: new Date(),
      });

      await doorLog.save();
      this.logger.log(`Saved door log for device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Error processing door log: ${error.message}`);
    }
  }

  async processUnlockDoorStatus(deviceId: string, data: any) {
    try {
      this.logger.log(
        `Received unlock door status from device ${deviceId}: ${JSON.stringify(data)}`,
      );

      const resolved = this.resolvePendingResponse('unlock', deviceId, data);

      if (resolved) {
        this.logger.log(
          `Resolved pending unlock response for device ${deviceId}`,
        );
      } else {
        this.logger.warn(`No pending unlock response for device ${deviceId}`);
      }

      if (data && data.status === 'success') {
        this.logger.log(`Door unlocked successfully for device ${deviceId}`);
      } else {
        this.logger.warn(
          `Failed to unlock door for device ${deviceId}: ${data?.reason || 'unknown reason'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing unlock door status: ${error.message}`,
      );

      this.rejectPendingResponse('unlock', deviceId, error);
    }
  }

  async processLockDoorStatus(deviceId: string, data: any) {
    try {
      this.logger.log(
        `Received lock door status from device ${deviceId}: ${JSON.stringify(data)}`,
      );

      const resolved = this.resolvePendingResponse('lock', deviceId, data);

      if (resolved) {
        this.logger.log(
          `Resolved pending lock response for device ${deviceId}`,
        );
      } else {
        this.logger.warn(`No pending lock response for device ${deviceId}`);
      }

      if (data && data.status === 'success') {
        this.logger.log(`Door locked successfully for device ${deviceId}`);
      } else {
        this.logger.warn(
          `Failed to lock door for device ${deviceId}: ${data?.reason || 'unknown reason'}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error processing lock door status: ${error.message}`);

      this.rejectPendingResponse('lock', deviceId, error);
    }
  }

  async processChangePasswordStatus(deviceId: string, data: any) {
    try {
      this.logger.log(
        `Received change password status from device ${deviceId}: ${JSON.stringify(data)}`,
      );

      const resolved = this.resolvePendingResponse(
        'changepass',
        deviceId,
        data,
      );

      if (resolved) {
        this.logger.log(
          `Resolved pending change password response for device ${deviceId}`,
        );
      } else {
        this.logger.warn(
          `No pending change password response for device ${deviceId}`,
        );
      }

      if (data && data.status === 'success') {
        this.logger.log(`Password changed successfully for device ${deviceId}`);
      } else {
        this.logger.warn(
          `Failed to change password for device ${deviceId}: ${data?.reason || 'unknown reason'}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing change password status: ${error.message}`,
      );

      this.rejectPendingResponse('changepass', deviceId, error);
    }
  }

  async getLockStatus(deviceId: string) {
    try {
      const status = await this.lockStatusModel
        .findOne({ deviceId })
        .sort({ timestamp: -1 })
        .exec();

      if (!status) {
        return { success: false, message: 'Không tìm thấy trạng thái khóa' };
      }

      return {
        success: true,
        data: {
          deviceId: status.deviceId,
          locked: status.locked,
          failedAttempts: status.failedAttempts,
          lastUpdated: status.timestamp,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting lock status: ${error.message}`);
      return { success: false, message: 'Lỗi khi lấy trạng thái khóa' };
    }
  }

  async getDoorLogs(deviceId: string, limit = 10) {
    try {
      const logs = await this.doorLogModel
        .find({ deviceId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();

      return {
        success: true,
        data: logs.map((log) => ({
          deviceId: log.deviceId,
          event: log.event,
          status: log.status,
          timestamp: log.timestamp,
        })),
      };
    } catch (error) {
      this.logger.error(`Error getting door logs: ${error.message}`);
      return { success: false, message: 'Lỗi khi lấy lịch sử mở cửa' };
    }
  }
}
