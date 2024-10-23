import { Module } from '@nestjs/common';
import PostsController from './posts.controller';
import PostsService from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Post.name, schema: PostSchema }],
      'post',
    ),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
