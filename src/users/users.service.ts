import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findUserByUserId(userId: string): Promise<User> {
    return await this.userModel.findOne({ userId: userId });
  }

  async updateSlippage(userId: string, slippage: string): Promise<User> {
    const user = await this.userModel.findOne({ userId: userId });
    if (user == null) {
      const userDto = new CreateUserDto();
      userDto.userId = userId;
      userDto.slippage = slippage;
      return await this.create(userDto);
    }
    user.slippage = slippage;
    await user.save();
    return user;
  }

  async updateGas(userId: string, gas: string): Promise<User> {
    const user = await this.userModel.findOne({ userId: userId });
    if (user == null) {
      const userDto = new CreateUserDto();
      userDto.userId = userId;
      userDto.gas = gas;
      return await this.create(userDto);
    }
    user.gas = gas;
    await user.save();
    return user;
  }

  async updateWallet(
    userId: string,
    walletAddress: string,
    privateKey: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({ userId: userId });
    if (user == null) {
      const userDto = new CreateUserDto();
      userDto.userId = userId;
      userDto.walletAddress = walletAddress;
      userDto.privateKey = privateKey;
      return await this.create(userDto);
    }
    user.walletAddress = walletAddress;
    user.privateKey = privateKey;
    await user.save();
    return user;
  }
}
