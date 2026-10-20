export const RESTAURANT_INFO = {
  name: "Kilimandjaro Restaurant",
  address: "4301 Chestnut St, Philadelphia, PA 19104",
  phone: "(215) 387-1970",
  owner: "Youma Ba",
  instagram: "https://www.instagram.com/kilimandjarorestaurant/",
  facebook: "https://www.facebook.com/kilimanjarorestaurants/",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=4301+Chestnut+St+Philadelphia+PA+19104",
  rating: "4.4",
  reviewsCount: "1,000+",
  foundedYear: 2005,
};

export const CATEGORIES = [
  { id: "picked_for_you", label: "Picked for You" },
  { id: "appetizers", label: "Appetizers" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "side_orders", label: "Side Orders" },
  { id: "drink", label: "Drink" },
];

export const DINNER_BANNER = "All Dinners are accompanied by 1 (one) signature side order choice";

export const MENU = {
  picked_for_you: [
    { id: "p1", name: "Thieboudiene", price: 23.0, tag: "#2 Most Liked", approval: "97%", ratings: 90, description: "Fish steamed with fresh vegetables cooked over rice with or without tomato paste.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/b1be7ee86_image.png" },
    { id: "p2", name: "Poisson (Tilapia)", price: 25.0, tag: "#1 Most Liked", approval: "96%", ratings: 229, description: "Fresh fish marinated, grilled or fried. All Dinners are served with 1 (one) side.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/3aac0c4ff_image.png" },
    { id: "p3", name: "Fried Rice", price: 9.0, tag: "#3 Most Liked", approval: "94%", ratings: 52, description: "Red or brown style.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/930d467c2_image.png" },
    { id: "p4", name: "Thiebouyapp", price: 23.0, tag: null, approval: "100%", ratings: 6, description: "Fresh lamb or chicken sauteed with garlic, green, red and habanero peppers, and onions cooked over rice.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/8056c6815_image.png" },
    { id: "p5", name: "Poisson A La Braise (Red Snapper)", price: 31.0, tag: "#3 Most Liked", approval: "86%", ratings: 67, description: "All Dinners are served with 1 (one) side." },
  ],
  appetizers: [
    { id: "a1", name: "Aloco", price: 9.0, tag: null, approval: "85%", ratings: 34, description: "Fried plantain with onions.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/f464dbc95_image.png" },
    { id: "a2", name: "Vero Shrimp", price: 15.0, tag: null, approval: "90%", ratings: 11, description: "Sauteed shrimps with garlic, onions, and fresh lemon juice.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/6e0cf0b63_image.png" },
    { id: "a3", name: "Kilimandjaro Salad", price: 14.0, tag: null, approval: "87%", ratings: 8, description: "Fresh lettuce, tomatoes, cucumber, shrimps, onions, carrots.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/0ff93d64d_image.png" },
    { id: "a4", name: "Chicken Salad", price: 15.0, tag: null, approval: "80%", ratings: 5, description: "Fresh lettuce, tomatoes, cucumber, grilled chicken, onions, and homemade dressing.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/54bb6e282_image.png" },
  ],
  lunch: [
    { id: "l1", name: "Thieboudiene", price: 23.0, tag: "#2 Most Liked", approval: "97%", ratings: 90, description: "Fish steamed with fresh vegetables cooked over rice with or without tomato paste.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/b1be7ee86_image.png" },
    { id: "l2", name: "Yassa Veggie", price: 19.0, tag: null, approval: "66%", ratings: 3, description: "Sauted onions with vegetables with mustard, garlic, mustard, lemon, habanero." },
    { id: "l3", name: "Thiebouyapp", price: 23.0, tag: null, approval: "100%", ratings: 6, description: "Fresh lamb or chicken sauteed with garlic, green, red and habanero peppers, and onions cooked over rice.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/8056c6815_image.png" },
    { id: "l4", name: "Yassa", price: 21.0, tag: null, approval: "90%", ratings: 54, description: "Chicken sauteed with onions, garlic, lemon, green, red and habanero peppers, vegetables and mustard dijon.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/050d2088f_image.png" },
    { id: "l5", name: "Mafee", price: 21.0, tag: null, approval: "80%", ratings: 57, description: "Lamb cooked with creamy rich peanut butter.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/e3a22d226_image.png" },
    { id: "l6", name: "Yassa Philly", price: 27.0, tag: null, approval: "78%", ratings: 28, description: "Boneless chicken breast, grilled lamb, or grilled fish sauteed with garlic, lemon, vegetables and mustard dijon.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/2767a944c_image.png" },
    { id: "l7", name: "Sauce Feuille", price: 19.0, tag: null, approval: "100%", ratings: 16, description: "Lamb cooked with chopped spinach and palm oil.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/b764e44a8_image.png" },
    { id: "l8", name: "Thieboucrevette", price: 27.0, tag: null, approval: "100%", ratings: 3, description: "Fresh shrimps sauteed with fresh vegetables over rice.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/b30fd2e6f_image.png" },
  ],
  dinner: [
    { id: "d1", name: "Poisson (Tilapia)", price: 25.0, tag: "#1 Most Liked", approval: "96%", ratings: 229, description: "Fresh fish marinated, grilled or fried.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/3aac0c4ff_image.png" },
    { id: "d2", name: "Poisson A La Braise (Red Snapper)", price: 31.0, tag: "#3 Most Liked", approval: "86%", ratings: 67, description: "Fresh whole premium Red Snapper." },
    { id: "d3", name: "Poulet Senegal", price: 25.0, tag: null, approval: "96%", ratings: 84, description: "Sauteed chicken with Senegalese sauce." },
    { id: "d4", name: "Brochette", price: 25.0, tag: null, approval: "86%", ratings: 38, description: "Chicken or beef kebab (boneless).", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/4640f6dea_image.png" },
    { id: "d5", name: "Gigot", price: 28.0, tag: null, approval: "85%", ratings: 14, description: "Sauteed lamb shank.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/c0be1bd7a_image.png" },
    { id: "d6", name: "Michiou", price: 28.0, tag: null, approval: "78%", ratings: 23, description: "Fresh marinated Lamb - baked or grilled." },
    { id: "d7", name: "Crevettes", price: 35.0, tag: null, approval: "83%", ratings: 6, description: "Sauteed jumbo shrimps with vegetables." },
  ],
  side_orders: [
    { id: "s1", name: "Fried Plantain", price: 7.0, tag: null, approval: "89%", ratings: 100, description: "Thinly sliced plantain, crispy on the outside and tender within." },
    { id: "s2", name: "Fried Rice", price: 9.0, tag: "#3 Most Liked", approval: "94%", ratings: 52, description: "Red or brown style grain tracking.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/930d467c2_image.png" },
    { id: "s3", name: "Extra Onions", price: 2.0, tag: null, approval: "89%", ratings: 100, description: "A portion of onions to add to your meal." },
    { id: "s4", name: "Couscous", price: 7.0, tag: null, approval: "87%", ratings: 8, description: "Traditional North African dish made from semolina flour." },
    { id: "s5", name: "Steam Vegetables", price: 7.0, tag: null, approval: "83%", ratings: 6, description: "Fresh seasonal vegetables steamed to perfection." },
    { id: "s6", name: "White Rice", price: 6.0, tag: null, approval: "75%", ratings: 8, description: "Light, fluffy white rice." },
    { id: "s7", name: "Salad", price: 10.0, tag: null, approval: null, ratings: 0, description: "Side salad to accompany your meal." },
    { id: "s8", name: "French Fries", price: 6.0, tag: null, approval: "100%", ratings: 4, description: "Thinly sliced potatoes, crispy on the outside and fluffy within." },
  ],
  drink: [
    { id: "k1", name: "Bissap Juice", price: 7.0, tag: null, approval: "91%", ratings: 85, description: "Hibiscus traditional chilled red juice.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/34183972b_image.png" },
    { id: "k2", name: "Fresh Ginger Juice", price: 7.0, tag: null, approval: "96%", ratings: 30, description: "Fresh ginger root juice, zesty and aromatic.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/bed71b4c8_image.png" },
    { id: "k3", name: "Ginger Yaye", price: 7.0, tag: null, approval: "85%", ratings: 21, description: "Fresh ginger blend with fresh strawberry.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/40a01202b_image.png" },
    { id: "k4", name: "Ginger Baye", price: 7.0, tag: null, approval: "100%", ratings: 29, description: "Fresh ginger blend with fresh mangoes.", image: "https://media.base44.com/images/public/6aad469a7ae1b8c0b16c1681/9f37f9ab5_image.png" },
  ],
};

// ---- Modifier groups (customizable options) ----
// Keyed by menu item id. Each group is single-select and required by default.
const SIDE_OPTIONS = [
  { id: "couscous", label: "Couscous" },
  { id: "salad", label: "Salad" },
  { id: "steam_vegetables", label: "Steam Vegetables" },
  { id: "white_rice", label: "White Rice" },
  { id: "fried_plantain", label: "Fried Plantain" },
  { id: "french_fries", label: "French Fries" },
  { id: "fried_rice", label: "Fried Rice" },
  { id: "extra_onions", label: "Extra Onions" },
];

const SIDE_GROUP = {
  id: "included_side",
  label: "Included Dinner Side",
  required: true,
  type: "single",
  options: SIDE_OPTIONS,
};

const PREP_STYLE_GROUP = {
  id: "prep_style",
  label: "Preparation Style",
  required: true,
  type: "single",
  options: [
    { id: "marinated", label: "Marinated" },
    { id: "grilled", label: "Grilled" },
    { id: "fried", label: "Fried" },
  ],
};

export const MODIFIERS = {
  // Poisson (Tilapia) — preparation style + included side
  p2: [PREP_STYLE_GROUP, SIDE_GROUP],
  d1: [PREP_STYLE_GROUP, SIDE_GROUP],
  // Poisson A La Braise - Red Snapper — included side only
  d2: [SIDE_GROUP],
  p5: [SIDE_GROUP],
  // Poulet Senegal — included side only
  d3: [SIDE_GROUP],
  // Brochette — protein selection + included side
  d4: [
    {
      id: "protein",
      label: "Protein Selection",
      required: true,
      type: "single",
      options: [
        { id: "chicken", label: "Chicken Kebab" },
        { id: "beef", label: "Beef Kebab" },
      ],
    },
    SIDE_GROUP,
  ],
  // Gigot — included side only
  d5: [SIDE_GROUP],
  // Michiou — preparation style + included side
  d6: [
    {
      id: "prep_style",
      label: "Preparation Style",
      required: true,
      type: "single",
      options: [
        { id: "baked", label: "Baked" },
        { id: "grilled", label: "Grilled" },
      ],
    },
    SIDE_GROUP,
  ],
  // Crevettes — included side only
  d7: [SIDE_GROUP],
  // Thiebouyapp — meat choice
  p4: [
    {
      id: "meat_choice",
      label: "Meat Choice",
      required: true,
      type: "single",
      options: [
        { id: "lamb", label: "Fresh Lamb" },
        { id: "chicken", label: "Chicken" },
      ],
    },
  ],
  l3: [
    {
      id: "meat_choice",
      label: "Meat Choice",
      required: true,
      type: "single",
      options: [
        { id: "lamb", label: "Fresh Lamb" },
        { id: "chicken", label: "Chicken" },
      ],
    },
  ],
  // Yassa Philly — protein choice
  l6: [
    {
      id: "protein_choice",
      label: "Protein Choice",
      required: true,
      type: "single",
      options: [
        { id: "grilled_chicken", label: "Grilled Chicken" },
        { id: "grilled_lamb", label: "Grilled Lamb" },
        { id: "grilled_fish", label: "Grilled Fish" },
      ],
    },
  ],
  // Thieboudienne — rice preparation
  p1: [
    {
      id: "rice_prep",
      label: "Rice Preparation",
      required: true,
      type: "single",
      options: [
        { id: "red", label: "Red Rice (Cooked with Tomato Paste)" },
        { id: "white", label: "White Rice (Cooked without Tomato Paste)" },
      ],
    },
  ],
  l1: [
    {
      id: "rice_prep",
      label: "Rice Preparation",
      required: true,
      type: "single",
      options: [
        { id: "red", label: "Red Rice (Cooked with Tomato Paste)" },
        { id: "white", label: "White Rice (Cooked without Tomato Paste)" },
      ],
    },
  ],
  // Fried Rice — grain style
  p3: [
    {
      id: "grain_style",
      label: "Style Choice",
      required: true,
      type: "single",
      options: [
        { id: "red", label: "Red Style" },
        { id: "brown", label: "Brown Style" },
      ],
    },
  ],
  s2: [
    {
      id: "grain_style",
      label: "Style Choice",
      required: true,
      type: "single",
      options: [
        { id: "red", label: "Red Style" },
        { id: "brown", label: "Brown Style" },
      ],
    },
  ],
};

export const TAX_RATE = 0.08;