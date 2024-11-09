import React, { ReactNode } from 'react';

interface FlexProps {
    children: ReactNode;
    className?: string;
    justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
}

const Flex: React.FC<FlexProps> = ({
    children,
    className = '',
    justify = 'start',
    align = 'start',
}) => {
    return (
        <div
            className={`flex ${justify ? `justify-${justify}` : ''} ${align ? `items-${align}` : ''
                } ${className}`}
        >
            {children}
        </div>
    );
};

export default Flex;