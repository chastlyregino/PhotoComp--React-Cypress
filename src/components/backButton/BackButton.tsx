import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';

interface BackButtonProps {
    to?: string;
    className?: string;
    variant?: string;
    children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({
    to = '/',
    className = '',
    variant = 'primary',
    children
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };

    return (
        <Button 
            variant={variant}
            className={`back-button ${className}`}
            onClick={handleClick}
        >
            <ArrowLeft className="me-1" />
            {children || 'Back'}
        </Button>
    );
};

export default BackButton;
