import { useRef,useEffect, useState } from "react";
import styles from '@/Home.module.css';
import ErrorMessage from './ErrorMessage';

const emptyPin=['', '', '', ''];
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

interface PinFormProps {
    onClose: () => void;
    isOpen:boolean;
    onSubmitPin: (pin: string) => Promise<void>
}

    const PinForm: React.FC<PinFormProps> = ({ isOpen, onClose,onSubmitPin }) => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [pin, setPin] = useState<string[]>([...emptyPin]);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {

    if(isOpen){
        setPin([...emptyPin]);
        setFormError(null);
    }

    if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
    }  

    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;

    if (value === '') {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
        setFormError(null);
        return;
    }
    if (!alphanumericRegex.test(value)) {
        setFormError('Only numbers and letters are allowed.');
        return;
    }

    if (value.length > 1) {
        return;
    }
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setFormError(null);

    if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
    }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
    };

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();
        const fullPin = pin.join('');
        if(fullPin.length !== 4){
            setFormError("pin can only be 4 characters long");
            setPin([...emptyPin]);
        }else if(!alphanumericRegex.test(fullPin)){
            setFormError('Only numbers and letters are allowed.');
        }else{
            setFormError(null);
            onSubmitPin(fullPin);
            onClose();
        }
    
    };

    return (
    <form onSubmit={handleSubmit} className={styles.form}>
        {formError && <ErrorMessage message={formError} />}
        <div className={styles.modalBodyText}>
        Please enter your 4-digit PIN to proceed.
        </div>
        <div className={styles.pinInputContainer}>
        {pin.map((digit, index) => (
            <input
            key={index}
            type="password"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => {
                inputRefs.current[index] = el;
            }}
            className={styles.pinInputField}
            />
        ))}
        </div>
        <div className={styles.mainActionButtons}>
        <button onClick={onClose} type="button" className={`${styles.button}`}>
            Cancel
        </button>
        <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>
            Submit
        </button>
        </div>
    </form>
    );
};

export default PinForm;
