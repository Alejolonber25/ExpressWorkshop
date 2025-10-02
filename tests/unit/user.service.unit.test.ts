import { UserService } from '../../src/services/user.service';
import { User } from '../../src/entities/user.entity';
import { TestDataSource } from '../../src/db/test-data-source';

const mockUserRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
};

jest.spyOn(TestDataSource, "getRepository").mockReturnValue({
  extend: () => mockUserRepository
} as any);

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(TestDataSource as any);
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('debería devolver un array de usuarios', async () => {
      const mockUsers: User[] = [{ id: 1, name: 'John Doe', email: 'john@example.com', posts: [] }];
      mockUserRepository.getAll.mockResolvedValue(mockUsers);

      const users = await userService.getAllUsers();
      expect(users).toEqual(mockUsers);
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('debería devolver un array vacío si no hay usuarios', async () => {
      mockUserRepository.getAll.mockResolvedValue([]);
      const users = await userService.getAllUsers();
      expect(users).toEqual([]);
      expect(mockUserRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('debería devolver un usuario si se encuentra', async () => {
      const mockUser: User = { id: 1, name: 'John Doe', email: 'john@example.com', posts: [] };
      mockUserRepository.getById.mockResolvedValue(mockUser);

      const user = await userService.getUserById(1);
      expect(user).toEqual(mockUser);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
    });

    it('debería devolver null si el usuario no se encuentra', async () => {
      mockUserRepository.getById.mockResolvedValue(null);
      const user = await userService.getUserById(99);
      expect(user).toBeNull();
      expect(mockUserRepository.getById).toHaveBeenCalledWith(99);
    });
  });

  describe('createUser', () => {
    it('debería crear y devolver un nuevo usuario', async () => {
      const newUserDto = { name: 'Jane Doe', email: 'jane@example.com' };
      const createdUser = { id: 1, ...newUserDto, posts: [] };
      
      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const user = await userService.createUser(newUserDto);
      
      expect(user).toEqual(createdUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    });
      
    it('debería llamar a los métodos create y save del repositorio', async () => {
        const newUserDto = { name: 'Jane Doe', email: 'jane@example.com' };
        await userService.createUser(newUserDto);
        expect(mockUserRepository.create).toHaveBeenCalled();
        expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('debería actualizar y devolver el usuario si se encuentra', async () => {
      const existingUser = { id: 1, name: 'John Doe', email: 'john@example.com', posts: [] };
      const updates = { name: 'John Updated' };
      const updatedUser = { ...existingUser, ...updates };

      mockUserRepository.getById.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const user = await userService.updateUser(1, updates);

      expect(user).toEqual(updatedUser);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.merge).toHaveBeenCalledWith(existingUser, updates);
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
    });

    it('debería devolver null si el usuario a actualizar no se encuentra', async () => {
      mockUserRepository.getById.mockResolvedValue(null);
      const user = await userService.updateUser(99, { name: 'Does Not Exist' });
      expect(user).toBeNull();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

    describe('deleteUser', () => {
    it('debería llamar al método softDelete con el id correcto', async () => {
      mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });
      await userService.deleteUser(1);
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('debería completarse sin errores si la eliminación es exitosa', async () => {
      mockUserRepository.softDelete.mockResolvedValue({ affected: 1 });
      await expect(userService.deleteUser(1)).resolves.not.toThrow();
    });
  });

});