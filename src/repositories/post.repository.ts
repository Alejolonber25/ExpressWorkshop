import { Post } from "../entities/post.entity";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { DataSource, IsNull, Not } from "typeorm";

export const PostRepository = (dataSource: DataSource) =>
  dataSource.getRepository(Post).extend({
    async getAll(): Promise<Post[]> {
      return this.find({ relations: ["user"] });
    },

    async getById(id: number): Promise<Post | null> {
      return this.findOne({ where: { id }, relations: ["user"] });
    },

    async createPost(postDto: CreatePostDto): Promise<Post> {
      const post = this.create(postDto);
      return this.save(post);
    },

    async updatePost(id: number, postDto: UpdatePostDto): Promise<Post | null> {
      const post = await this.findOne({ where: { id } });
      if (!post) return null;
      Object.assign(post, postDto);
      return this.save(post);
    },
  });
