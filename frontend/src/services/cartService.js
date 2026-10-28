const getCurrentUser = () => {
  try {
    const user = sessionStorage.getItem("goviUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getCartKey = () => {
  const user = getCurrentUser();

  if (!user?._id) {
    return null;
  }

  return `govimartCart_${user._id}`;
};

export const getCart = () => {
  const key = getCartKey();

  if (!key) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  const key = getCartKey();

  if (!key) {
    throw new Error("Please log in before using your cart.");
  }

  localStorage.setItem(key, JSON.stringify(cart));

  window.dispatchEvent(new Event("govimart-cart-updated"));
};

export const clearCart = () => {
  const key = getCartKey();

  if (key) {
    localStorage.removeItem(key);
    window.dispatchEvent(new Event("govimart-cart-updated"));
  }
};
