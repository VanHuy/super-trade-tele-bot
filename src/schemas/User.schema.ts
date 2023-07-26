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
  email: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: String })
  codeResetPassword: string;

  @Prop({ type: Date })
  codeResetPasswordExpiredAt: Date;

  @Prop({ type: Date })
  passwordChangedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginate);
UserSchema.plugin(aggregatePaginate);
