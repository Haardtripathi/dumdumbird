import React, { ReactNode } from 'react';

interface CardHeaderProps {
    children: ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children }) => {
    return (
        <div className="bg-gray-100 px-6 py-4 border-b">
            {children}
        </div>
    );
};

export default CardHeader;