import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MQTT_TOPICS } from 'src/mqtt/mqtt.constants';
import { UnlockDoorDto } from './dto/unlockDoor.dto';
import { LockDoorDto } from './dto/lockDoor.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SmartLockService {
  constructor(@Inject('MQTT_CLIENT') private readonly client: ClientProxy) {}

  async unlockDoor(data: UnlockDoorDto) {
    try {
      const topic = `${MQTT_TOPICS.UNLOCK_DOOR}/${data.deviceId}`;
      const message = {
        deviceId: data.deviceId,
        state: data.state,
        password: data.password,
      };
      await lastValueFrom(this.client.emit(topic, message));
      return { success: true, message: 'Unlock command sent' };
    } catch (error) {
      throw error;
    }
  }

  async lockDoor(data: LockDoorDto) {
    try {
      const topic = `${MQTT_TOPICS.LOCK_DOOR}/${data.deviceID}`;
      const message = { deviceId: data.deviceID, state: data.state };
      await lastValueFrom(this.client.emit(topic, message));
      return { success: true, message: 'Lock command sent' };
    } catch (error) {
      throw error;
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
      await lastValueFrom(this.client.emit(topic, message));
      return { success: true, message: 'Password changed' };
    } catch (error) {
      throw error;
    }
  }
}
