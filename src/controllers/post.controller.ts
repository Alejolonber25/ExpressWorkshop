import { Request, Response } from "express";
import { PostService } from "../services/post.service";

export class PostController {
  constructor(private postService: PostService) {}

  async getAllPosts(req: Request, res: Response): Promise<void> {
    const posts = await this.postService.getAllPosts();
    res.json(posts);
  }

  async getPostById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const post = await this.postService.getPostById(id);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(post);
  }

  async createPost(req: Request, res: Response): Promise<void> {
    const post = await this.postService.createPost(req.body);
    res.status(201).json(post);
  }

  async updatePost(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const updated = await this.postService.updatePost(id, req.body);

    if (!updated) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    res.json(updated);
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await this.postService.deletePost(id);
    res.status(204).send();
  }

  async getAllPostsOfUser(req: Request, res: Response): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getPostByIdsOfUser(req: Request, res: Response): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
