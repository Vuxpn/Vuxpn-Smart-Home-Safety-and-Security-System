import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Home } from 'src/schema/home.schema';
import { CreateHomeDto } from './dto/createHome.dto';

@Injectable()
export class HomesService {
  constructor(@InjectModel(Home.name, 'home') private homeModel: Model<Home>) {}

  async getAllHomes(): Promise<Home[]> {
    const homes = await this.homeModel.find().exec();
    return homes;
  }

  async getHomeById(homeId: string): Promise<Home> {
    const home = await this.homeModel.findById(homeId).exec();
    if (!home) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }
    return home;
  }

  async createHome(createHomeDto: CreateHomeDto): Promise<Home> {
    try {
      const newHome = await this.homeModel.create(createHomeDto);
      return newHome;
    } catch (error) {
      throw new HttpException(
        'Failed to create home',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateHome(
    homeId: string,
    updateHomeDto: CreateHomeDto,
  ): Promise<Home> {
    const updatedHome = await this.homeModel.findByIdAndUpdate(
      homeId,
      updateHomeDto,
      { new: true, runValidators: true },
    );

    if (!updatedHome) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }

    return updatedHome;
  }

  async deleteHome(homeId: string): Promise<void> {
    const result = await this.homeModel.findByIdAndDelete(homeId);
    if (!result) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }
  }
}
