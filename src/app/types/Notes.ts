export interface Note {
  id: number;
  title: string;
  content: string;
  pinned:boolean;
  updatedAt: string;
  createdAt:string;
}

export interface ErrorMessageProps {
  message: string | null;
}