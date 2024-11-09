import React, { ReactNode } from 'react';

interface CardFooterProps {
    children: ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ children }) => {
    return (
        <div className="bg-gray-100 px-6 py-4 border-t">
            {children}
        </div>
    );
};

export default CardFooter;