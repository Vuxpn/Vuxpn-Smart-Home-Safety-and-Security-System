import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  MultipleDeviceNotificationDto,
  TopicNotificationDto,
} from './dto/create-notification.dto';

@ApiTags('notifications')
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-notification')
  @ApiOperation({ summary: 'Send a push notification to a single device' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(
    @Body() body: { token: string; title: string; body: string; icon: string },
  ) {
    return this.notificationService.sendNotification({
      token: body.token,
      title: body.title,
      body: body.body,
      icon: body.icon,
    });
  }

  @Post('send-multiple-notifications')
  @ApiOperation({ summary: 'Send push notifications to multiple devices' })
  @ApiResponse({ status: 200, description: 'Notifications sent successfully' })
  async sendMultipleNotifications(@Body() body: MultipleDeviceNotificationDto) {
    return this.notificationService.sendNotificationToMultipleTokens({
      tokens: body.tokens,
      title: body.title,
      body: body.body,
      icon: body.icon,
    });
  }

  @Post('send-topic-notification')
  @ApiOperation({ summary: 'Send a push notification to a topic' })
  @ApiResponse({
    status: 200,
    description: 'Topic notification sent successfully',
  })
  async sendTopicNotification(@Body() body: TopicNotificationDto) {
    return this.notificationService.sendTopicNotification({
      topic: body.topic,
      title: body.title,
      body: body.body,
      icon: body.icon,
    });
  }
}
