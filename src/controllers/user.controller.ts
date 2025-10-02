import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    res.json(users);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const user = await this.userService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(user);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const updated = await this.userService.updateUser(id, req.body);

    if (!updated) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(updated);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await this.userService.deleteUser(id);
    res.status(204).send();
  }
}
