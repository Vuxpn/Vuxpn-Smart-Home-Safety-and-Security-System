// image.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from './device.schema';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.hash;
      return ret;
    },
  },
})
export class Image extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
  })
  deviceId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  hash: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({
    required: true,
    index: true,
    default: Date.now,
  })
  timestamp: number;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
