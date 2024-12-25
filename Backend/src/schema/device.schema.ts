import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true })
  deviceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true })
  homeId: string;

  @Prop()
  description?: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'INACTIVE' })
  state: string;

  @Prop()
  lastConnected?: Date;

  @Prop({
    required: true,
    enum: ['Light', 'Atmosphere Sensor', 'Security Camera', 'Other'],
  })
  type: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
