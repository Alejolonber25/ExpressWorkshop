# 🛠️ Node.js Workshop – User & Post Soft Deletion Challenge

## 📌 Overview

In this workshop, you’ll enhance a Node.js application by adding **soft deletion** to the `User` and `Post` entities.

Unlike a hard delete (which permanently removes data from the database), **soft delete marks records as deleted** while keeping them stored for reference, audits, or potential recovery.

You will learn how to:

* Add a special column to track deletions.
* Use TypeORM’s built-in soft delete methods.
* Query entities while respecting soft deletion rules.

---

## ⚙️ How Soft Delete Works in TypeORM

### 1. Add a special column

TypeORM provides a decorator called **`@DeleteDateColumn`**, which automatically sets a timestamp when the entity is soft-deleted.

```ts
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from "typeorm";

@Entity()
export class Human {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // Will be filled when the record is soft deleted
}
```

* If `deletedAt` is `NULL` → the entity is **active**.
* If `deletedAt` has a date → the entity is **soft deleted**.

---

### 2. Using Soft Delete Methods

TypeORM repositories have built-in methods for soft deletion:

```ts
// Soft delete by ID
await humanRepository.softDelete(userId);

// Restore a previously deleted record
await humanRepository.restore(userId);
```

Unlike `.remove()` or `.delete()`, this won’t erase the row, it just sets `deletedAt`.

---

### 3. Querying with Soft Delete

By default, queries **exclude soft-deleted records**.

If you want to include them, use the `withDeleted: true` option:

```ts
// Excludes deleted users (default behavior)
await userRepository.find();

// Includes deleted users
await userRepository.find({ withDeleted: true });
```

And if you want **only active users**, filter with `IsNull()` on `deletedAt`:

```ts
import { IsNull } from "typeorm";

await userRepository.find({
  where: { deletedAt: Not(IsNull()) }, // only inactive users
});
```

---

## 🎯 Assignments

1. Add **soft deletion** support to both `User` and `Post` entities using `@DeleteDateColumn`.

   Our client for this app is a little crazy 🤪, so satisfy them with the following requirements.

2. Even if they are soft-deleted, users and posts must still be editable, listable (all), and retrievable by ID.
3. Implement **two new endpoints** with the following validations **(review the post routes)**:

   * **Get all posts by user ID** → should return posts only if the user is not soft-deleted.
   * **Get a post by user ID and post ID** → should return the post only if the user is not soft-deleted.
4. Check that all tests pass, and if not, carefully review and fix your services and repositories.
---

## ✅ Deliverable

**screenshot of the passing test results** at the beginning of this README.md

---

## 🚀 Getting Started

1. **Clone the repository**:

```bash
git clone <URL_DEL_REPOSITORIO>
cd nodejs-workshop
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run the app (development mode)**:

```bash
npm run dev
```

4. **Run tests**:

```bash
npm run test
```