import { Post } from "../entities/post.entity";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { PostRepository } from "../repositories/post.repository";
import { UserRepository } from "../repositories/user.repository";
import { DataSource } from "typeorm";

export interface IPostService {
  getAllPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | null>;
  createPost(postDto: CreatePostDto): Promise<Post>;
  updatePost(id: number, postDto: UpdatePostDto): Promise<Post | null>;
  deletePost(id: number): Promise<void>;
}

export class PostService implements IPostService {
  private postRepository;
  private userRepository;

  constructor(private dataSource: DataSource) {
    this.postRepository = PostRepository(dataSource);
    this.userRepository = UserRepository(dataSource);
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.getAll();
  }

  async getPostById(id: number): Promise<Post | null> {
    return await this.postRepository.getById(id);
  }

  async createPost(postDto: CreatePostDto): Promise<Post> {
    const { title, content, userId } = postDto;

    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = this.postRepository.create({
      title,
      content,
      user: user,
    });

    return await this.postRepository.save(post);
  }
  async updatePost(id: number, postDto: UpdatePostDto): Promise<Post | null> {
    const post = await this.postRepository.getById(id);
    if (!post) return null;

    this.postRepository.merge(post, postDto);
    return await this.postRepository.save(post);
  }

  async deletePost(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }

}