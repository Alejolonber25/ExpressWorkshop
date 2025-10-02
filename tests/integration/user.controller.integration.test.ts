import request from 'supertest';
import { createApp } from '../../src/app';
import { TestDataSource } from '../../src/db/test-data-source';
import { User } from '../../src/entities/user.entity';
import { Express } from "express";

describe('User Controller - Integration Tests', () => {

  let app: Express;

  beforeAll(async () => {
    await TestDataSource.initialize();
    app = createApp(TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    const repository = TestDataSource.getRepository(User);
    await repository.clear();
  });

  describe('GET /users', () => {
    it('debería devolver 200 y un array de usuarios', async () => {
      const repository = TestDataSource.getRepository(User);
      await repository.save({ name: 'Test User', email: 'test@example.com' });

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Test User');
    });

    it('debería devolver 200 y un array vacío si no hay usuarios', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('debería devolver 200 y el usuario correcto', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Find Me', email: 'findme@example.com' });

      const res = await request(app).get(`/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.name).toBe('Find Me');
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      const res = await request(app).get('/users/999');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('POST /users', () => {
    it('debería devolver 201 y crear un nuevo usuario', async () => {
      const newUser = { name: 'New User', email: 'new@example.com' };
      const res = await request(app).post('/users').send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newUser.name);
      expect(res.body.email).toBe(newUser.email);
      expect(res.body.id).toBeDefined();
    });

    it('debería devolver 500 si el email ya existe (violación de constraint)', async () => {
      await request(app).post('/users').send({ name: 'First User', email: 'duplicate@example.com' });
      const res = await request(app).post('/users').send({ name: 'Second User', email: 'duplicate@example.com' });

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /users/:id', () => {
    it('debería devolver 200 y actualizar el usuario', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Old Name', email: 'update@example.com' });

      const updatedData = { name: 'New Name' };
      const res = await request(app).put(`/users/${user.id}`).send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    it('debería devolver 404 si el usuario a actualizar no existe', async () => {
      const res = await request(app).put('/users/999').send({ name: 'Ghost' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('debería devolver 204 y eliminar el usuario', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Delete Me', email: 'delete@example.com' });

      const res = await request(app).delete(`/users/${user.id}`);
      expect(res.status).toBe(204);
    });

    it('debería permitir listar los usuarios eliminados después de un delete', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Deleted User', email: 'deleted@example.com' });

      await request(app).delete(`/users/${user.id}`);

      const deletedList = await request(app).get('/users');
      expect(deletedList.status).toBe(200);
      expect(deletedList.body.some((u: User) => u.id === user.id)).toBe(true);
    });

    it('debería permitir ver un usuario eliminado por id', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Deleted User', email: 'deleted@example.com' });

      await request(app).delete(`/users/${user.id}`);

      const deletedOne = await request(app).get(`/users/${user.id}`);
      expect(deletedOne.status).toBe(200);
      expect(deletedOne.body.id).toBe(user.id);
    });

    it('debería permitir editar un usuario eliminado', async () => {
      const repository = TestDataSource.getRepository(User);
      const user = await repository.save({ name: 'Deleted User', email: 'deleted@example.com' });

      await request(app).delete(`/users/${user.id}`);

      const updatedRes = await request(app)
        .put(`/users/${user.id}`)
        .send({ name: 'Edited Deleted User' });
      expect(updatedRes.status).toBe(200);
      expect(updatedRes.body.name).toBe('Edited Deleted User');
    });

    it('debería devolver 204 incluso si el usuario no existe (idempotente)', async () => {
      const res = await request(app).delete('/users/999');
      expect(res.status).toBe(204);
    });
  });

});