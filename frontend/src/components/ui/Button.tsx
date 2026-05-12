import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = '',
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

        const variants = {
            primary: 'bg-gradient-to-r from-gold to-gold-dark text-white hover:shadow-[0_4px_20px_rgba(196,154,60,0.3)] hover:brightness-110 rounded-full',
            secondary: 'bg-pink-blush text-foreground hover:bg-pink-soft rounded-full',
            outline: 'border border-gold/50 text-gold hover:bg-gold hover:text-white rounded-full hover:shadow-[0_4px_16px_rgba(196,154,60,0.2)]',
            ghost: 'hover:bg-beige/60 text-foreground rounded-lg',
        };

        const sizes = {
            sm: 'h-9 px-5 text-xs tracking-wider',
            md: 'h-10 py-2 px-6 text-sm tracking-wide',
            lg: 'h-12 px-10 text-sm tracking-[0.15em] uppercase',
        };

        const widthClass = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
