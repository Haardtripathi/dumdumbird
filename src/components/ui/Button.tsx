import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'contained' | 'outlined';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'contained', ...props }) => {
    return (
        <button
            className={`px-4 py-2 rounded-md transition-colors ${variant === 'contained'
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
                }`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;