import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Home, HomeSchema } from 'src/schema/home.schema';
import { HomesController } from './homes.controller';
import { HomesService } from './homes.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Home.name, schema: HomeSchema }],
      'home',
    ),
  ],
  controllers: [HomesController],
  providers: [HomesService],
})
export class HomesModule {}
