import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "~/contexts/CartContext";
import { useLanguage } from "~/contexts";

export function CartSidebar() {
  const { t } = useLanguage();
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  const cartT = (t as any).cart ?? {};
  const title = cartT.title ?? "Cart";
  const empty = cartT.empty ?? "Your cart is empty.";
  const finishOrder = cartT.finishOrder ?? "Finish order";
  const closeLabel = cartT.close ?? "Close";
  const sizeLabel = cartT.size ?? "Size";
  const qtyLabel = cartT.quantity ?? "Qty";
  const removeLabel = cartT.remove ?? "Remove";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label={closeLabel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="text-slate-500 text-center py-12">{empty}</p>
              ) : (
                <ul className="space-y-4" role="list">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}-${item.size ?? "none"}`}
                      className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-20 h-20 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-slate-400 text-xs">
                          —
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-medium text-slate-900 hover:underline line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.size != null && (
                          <p className="text-sm text-slate-500 mt-0.5">
                            {sizeLabel}: {item.size}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-md border border-slate-200 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, -1)
                              }
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-l-md"
                              aria-label={`${qtyLabel} minus`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.productId, item.size, 1)
                              }
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-r-md"
                              aria-label={`${qtyLabel} plus`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.productId, item.size)
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                            title={removeLabel}
                            aria-label={removeLabel}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full py-3 px-4 bg-slate-900 text-white text-center font-medium rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {finishOrder}
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartSidebar;
