import { defineStore } from "pinia";

export interface BasketItem {
  productId: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image_url: string;
}

export const useBasketStore = defineStore("basket", {
  state: () => ({
    items: JSON.parse(localStorage.getItem("basket") || "[]") as BasketItem[]
  }),

  actions: {
    addItem(item: BasketItem) {
      const existing = this.items.find(
        i => i.productId === item.productId && i.size === item.size
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push(item);
      }

      localStorage.setItem("basket", JSON.stringify(this.items));
    },

    removeItem(productId: number, size: string) {
      this.items = this.items.filter(
        i => !(i.productId === productId && i.size === size)
      );

      localStorage.setItem("basket", JSON.stringify(this.items));
    }
  },

  getters: {
    totalPrice: (state) =>
      state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),

    itemCount: (state) =>
      state.items.reduce((count, item) => count + item.quantity, 0)
  }
});