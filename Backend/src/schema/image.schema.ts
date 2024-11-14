import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Image {
  @Prop({ required: true })
  url: string;

  @Prop({ default: Date.now })
  creatAt: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }] })
  deviceId: string;
}

export const imageSchema = SchemaFactory.createForClass(Image);
