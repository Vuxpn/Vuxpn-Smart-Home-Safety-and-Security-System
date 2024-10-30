import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Home {
  @Prop({ required: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop()
  devices: string;
}

export const HomeSchema = SchemaFactory.createForClass(Home);
