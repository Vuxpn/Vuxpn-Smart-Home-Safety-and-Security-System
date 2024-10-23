import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/createDevice.dto';

@Controller('device')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAllDevices() {
    return this.devicesService.getAllDevices();
  }

  @Get(':id')
  getDeviceById(@Param('id') deviceId: string) {
    return this.devicesService.getDeviceById(deviceId);
  }

  @Post('create')
  handlePostRequest(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.createDevice(createDeviceDto);
  }
}
