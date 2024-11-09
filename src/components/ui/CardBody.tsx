import React, { ReactNode } from 'react';

interface CardBodyProps {
    children: ReactNode;
}

const CardBody: React.FC<CardBodyProps> = ({ children }) => {
    return (
        <div className="p-6">
            {children}
        </div>
    );
};

export default CardBody;