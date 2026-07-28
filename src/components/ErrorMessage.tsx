import styles from '@/Home.module.css';

interface ErrorMessageProps {
    message: string | null;
  }
  
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
      <div className={styles.errorMessage} role="alert">
        {message}
      </div>
    );
  };

  export default ErrorMessage