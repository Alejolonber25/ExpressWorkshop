import express from "express";
import { DataSource } from "typeorm";

import { PostService } from "./services/post.service";
import { PostController } from "./controllers/post.controller";
import { createPostRoutes } from "./routes/post.routes";

import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { createUserRoutes } from "./routes/user.routes";

export function createApp(dataSource: DataSource) {
  const app = express();
  app.use(express.json());

  const postService = new PostService(dataSource);
  const postController = new PostController(postService);
  app.use("/posts", createPostRoutes(postController));

  const userService = new UserService(dataSource);
  const userController = new UserController(userService);
  app.use("/users", createUserRoutes(userController));

  return app;
}
