import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from './device.schema';

@Schema({ timestamps: true })
export class Image extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  deviceId: Types.ObjectId;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
