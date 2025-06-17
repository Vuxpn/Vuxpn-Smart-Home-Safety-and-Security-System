import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DoorLogDocument = DoorLog & Document;

@Schema()
export class DoorLog {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  event: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const DoorLogSchema = SchemaFactory.createForClass(DoorLog);
