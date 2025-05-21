export interface Note {
  id: number;
  title: string;
  content: string;
}

export interface ErrorMessageProps {
  message: string | null;
}