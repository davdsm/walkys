import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

// Props for button element
interface BaseButtonProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
    className?: string;
}

// Props when used as a button
interface ButtonAsButton extends BaseButtonProps, Omit<HTMLMotionProps<"button">, "children"> {
    to?: never;
}

// Props when used as a link
interface ButtonAsLink extends BaseButtonProps {
    to: string;
    disabled?: boolean;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = ({
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = "",
    disabled,
    to,
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border";

    const variants = {
        primary: "bg-black text-white border-black hover:bg-white hover:text-black",
        secondary: "bg-white text-black border-white hover:bg-[#f5f5f5] hover:border-[#f5f5f5]",
        outline: "border-gray-200 bg-transparent text-gray-900 hover:bg-black hover:text-white hover:border-black",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-900 border-transparent",
    };

    const sizes = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-8 text-base",
        lg: "h-14 px-10 text-lg",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    const content = (
        <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
    );

    // Render as Link if 'to' prop is provided
    if (to) {
        return (
            <Link
                to={to}
                className={`${combinedClassName} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
                aria-disabled={disabled}
            >
                {content}
            </Link>
        );
    }

    // Render as button
    return (
        <motion.button
            className={combinedClassName}
            disabled={disabled || isLoading}
            {...(props as HTMLMotionProps<"button">)}
        >
            {content}
        </motion.button>
    );
};
