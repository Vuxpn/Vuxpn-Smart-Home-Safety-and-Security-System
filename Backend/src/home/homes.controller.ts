import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { HomesService } from './homes.service';
import { CreateHomeDto } from './dto/createHome.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('home')
@UseGuards(AuthGuard)
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Get()
  async getAllHomes() {
    return await this.homesService.getAllHomes();
  }

  @Get(':id')
  async getHomeById(@Param('id') id: string) {
    return await this.homesService.getHomeById(id);
  }

  @Post('create')
  async createHome(@Body() createHomeDto: CreateHomeDto) {
    return await this.homesService.createHome(createHomeDto);
  }

  @Put(':id')
  async updateHome(
    @Param('id') id: string,
    @Body() updateHomeDto: CreateHomeDto,
  ) {
    return await this.homesService.updateHome(id, updateHomeDto);
  }

  @Delete(':id')
  async deleteHome(@Param('id') id: string) {
    return await this.homesService.deleteHome(id);
  }
}
