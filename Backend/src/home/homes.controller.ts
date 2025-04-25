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
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Home')
@Controller('home')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Get()
  async getAllHomes(@Request() req) {
    return await this.homesService.getAllHomes(req.user.userId);
  }

  @Get(':id')
  async getHomeById(@Param('id') id: string, @Request() req) {
    return await this.homesService.getHomeById(id, req.user.userId);
  }

  @Post('create')
  async createHome(@Body() createHomeDto: CreateHomeDto, @Request() req) {
    return await this.homesService.createHome(createHomeDto, req.user.userId);
  }

  @Put('update/:id')
  async updateHome(
    @Param('id') id: string,
    @Body() updateHomeDto: CreateHomeDto,
    @Request() req,
  ) {
    return await this.homesService.updateHome(
      id,
      updateHomeDto,
      req.user.userId,
    );
  }

  @Delete('delete/:id')
  async deleteHome(@Param('id') id: string, @Request() req) {
    return await this.homesService.deleteHome(id, req.user.userId);
  }

  @Delete(':id/members/:memberId')
  async removeMember(
    @Param('id') homeId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return await this.homesService.removeMember(
      homeId,
      memberId,
      req.user.userId,
    );
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
      req.user.userId,
    );
  }
}
