import React, { ReactNode } from 'react';

interface TextProps {
    children: ReactNode;
    className?: string;
}

const Text: React.FC<TextProps> = ({ children, className = '' }) => {
    return (
        <p className={`text-gray-700 ${className}`}>
            {children}
        </p>
    );
};

export default Text;