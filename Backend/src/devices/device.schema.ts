import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Device {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  name: string;
}

export const deviceSchema = SchemaFactory.createForClass(Device);
