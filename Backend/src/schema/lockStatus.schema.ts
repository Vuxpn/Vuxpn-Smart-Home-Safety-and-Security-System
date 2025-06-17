import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LockStatusDocument = LockStatus & Document;

@Schema()
export class LockStatus {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  locked: boolean;

  @Prop({ default: 0 })
  failedAttempts: number;

  @Prop({ required: true })
  timestamp: Date;
}

export const LockStatusSchema = SchemaFactory.createForClass(LockStatus);
