import { Router } from "express";
import { UserController } from "../controllers/user.controller";

export function createUserRoutes(userController: UserController) {
  const router = Router();

  router.get("/", (req, res) => userController.getAllUsers(req, res));
  router.get("/:id", (req, res) => userController.getUserById(req, res));
  router.post("/", (req, res) => userController.createUser(req, res));
  router.put("/:id", (req, res) => userController.updateUser(req, res));
  router.delete("/:id", (req, res) => userController.deleteUser(req, res));

  return router;
}
