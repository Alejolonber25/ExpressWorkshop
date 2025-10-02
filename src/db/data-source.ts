import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Post } from "../entities/post.entity";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true,
  entities: [User, Post],
});