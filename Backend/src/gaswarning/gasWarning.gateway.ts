import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GasWarningGateway {
  private readonly logger = new Logger(GasWarningGateway.name);
  @WebSocketServer() server: Server;
  private connectedDevices = new Map<string, Set<string>>(); // deviceId -> Set of socket IDs

  // Handle client connection
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Handle client disconnection
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all device subscriptions
    this.connectedDevices.forEach((clients, deviceId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.connectedDevices.delete(deviceId);
        }
      }
    });
  }

  // Subscribe to device data
  @SubscribeMessage('subscribe_device')
  handleSubscribeDevice(client: Socket, deviceId: string) {
    this.logger.log(`Client ${client.id} subscribing to device: ${deviceId}`);

    if (!this.connectedDevices.has(deviceId)) {
      this.connectedDevices.set(deviceId, new Set());
    }
    this.connectedDevices.get(deviceId).add(client.id);

    // Join the device-specific room
    client.join(`device_${deviceId}`);
  }

  // Unsubscribe from device data
  @SubscribeMessage('unsubscribe_device')
  handleUnsubscribeDevice(client: Socket, deviceId: string) {
    this.logger.log(
      `Client ${client.id} unsubscribing from device: ${deviceId}`,
    );

    const deviceClients = this.connectedDevices.get(deviceId);
    if (deviceClients) {
      deviceClients.delete(client.id);
      if (deviceClients.size === 0) {
        this.connectedDevices.delete(deviceId);
      }
    }

    // Leave the device-specific room
    client.leave(`device_${deviceId}`);
  }

  // Broadcast sensor data to subscribed clients
  broadcastSensorData(deviceId: string, data: any) {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }

    // Đảm bảo dữ liệu luôn đúng format trước khi gửi
    const sanitizedData = {
      type: data.type,
      value: Number(data.value) || 0, // Fallback về 0 nếu giá trị không hợp lệ
      timestamp: data.timestamp || new Date().toISOString(),
    };

    const eventName = `sensor_data_${deviceId}`;
    this.server.to(`device_${deviceId}`).emit(eventName, sanitizedData);
  }
}
