import { PostService } from '../../src/services/post.service';
import { Post } from '../../src/entities/post.entity';
import { User } from '../../src/entities/user.entity';
import { TestDataSource } from '../../src/db/test-data-source';

const mockPostRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
};

const mockUserRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  softDelete: jest.fn(),
};

jest.spyOn(TestDataSource, 'getRepository').mockImplementation((entity) => {
  if (entity === Post) {
    return {
      extend: () => mockPostRepository
    } as any;
  }
  if (entity === User) {
    return {
      extend: () => mockUserRepository
    } as any;
  }
  throw new Error("Unknown entity");
});
describe('PostService', () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService(TestDataSource as any);
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('debería devolver un array de posts', async () => {
      const mockPosts: Post[] = [{ id: 1, title: 'Test Post', content: 'Content', user: null as any }];
      mockPostRepository.getAll.mockResolvedValue(mockPosts);

      const posts = await postService.getAllPosts();
      expect(posts).toEqual(mockPosts);
      expect(mockPostRepository.getAll).toHaveBeenCalledTimes(1);
    });

    it('debería devolver un array vacío si no hay posts', async () => {
      mockPostRepository.getAll.mockResolvedValue([]);
      const posts = await postService.getAllPosts();
      expect(posts).toEqual([]);
    });
  });

  describe('getPostById', () => {
    it('debería devolver un post si se encuentra', async () => {
      const mockPost: Post = { id: 1, title: 'Test Post', content: 'Content', user: null as any };
      mockPostRepository.getById.mockResolvedValue(mockPost);

      const post = await postService.getPostById(1);
      expect(post).toEqual(mockPost);
      expect(mockPostRepository.getById).toHaveBeenCalledWith(1);
    });

    it('debería devolver null si el post no se encuentra', async () => {
      mockPostRepository.getById.mockResolvedValue(null);
      const post = await postService.getPostById(99);
      expect(post).toBeNull();
    });
  });

  describe('createPost', () => {
    it('debería crear y devolver un nuevo post', async () => {
      const newPostDto = { title: 'New Post', content: 'New Content', userId: 1 };
      const mockUser = { id: 1, name: 'Test User' };
      const createdPost = { id: 1, title: 'New Post', content: 'New Content', user: mockUser };

      mockUserRepository.getById.mockResolvedValue(mockUser);
      mockPostRepository.create.mockReturnValue(createdPost);
      mockPostRepository.save.mockResolvedValue(createdPost);

      const post = await postService.createPost(newPostDto);

      expect(post).toEqual(createdPost);
      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        title: 'New Post',
        content: 'New Content',
        user: mockUser,
      });
      expect(mockPostRepository.save).toHaveBeenCalledWith(createdPost);
    });

    it('debería llamar a los métodos create y save del repositorio', async () => {
      const newPostDto = { title: 'New Post', content: 'New Content', userId: 1 };
      const mockUser = { id: 1, name: 'Test User' };

      mockUserRepository.getById.mockResolvedValue(mockUser);
      mockPostRepository.create.mockReturnValue({ ...newPostDto, user: mockUser });
      mockPostRepository.save.mockResolvedValue({ ...newPostDto, user: mockUser });

      await postService.createPost(newPostDto);

      expect(mockUserRepository.getById).toHaveBeenCalled();
      expect(mockPostRepository.create).toHaveBeenCalled();
      expect(mockPostRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('debería actualizar y devolver el post si se encuentra', async () => {
      const existingPost = { id: 1, title: 'Old Title', content: 'Old Content', user: null as any };
      const updates = { title: 'New Title' };
      const updatedPost = { ...existingPost, ...updates };

      mockPostRepository.getById.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue(updatedPost);

      const post = await postService.updatePost(1, updates);
      expect(post).toEqual(updatedPost);
      expect(mockPostRepository.merge).toHaveBeenCalledWith(existingPost, updates);
    });

    it('debería devolver null si el post a actualizar no se encuentra', async () => {
      mockPostRepository.getById.mockResolvedValue(null);
      const post = await postService.updatePost(99, { title: 'Does Not Exist' });
      expect(post).toBeNull();
    });
  });

   describe('deletePost', () => {
    it('debería llamar al método softDelete con el id correcto', async () => {
      mockPostRepository.softDelete.mockResolvedValue({ affected: 1 });
      await postService.deletePost(1);
      expect(mockPostRepository.softDelete).toHaveBeenCalledWith(1);
    });
  
    it('debería completarse sin errores si la eliminación es exitosa', async () => {
      mockPostRepository.softDelete.mockResolvedValue({ affected: 1 });
      await expect(postService.deletePost(1)).resolves.not.toThrow();
    });
  });

});