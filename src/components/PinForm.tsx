import { useState } from 'react';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import ErrorMessage from './ErrorMessage';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useResetOnOpen } from '@/hooks/useResetOnOpen';

const PIN_LENGTH = 4;
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

interface PinFormProps {
  onClose: () => void;
  isOpen: boolean;
  onSubmitPin: (pin: string) => Promise<void>;
}

const PinForm: React.FC<PinFormProps> = ({ isOpen, onClose, onSubmitPin }) => {
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useResetOnOpen(isOpen, () => {
    setPin('');
    setFormError(null);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== PIN_LENGTH) {
      setFormError(`PIN must be ${PIN_LENGTH} characters long.`);
      setPin('');
    } else if (!alphanumericRegex.test(pin)) {
      setFormError('Only numbers and letters are allowed.');
    } else {
      setFormError(null);
      onSubmitPin(pin);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter Pin">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorMessage message={formError} />
        <p className="text-sm text-muted-foreground">Please enter your 4-digit PIN to proceed.</p>
        <InputOTP
          maxLength={PIN_LENGTH}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={pin}
          onChange={(value) => {
            setPin(value);
            setFormError(null);
          }}
          autoFocus
          autoComplete="off"
          aria-label="PIN"
          containerClassName="justify-center"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: PIN_LENGTH }, (_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="size-12 rounded-lg border text-lg font-semibold first:rounded-lg last:rounded-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PinForm;
