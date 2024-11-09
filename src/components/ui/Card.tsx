import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div
            className={`bg-white shadow-md rounded-md overflow-hidden ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;