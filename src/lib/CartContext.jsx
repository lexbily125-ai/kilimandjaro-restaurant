import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

const lineKeyFor = (itemId, modifiers, specialInstructions) =>
  `${itemId}|${JSON.stringify(modifiers)}|${specialInstructions}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback(({ item, modifiers = {}, specialInstructions = "", unitPrice, qty = 1 }) => {
    const key = lineKeyFor(item.id, modifiers, specialInstructions);
    setItems((prev) => {
      if (prev.some((line) => line.key === key)) {
        return prev.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
      }
      return [
        ...prev,
        {
          key,
          id: item.id,
          name: item.name,
          price: unitPrice,
          modifiers,
          special_instructions: specialInstructions,
          qty,
        },
      ];
    });
  }, []);

  const changeLineQty = useCallback((key, delta) => {
    setItems((prev) =>
      prev
        .map((line) => (line.key === key ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }, []);

  const changeItemQty = useCallback((itemId, delta) => {
    setItems((prev) => {
      const idx = prev.findLastIndex((line) => line.id === itemId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const nextQty = target.qty + delta;
      if (nextQty <= 0) return prev.filter((_, i) => i !== idx);
      return prev.map((line, i) => (i === idx ? { ...line, qty: nextQty } : line));
    });
  }, []);

  const removeLine = useCallback((key) => {
    setItems((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const qtyByItemId = {};
    let cartCount = 0;
    let subtotal = 0;
    items.forEach((line) => {
      qtyByItemId[line.id] = (qtyByItemId[line.id] || 0) + line.qty;
      cartCount += line.qty;
      subtotal += line.price * line.qty;
    });
    return {
      items,
      cartCount,
      subtotal,
      qtyByItemId,
      addItem,
      changeLineQty,
      changeItemQty,
      removeLine,
      clearCart,
    };
  }, [items, addItem, changeLineQty, changeItemQty, removeLine, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
