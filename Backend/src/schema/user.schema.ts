import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Home } from './home.schema';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  email: string;

  @Prop({ required: true, minlength: 2, maxlength: 60 })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }],
    default: [],
  })
  ownedHomes: Home[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }],
    default: [],
  })
  memberOfHomes: Home[];
}

export const UserSchema = SchemaFactory.createForClass(User);
