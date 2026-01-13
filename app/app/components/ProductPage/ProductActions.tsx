import { Button } from "~/components/Elements/Button/Button";
import { ArrowUpLeft, ShoppingBag } from "lucide-react";

interface ProductActionsProps {
  onBack: () => void;
  onOrder: () => void;
  language: string;
  variant?: "desktop" | "mobile";
}

export const ProductActions = ({
  onBack,
  onOrder,
  language,
  variant = "desktop",
}: ProductActionsProps) => {
  if (variant === "mobile") {
    return (
      <div className="flex gap-4 mb-10">
        <Button
          variant="primary"
          onClick={onOrder}
          className="w-3/4 flex-[2] rounded-2xl h-14 border-none transition-colors"
          rightIcon={<ShoppingBag size={20} />}
        >
          {language === "pt" ? "ENCOMENDAR AGORA" : "ORDER NOW"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-2">
      <Button
        variant="outline"
        onClick={onBack}
        className="flex-none rounded-xl py-6"
        leftIcon={<ArrowUpLeft size={16} />}
      >
        {language === "pt" ? "Voltar" : "Back"}
      </Button>

      <Button
        variant="primary"
        onClick={onOrder}
        className="flex-1 rounded-xl py-6"
        rightIcon={<ShoppingBag size={18} />}
      >
        {language === "pt" ? "ENCOMENDAR AGORA" : "ORDER NOW"}
      </Button>
    </div>
  );
};
