import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Home {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  devices: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: User[];
}

export const HomeSchema = SchemaFactory.createForClass(Home);
