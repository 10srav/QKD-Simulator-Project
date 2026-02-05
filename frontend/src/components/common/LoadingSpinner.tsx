/**
 * Loading Spinner Component
 */
import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message = 'Running quantum simulation...'
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="relative">
                <div
                    className={`${sizeClasses[size]} rounded-full border-indigo-500/20 border-t-indigo-500 animate-spin`}
                />
                <div
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-purple-500/10 border-r-purple-500 animate-spin`}
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                />
            </div>
            {message && (
                <p className="text-slate-400 text-sm animate-pulse">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
