import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { Model } from 'mongoose';
import CreateUserDto from './dto/createUser.dto';
import { Home } from 'src/schema/home.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    //@InjectModel(Home.name, 'home') private homeModel: Model<Home>,
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      return user;
    }
    throw new HttpException('không tìm thấy user', HttpStatus.NOT_FOUND);
  }

  async createUser(userData: CreateUserDto) {
    const newUser = await this.userModel.create(userData);
    return newUser;
  }

  async updateUserPassword(email: string, hashedPassword: string) {
    const result = await this.userModel.findOneAndUpdate(
      { email: email },
      { password: hashedPassword },
      { new: true },
    );

    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return result;
  }

  async addOwnedHome(userId: string, homeId: string) {
    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { ownedHomes: homeId } },
        { new: true },
      )
      .populate('ownedHomes', 'name address');

    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async addMemberHome(userId: string, homeId: string) {
    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { memberOfHomes: homeId } },
        { new: true },
      )
      .populate('memberOfHomes');

    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  async getUserWithHomes(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('ownedHomes')
      .populate('memberOfHomes')
      .exec();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async removeMemberHome(userId: string, homeId: string) {
    const result = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { memberOfHomes: homeId } },
        { new: true },
      )
      .populate('memberOfHomes');

    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
