import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "style"> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, className = "", containerClassName = "", ...props }, ref) => {
        return (
            <div className={`flex flex-col gap-2 ${containerClassName}`}>
                <style>{`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none !important;
                    }
                    input::-webkit-password-reveal-button,
                    input::-webkit-credentials-auto-fill-button {
                        display: none !important;
                        -webkit-appearance: none !important;
                    }
                `}</style>
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none [&>button]:pointer-events-auto [&>svg]:cursor-pointer">
                            {leftIcon}
                        </div>
                    )}
                    <motion.input
                        ref={ref}
                        className={`
                            w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm 
                            outline-none transition-all
                            placeholder:text-gray-400
                            [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden
                            ${leftIcon ? "pl-10" : ""}
                            ${rightIcon ? "pr-10" : ""}
                            ${error ? "border-red-500" : ""}
                            ${className}
                        `}
                        {...props as any}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none [&>button]:pointer-events-auto [&>svg]:cursor-pointer">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-xs text-red-500">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
