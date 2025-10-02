import { Router } from "express";
import { PostController } from "../controllers/post.controller";

export function createPostRoutes(postController: PostController) {
  const router = Router();

  router.get("/", (req, res) => postController.getAllPosts(req, res));
  router.get("/:id", (req, res) => postController.getPostById(req, res));
  router.post("/", (req, res) => postController.createPost(req, res));
  router.put("/:id", (req, res) => postController.updatePost(req, res));
  router.delete("/:id", (req, res) => postController.deletePost(req, res));

  return router;
}
