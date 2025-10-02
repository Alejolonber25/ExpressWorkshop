import { User } from "../entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { DataSource } from "typeorm";

export const UserRepository = (dataSource: DataSource) =>
  dataSource.getRepository(User).extend({
    async getAll(): Promise<User[]> {
      return this.find();
    },

    async getById(id: number): Promise<User | null> {
      return this.findOne({ where: { id } });
    },

    async createUser(userDto: CreateUserDto): Promise<User> {
      const user = this.create(userDto);
      return this.save(user);
    },

    async updateUser(id: number, userDto: UpdateUserDto): Promise<User | null> {
      const user = await this.findOne({ where: { id } });
      if (!user) return null;
      Object.assign(user, userDto);
      return this.save(user);
    }
  });
