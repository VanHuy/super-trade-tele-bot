import { Controller, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
} from 'src/schemas';
import { USERS } from './data-initialization';
import * as bcrypt from 'bcrypt';
const SALT_ROUND = '12357@bum'

@Controller()
export class DbInitializationController implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    await this.initDB();
  }

  async initDB() {
    const promises = [];
    const [users] = await Promise.all([
      this.userModel.countDocuments(),
    ]);

    if (users === 0) {
      const usersData = await Promise.all(
        USERS.map(async (user) => {
          const password = await bcrypt.hash(user.password, 100);

          return {
            ...user,
            password,
          };
        }),
      );

      promises.push(this.userModel.insertMany(usersData));
    }

    await Promise.all(promises);
  }
}
