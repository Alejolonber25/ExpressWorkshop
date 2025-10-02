export interface CreatePostDto {
  title: string;
  content: string;
  userId: number;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}