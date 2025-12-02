import UseAnimations from "react-useanimations";
import visibility from "react-useanimations/lib/visibility";
import { useState, useEffect } from "react";

interface AnimatedEyeProps {
    isVisible: boolean;
    onClick: () => void;
    size?: number;
}

export const AnimatedEye = ({ isVisible, onClick, size = 20 }: AnimatedEyeProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <button
            type="button"
            onClick={onClick}
            className="focus:outline-none hover:opacity-70 transition-opacity flex items-center justify-center"
        >
            {isMounted ? (
                <div className="flex items-center justify-center [&>div>svg:not(:last-child)]:hidden">
                    <UseAnimations
                        animation={visibility}
                        size={size}
                        reverse={!isVisible}
                        strokeColor="#9CA3AF"
                        wrapperStyle={{ cursor: 'pointer', display: 'flex' }}
                    />
                </div>
            ) : (
                <div className="w-5 h-5 bg-gray-200 rounded-full" /> // Placeholder
            )}
        </button>
    );
};
