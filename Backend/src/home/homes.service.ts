import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Home } from 'src/schema/home.schema';
import { CreateHomeDto } from './dto/createHome.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/schema/user.schema';

@Injectable()
export class HomesService {
  constructor(
    @InjectModel(Home.name) private homeModel: Model<Home>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly usersService: UsersService,
  ) {}

  async getAllHomes(userId: string): Promise<Home[]> {
    const homes = await this.homeModel
      .find({ $or: [{ owner: userId }, { members: userId }] })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();
    return homes;
  }

  async getHomeById(homeId: string, userId: string): Promise<Home> {
    const home = await this.homeModel
      .findOne({
        _id: homeId,
        $or: [{ owner: userId }, { members: userId }],
      })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .exec();
    if (!home) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }
    return home;
  }

  async createHome(
    createHomeDto: CreateHomeDto,
    userId: string,
  ): Promise<Home> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const newHome = await this.homeModel.create({
        ...createHomeDto,
        owner: user._id,
        members: [],
      });

      await this.userModel.findByIdAndUpdate(userId, {
        $push: { ownedHomes: newHome._id },
      });

      return await newHome.populate([
        { path: 'owner', select: 'name email' },
        { path: 'members', select: 'name email' },
      ]);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create home',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateHome(
    homeId: string,
    updateHomeDto: CreateHomeDto,
    userId: string,
  ): Promise<Home> {
    const home = await this.homeModel.findOne({ _id: homeId, owner: userId });
    if (!home) {
      throw new HttpException(
        'Home not found or unauthorized',
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedHome = await this.homeModel
      .findByIdAndUpdate(homeId, updateHomeDto, {
        new: true,
        runValidators: true,
      })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!updatedHome) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }

    return updatedHome;
  }

  async deleteHome(homeId: string, userId: string): Promise<void> {
    const result = await this.homeModel.findOneAndDelete({
      _id: homeId,
      owner: userId,
    });

    if (!result) {
      throw new HttpException('Home not found', HttpStatus.NOT_FOUND);
    }

    // Update the user document to remove the home reference
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { ownedHomes: homeId },
    });

    // Also remove the home from memberOfHomes for all members
    await this.userModel.updateMany(
      { memberOfHomes: homeId },
      { $pull: { memberOfHomes: homeId } },
    );
  }

  async addMember(
    homeId: string,
    memberId: string,
    userId: string,
  ): Promise<Home> {
    const [home, memberUser] = await Promise.all([
      this.homeModel.findOne({ _id: homeId, owner: userId }),
      this.userModel.findById(memberId),
    ]);

    if (!home) {
      throw new HttpException(
        'Home not found or unauthorized',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!memberUser) {
      throw new HttpException('Member user not found', HttpStatus.NOT_FOUND);
    }

    if (
      home.members.map((m) => m.toString()).includes(memberId) ||
      home.owner.toString() === memberId
    ) {
      throw new HttpException(
        'User is already a member',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedHome = await this.homeModel
      .findByIdAndUpdate(
        homeId,
        { $addToSet: { members: memberId } },
        { new: true },
      )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    await this.userModel.findByIdAndUpdate(memberId, {
      $addToSet: { memberOfHomes: homeId },
    });

    return updatedHome;
  }

  async removeMember(
    homeId: string,
    memberId: string,
    userId: string,
  ): Promise<Home> {
    const home = await this.homeModel.findOne({ _id: homeId, owner: userId });

    if (!home) {
      throw new HttpException(
        'Home not found or unauthorized',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!home.members.map((member) => member.toString()).includes(memberId)) {
      throw new HttpException('User is not a member', HttpStatus.BAD_REQUEST);
    }

    const updatedHome = await this.homeModel
      .findByIdAndUpdate(
        homeId,
        { $pull: { members: memberId } },
        { new: true },
      )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    await this.userModel.findByIdAndUpdate(memberId, {
      $pull: { memberOfHomes: homeId },
    });

    return updatedHome;
  }
}
