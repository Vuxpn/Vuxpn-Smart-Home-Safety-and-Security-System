import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, //match: phải phù hợp với một regex được định nghĩa mới có thể lưu vào database
  })
  email: string;

  @Prop({ required: true, minlength: 2, maxlength: 60 })
  name: string;

  @Prop({ required: true }) //select: nếu là false thì khi truy vấn dữ liệu từ cơ sở dữ liệu, giá trị của thuộc tính này sẽ không được trả về.
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
