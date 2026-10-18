import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <CircleAlertIcon />
      <AlertTitle className="font-normal">{message}</AlertTitle>
    </Alert>
  );
};

export default ErrorMessage;
