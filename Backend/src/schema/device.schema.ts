import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'INACTIVE' })
  state: string;

  @Prop()
  lastConnected: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
