import UseAnimations from "react-useanimations";
import checkBox from "react-useanimations/lib/checkBox";
import { type InputHTMLAttributes, useState, useEffect } from "react";

interface AnimatedCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}

export const AnimatedCheckbox = ({ label, checked, onChange, className = "", ...props }: AnimatedCheckboxProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <label className={`flex items-center gap-2 cursor-pointer group ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only"
                    {...props}
                />
                <div className="w-6 h-6 flex items-center justify-center [&>div>svg:not(:last-child)]:hidden">
                    {isMounted ? (
                        <UseAnimations
                            animation={checkBox}
                            size={24}
                            reverse={!checked}
                            strokeColor="#000000"
                            wrapperStyle={{ cursor: 'pointer' }}
                            speed={2}
                        />
                    ) : (
                        <div className={`w-4 h-4 border border-gray-300 rounded ${checked ? 'bg-black border-black' : 'bg-transparent'}`} />
                    )}
                </div>
            </div>
            {label && <span className="text-gray-600 select-none">{label}</span>}
        </label>
    );
};
