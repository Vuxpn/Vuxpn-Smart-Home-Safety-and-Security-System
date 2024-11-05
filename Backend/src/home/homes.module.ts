import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Home, HomeSchema } from 'src/schema/home.schema';
import { User, UserSchema } from 'src/schema/user.schema';
import { HomesController } from './homes.controller';
import { HomesService } from './homes.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Home.name, schema: HomeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [HomesController],
  providers: [HomesService],
  exports: [MongooseModule, HomesService],
})
export class HomesModule {}
