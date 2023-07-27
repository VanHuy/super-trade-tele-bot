import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
const paginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
}

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    unique: true,
    index: true,
    sparse: true,
    trim: true,
  })
  userId: string;

  @Prop({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: String })
  privateKey: string;

  @Prop({ type: String })
  walletAddress: string;

  @Prop({ type: String })
  gas: string;

  @Prop({ type: String })
  slippage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginate);
UserSchema.plugin(aggregatePaginate);
