import React, { useState, useCallback, useMemo } from "react";
import Header from "@/components/kilimandjaro/Header";
import Hero from "@/components/kilimandjaro/Hero";
import CategoryTabs from "@/components/kilimandjaro/CategoryTabs";
import MenuSection from "@/components/kilimandjaro/MenuSection";
import ModifierModal from "@/components/kilimandjaro/ModifierModal";
import Reviews from "@/components/kilimandjaro/Reviews";
import OurStory from "@/components/kilimandjaro/OurStory";
import LocationHours from "@/components/kilimandjaro/LocationHours";
import CartDrawer from "@/components/kilimandjaro/CartDrawer";
import Footer from "@/components/kilimandjaro/Footer";
import { MODIFIERS, TAX_RATE } from "@/data/menu";
import { useMenu } from "@/hooks/useMenu";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { base44 } from "@/api/base44Client";
import PaymentModal from "@/components/kilimandjaro/PaymentModal";

const HERO_IMAGE = "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/95e02fc1d_generated_c66a528b.jpg";
const STORY_IMAGE = "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/692bd9308_generated_image.png";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("full_menu");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [configuringItem, setConfiguringItem] = useState(null);
  const { menuByCategory, loading: menuLoading } = useMenu();
  const { settings: storeSettings } = useStoreSettings();

  const allMenuItems = useMemo(
    () => Object.values(menuByCategory).flat(),
    [menuByCategory]
  );
  const thieboudienne = allMenuItems.find((it) => /thieboudi/i.test(it.name));
  const featuredDishImage = thieboudienne?.image || HERO_IMAGE;

  const [checkoutCustomer, setCheckoutCustomer] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");

  const addToCart = useCallback((item) => {
    if (MODIFIERS[item.id]) {
      setConfiguringItem(item);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing) {
        return prev.map((it) => (it.id === item.id ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { ...item, qty: 1, modifiers: {} }];
    });
    setCartOpen(true);
  }, []);

  const confirmModifiers = (selections, special) => {
    const item = configuringItem;
    if (special && special.trim()) {
      setCart((prev) => [...prev, { ...item, id: `${item.id}-${Date.now()}`, qty: 1, modifiers: selections, special_instructions: special.trim() }]);
    } else {
      setCart((prev) => {
        const existing = prev.find((it) => it.id === item.id);
        if (existing) return prev.map((it) => (it.id === item.id ? { ...it, qty: it.qty + 1 } : it));
        return [...prev, { ...item, qty: 1, modifiers: selections, special_instructions: "" }];
      });
    }
    setConfiguringItem(null);
    setCartOpen(true);
  };

  const incItem = (id) =>
    setCart((prev) => prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)));

  const decItem = (id) =>
    setCart((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0)
    );

  const removeItem = (id) => setCart((prev) => prev.filter((it) => it.id !== id));

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

  const qtyMap = useMemo(
    () => Object.fromEntries(cart.map((it) => [it.id, it.qty])),
    [cart]
  );

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  const discount = checkoutCustomer?.discount || 0;
  const postDiscountSubtotal = Math.max(subtotal - discount, 0);
  const tax = postDiscountSubtotal * TAX_RATE;
  const deliveryFee =
    checkoutCustomer?.orderType === "delivery"
      ? postDiscountSubtotal >= (storeSettings?.free_delivery_threshold || 50)
        ? 0
        : storeSettings?.delivery_base_fee || 0
      : 0;
  const tip = checkoutCustomer?.tip || 0;
  const total = subtotal - discount + tax + deliveryFee + tip;

  const submitOrder = (customer) => {
    setCheckoutCustomer(customer);
    setCartOpen(false);
    setPayOpen(true);
  };

  const handlePaid = async () => {
    const order = await base44.entities.Order.create({
      customer_name: checkoutCustomer.name,
      customer_phone: checkoutCustomer.phone,
      pickup_time: checkoutCustomer.orderType === "pickup" ? (checkoutCustomer.pickupTime || "ASAP") : "ASAP",
      order_type: checkoutCustomer.orderType || "pickup",
      delivery_address: checkoutCustomer.deliveryAddress || "",
      delivery_notes: checkoutCustomer.deliveryNotes || "",
      items: cart.map((it) => ({ name: it.name, price: it.price, qty: it.qty, modifiers: it.modifiers || {}, special_instructions: it.special_instructions || "" })),
      subtotal,
      tax,
      tip,
      delivery_fee: deliveryFee,
      discount,
      promo_code: checkoutCustomer.promoCode || "",
      total,
      status: "pending",
      order_source: "web",
      payment_method: "card",
      refund_requested: false,
      chef_acknowledged: false,
      eta_minutes: checkoutCustomer.orderType === "delivery" ? 35 : 20,
    });
    setLastOrderId(order?.id || "");
    if (checkoutCustomer.promoCode) {
      try {
        const list = await base44.entities.Promotion.list("-created_date", 200);
        const p = (list || []).find((x) => x.code === checkoutCustomer.promoCode);
        if (p) await base44.entities.Promotion.update(p.id, { uses: (p.uses || 0) + 1 });
      } catch {}
    }
    clearCart();
  };

  const closePayment = () => {
    setPayOpen(false);
    setCheckoutCustomer(null);
    setLastOrderId("");
  };

  return (
    <div className="min-h-screen kilim-surface">
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero heroImage={HERO_IMAGE} featuredImage={featuredDishImage} onOrderPickup={() => setCartOpen(true)} />

        <section id="menu" className="kilim-surface">
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          {menuLoading ? (
            <div className="k-container py-20 text-center text-sm" style={{ color: "var(--k-muted)" }}>
              Loading the menu…
            </div>
          ) : (
            <MenuSection
              category={activeCategory}
              menuByCategory={menuByCategory}
              qtyMap={qtyMap}
              onAdd={addToCart}
              onInc={incItem}
              onDec={decItem}
            />
          )}
        </section>

        <OurStory image={STORY_IMAGE} />
        <Reviews />
        <LocationHours />
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onInc={incItem}
        onDec={decItem}
        onRemove={removeItem}
        onSubmitOrder={submitOrder}
      />
      <ModifierModal
        item={configuringItem}
        onConfirm={confirmModifiers}
        onClose={() => setConfiguringItem(null)}
      />
      <PaymentModal
        open={payOpen}
        subtotal={subtotal}
        tax={tax}
        deliveryFee={deliveryFee}
        discount={discount}
        tip={tip}
        total={total}
        customer={checkoutCustomer}
        orderId={lastOrderId}
        onPaid={handlePaid}
        onClose={closePayment}
      />
    </div>
  );
}