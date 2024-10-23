import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name, 'user') private userModel: Model<User>) {}

  async getUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec(); // Chờ cho Promise hoàn thành
    console.log(user);
    if (user) {
      return user; // Trả về user nếu tìm thấy
    } // Ném lỗi nếu không tìm thấy
  }

  getUserById(id: string) {
    const user = this.userModel.findById(id);
    if (user) {
      return user;
    }
    throw new HttpException('không tìm thấy user', HttpStatus.NOT_FOUND);
  }

  async createUser(userData: CreateUserDto) {
    const newUser = await this.userModel.create(userData);
    return newUser;
  }
}
