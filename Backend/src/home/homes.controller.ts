import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HomesService } from './homes.service';
import { CreateHomeDto } from './dto/createHome.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('home')
@UseGuards(AuthGuard)
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Get()
  async getAllHomes(@Request() req) {
    return await this.homesService.getAllHomes(req.user.sub);
  }

  @Get(':id')
  async getHomeById(@Param('id') id: string, @Request() req) {
    return await this.homesService.getHomeById(id, req.user.sub);
  }

  @Post('create')
  async createHome(@Body() createHomeDto: CreateHomeDto, @Request() req) {
    return await this.homesService.createHome(createHomeDto, req.user.sub);
  }

  @Put('update/:id')
  async updateHome(
    @Param('id') id: string,
    @Body() updateHomeDto: CreateHomeDto,
    @Request() req,
  ) {
    return await this.homesService.updateHome(id, updateHomeDto, req.user.sub);
  }

  @Delete('delete/:id')
  async deleteHome(@Param('id') id: string, @Request() req) {
    return await this.homesService.deleteHome(id, req.user.sub);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') homeId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return await this.homesService.removeMember(homeId, memberId, req.user.sub);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') homeId: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req,
  ) {
    return await this.homesService.addMemberByEmail(
      homeId,
      addMemberDto.email,
      req.user.sub,
    );
  }
}
