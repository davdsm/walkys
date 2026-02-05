import { ChevronDown } from "lucide-react";
import { useLanguage } from "~/contexts";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  language?: string;
}

export const SizeSelector = ({
  sizes,
  selectedSize,
  onSizeSelect,
}: SizeSelectorProps) => {
  const { t } = useLanguage();
  if (sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-600">
        {t.product.selectSize}
      </label>
      <div className="relative w-full max-w-xs">
        <select
          value={selectedSize || ""}
          onChange={(e) => onSizeSelect(e.target.value)}
          className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-md text-sm font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer"
        >
          <option value="" disabled>
            {t.product.chooseSize}
          </option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
};
