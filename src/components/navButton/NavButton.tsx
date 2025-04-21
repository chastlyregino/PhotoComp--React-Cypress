import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface NavButtonProps {
    to?: string;
    className?: string;
    variant?: string;
    children?: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({
    to = '/',
    className = '',
    variant = 'primary',
    children,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };

    return (
        <Button
            className={`${className}`}
            variant={`${variant} custom-create-button`}
            onClick={handleClick}
        >
            {children || 'Back'}
        </Button>
    );
};

export default NavButton;
