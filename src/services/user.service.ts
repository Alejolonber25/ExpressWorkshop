import { User } from "../entities/user.entity";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { DataSource } from "typeorm";
import { UserRepository } from "../repositories/user.repository";

export interface IUserService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  createUser(userDto: CreateUserDto): Promise<User>;
  updateUser(id: number, userDto: UpdateUserDto): Promise<User | null>;
  deleteUser(id: number): Promise<void>;
}

export class UserService implements IUserService {
    private userRepository;
  
    constructor(private dataSource: DataSource) {
      this.userRepository = UserRepository(dataSource);
    }
  

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.getAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.getById(id);
  }

  async createUser(userDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userDto);
    return await this.userRepository.save(user);
  }

  async updateUser(id: number, userDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.getById(id);
    if (!user) return null;

    this.userRepository.merge(user, userDto);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

}
