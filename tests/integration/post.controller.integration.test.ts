import request from 'supertest';
import { createApp } from '../../src/app';
import { TestDataSource } from '../../src/db/test-data-source';
import { User } from '../../src/entities/user.entity';
import { Post } from '../../src/entities/post.entity';
import { Express } from "express";

describe('Post Controller - Integration Tests', () => {
  let app: Express;
  let testUser: User;

  beforeAll(async () => {
    await TestDataSource.initialize();
    app = createApp(TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    const postRepository = TestDataSource.getRepository(Post);
    await postRepository.clear();
    const userRepository = TestDataSource.getRepository(User);
    await userRepository.clear();

    testUser = await userRepository.save({ name: 'Author', email: 'author@example.com' });
  });

  describe('GET /posts', () => {
    it('debería devolver 200 y un array de posts', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      await postRepository.save({ title: 'Test Post', content: 'Some content', user: testUser });

      const res = await request(app).get('/posts');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Test Post');
    });

    it('debería devolver 200 y un array vacío si no hay posts', async () => {
      const res = await request(app).get('/posts');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /posts/:id', () => {
    it('debería devolver 200 y el post correcto', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Find Me', content: 'Here I am', user: testUser });

      const res = await request(app).get(`/posts/${post.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(post.id);
      expect(res.body.title).toBe('Find Me');
    });

    it('debería devolver 404 si el post no existe', async () => {
      const res = await request(app).get('/posts/999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /posts', () => {
    it('debería devolver 201 y crear un nuevo post', async () => {
      const newPost = { title: 'My New Post', content: 'Post content', userId: testUser.id };
      const res = await request(app).post('/posts').send(newPost);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe(newPost.title);
      expect(res.body.id).toBeDefined();
    });

    it('debería devolver 500 si el userId no existe', async () => {
      const newPost = { title: 'Orphan Post', content: 'No user for me', userId: 999 };
      const res = await request(app).post('/posts').send(newPost);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /posts/:id', () => {
    it('debería devolver 200 y actualizar el post', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Old Title', content: 'content', user: testUser });

      const updatedData = { title: 'New Title' };
      const res = await request(app).put(`/posts/${post.id}`).send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
    });

    it('debería devolver 404 si el post a actualizar no existe', async () => {
      const res = await request(app).put('/posts/999').send({ title: 'Ghost Post' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('debería devolver 204 y eliminar el post', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Delete Me', content: 'content', user: testUser });

      const res = await request(app).delete(`/posts/${post.id}`);
      expect(res.status).toBe(204);
    });

    it('debería permitir listar los posts eliminados después de un delete', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Deleted Post', content: 'content', user: testUser });

      await request(app).delete(`/posts/${post.id}`);

      const deletedList = await request(app).get('/posts');
      expect(deletedList.status).toBe(200);
      expect(deletedList.body.some((p: Post) => p.id === post.id)).toBe(true);
    });

    it('debería permitir ver un post eliminado por id', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Deleted Post', content: 'content', user: testUser });

      await request(app).delete(`/posts/${post.id}`);

      const deletedOne = await request(app).get(`/posts/${post.id}`);
      expect(deletedOne.status).toBe(200);
      expect(deletedOne.body.id).toBe(post.id);
    });

    it('debería permitir editar un post eliminado', async () => {
      const postRepository = TestDataSource.getRepository(Post);
      const post = await postRepository.save({ title: 'Deleted Post', content: 'content', user: testUser });

      await request(app).delete(`/posts/${post.id}`);

      const updatedRes = await request(app)
        .put(`/posts/${post.id}`)
        .send({ title: 'Edited Deleted Post' });
      expect(updatedRes.status).toBe(200);
      expect(updatedRes.body.title).toBe('Edited Deleted Post');
    });

    it('debería devolver 204 incluso si el post no existe', async () => {
      const res = await request(app).delete('/posts/999');
      expect(res.status).toBe(204);
    });
  });

  describe('User Posts - Integration Tests', () => {
    describe('GET /user/:id/posts', () => {
      it('debería devolver 200 y los posts de un usuario activo', async () => {
        const postRepository = TestDataSource.getRepository(Post);
        await postRepository.save({ title: 'User Post 1', content: 'content', user: testUser });
        await postRepository.save({ title: 'User Post 2', content: 'content', user: testUser });

        const res = await request(app).get(`/posts/user/${testUser.id}/posts`);
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].user.id).toBe(testUser.id);
      });

      it('debería devolver posts de un usuario aunque el post esté eliminado', async () => {
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Soft Deleted', content: 'content', user: testUser });
        await postRepository.softDelete(post.id);

        const res = await request(app).get(`/posts/user/${testUser.id}/posts`);
        expect(res.status).toBe(200);
        expect(res.body.some((p: Post) => p.id === post.id)).toBe(true);
      });

      it('no debería devolver posts de un usuario si el usuario está eliminado', async () => {
        const userRepository = TestDataSource.getRepository(User);
        const deletedUser = await userRepository.save({ name: 'Ghost', email: 'ghost@example.com' });
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Ghost Post', content: 'content', user: deletedUser });

        await userRepository.softDelete(deletedUser.id);

        const res = await request(app).get(`/posts/user/${deletedUser.id}/posts`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });

      it('debería devolver 200 y array vacío si el usuario no tiene posts', async () => {
        const res = await request(app).get(`/posts/user/${testUser.id}/posts`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
      });
    });

    describe('GET /user/:id/posts/:postId', () => {
      it('debería devolver 200 y el post correcto de un usuario activo', async () => {
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Find Me', content: 'content', user: testUser });

        const res = await request(app).get(`/posts/user/${testUser.id}/posts/${post.id}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(post.id);
        expect(res.body.user.id).toBe(testUser.id);
      });

      it('debería devolver un post eliminado de un usuario activo', async () => {
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Deleted Post', content: 'content', user: testUser });
        await postRepository.softDelete(post.id);

        const res = await request(app).get(`/posts/user/${testUser.id}/posts/${post.id}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(post.id);
      });

      it('no debería devolver un post de un usuario eliminado', async () => {
        const userRepository = TestDataSource.getRepository(User);
        const deletedUser = await userRepository.save({ name: 'Old User', email: 'old@example.com' });
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Post from Deleted User', content: 'content', user: deletedUser });

        await userRepository.softDelete(deletedUser.id);

        const res = await request(app).get(`/posts/user/${deletedUser.id}/posts/${post.id}`);
        expect(res.status).toBe(404);
      });

      it('debería devolver 404 si el post no pertenece al usuario', async () => {
        const otherUserRepo = TestDataSource.getRepository(User);
        const otherUser = await otherUserRepo.save({ name: 'Other', email: 'other@example.com' });
        const postRepository = TestDataSource.getRepository(Post);
        const post = await postRepository.save({ title: 'Foreign Post', content: 'content', user: otherUser });

        const res = await request(app).get(`/posts/user/${testUser.id}/posts/${post.id}`);
        expect(res.status).toBe(404);
      });

      it('debería devolver 404 si el post no existe', async () => {
        const res = await request(app).get(`/posts/user/${testUser.id}/posts/999`);
        expect(res.status).toBe(404);
      });
    });
  });


});