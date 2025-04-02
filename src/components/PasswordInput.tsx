import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpText?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

/**
 * A reusable password input component with show/hide functionality
 * Provides a toggle to switch between displaying the password as plain text or hidden
 * Open eye icon indicates password is visible (not encrypted)
 * Closed eye icon indicates password is hidden (encrypted)
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Enter password',
  helpText,
  isInvalid = false,
  errorMessage
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{label}</Form.Label>
      <InputGroup>
        <Form.Control
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isInvalid={isInvalid}
        />
        <InputGroup.Text 
          onClick={togglePasswordVisibility}
          style={{ cursor: 'pointer' }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <Eye /> : <EyeSlash />}
        </InputGroup.Text>
        {isInvalid && errorMessage && (
          <Form.Control.Feedback type="invalid">
            {errorMessage}
          </Form.Control.Feedback>
        )}
      </InputGroup>
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

export default PasswordInput;