import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import CreatePostDto from './dto/createPost.dto';
import Posts from './post.interface';
import UpdatePostDto from './dto/updatePost.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schema/post.schema';
import { Model } from 'mongoose';

@Injectable()
export default class PostsService {
  constructor(@InjectModel(Post.name, 'post') private postModel: Model<Post>) {}
  private lastPostId = 0;
  private posts: Post[] = [];

  async getAllPosts(): Promise<Post[]> {
    const posts = await this.postModel.find().exec();
    return posts;
  }

  getPostById(id: string) {
    const post = this.postModel.findById(id).exec();
    if (post) {
      return post;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async replacePost(id: string, post: UpdatePostDto) {
    const postUpdate = await this.postModel.findOneAndUpdate(
      { _id: id }, //trả về _id thay vì id
      { $set: post },
      { new: true },
    );
    // Kiểm tra xem bài viết có được cập nhật hay không
    if (!postUpdate) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND); // Ném ngoại lệ nếu không tìm thấy
    }

    return postUpdate; // Trả về bài viết đã được cập nhật
  }

  async createPost(post: CreatePostDto) {
    const newPost = { ...post };
    await this.postModel.create(post);
    return newPost;
  }

  async deletePost(id: string) {
    const result = await this.postModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND); // Nếu không tìm thấy bài viết để xóa
    }
  }
}
