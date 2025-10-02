import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Post } from "../entities/post.entity";

export const TestDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  entities: [User, Post],
});
