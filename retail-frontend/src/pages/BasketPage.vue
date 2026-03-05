<script setup lang="ts">
import { onMounted } from "vue";
import { useBasketStore } from "../stores/basket";
import { storeToRefs } from "pinia";
import { getCurrentInstance } from "vue";

console.log("APP INSTANCE:", getCurrentInstance()?.appContext.app);

onMounted(() => {
  console.log("Basket items on BasketPage:", items.value);
});

const basket = useBasketStore();

// unwrap reactive refs
const { items, totalPrice } = storeToRefs(basket);

const increaseQuantity = (item: typeof items.value[0]) => {
  basket.addItem({ ...item, quantity: 1 });
};

const decreaseQuantity = (item: typeof items.value[0]) => {
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    basket.removeItem(item.productId, item.size);
  }
};

const removeItem = (item: typeof items.value[0]) => {
  basket.removeItem(item.productId, item.size);
};



const checkout = async () => {
  if (items.value.length === 0) return alert("Your basket is empty");

  const token = localStorage.getItem("token");
  if (!token) return alert("You must be logged in to checkout");

  try {
    // 1. Create a new order
    const orderRes = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const order = await orderRes.json();

    // 2. Add items to the order
    for (const item of items.value) {
      await fetch(`http://localhost:3000/orders/${order.id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: item.productId,
          quantity: item.quantity,
        }),
      });
    }

    // 3. Checkout the order
    await fetch(`http://localhost:3000/orders/${order.id}/checkout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Checkout complete!");

    // 4. Clear basket
    basket.items = [];
    localStorage.removeItem("basket");
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong during checkout");
  }
};
</script>



<template>
  <div class="basket-page">
    <h1>Your Basket</h1>

    <div v-if="items.length === 0">
      <p>Your basket is empty.</p>
    </div>

    <div v-else>
      <div class="basket-item" v-for="item in items" :key="item.productId + '-' + item.size">
        <img :src="item.image_url" class="item-image" />
        <div class="item-info">
          <h3>{{ item.name }}</h3>
          <p>Size: {{ item.size }}</p>
          <p>Price: £{{ item.price }}</p>
          <p>Quantity: {{ item.quantity }}</p>

          <div class="quantity-controls">
            <button @click="decreaseQuantity(item)">-</button>
            <button @click="increaseQuantity(item)">+</button>
            <button class="remove-btn" @click="removeItem(item)">Remove</button>
          </div>
        </div>
      </div>

      <div class="basket-total">
        <h2>Total: £{{ totalPrice }}</h2>
      </div>

      <div v-if="items.length > 0" class="checkout-btn-container">
  <button class="checkout-btn" @click="checkout">Checkout</button>
</div>
    </div>
  </div>
</template>

<style scoped>
.basket-page {
  padding: 2rem;
}

.basket-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
}

.item-image {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.item-info h3 {
  margin: 0;
  font-size: 1.2rem;
}

.quantity-controls button {
  margin-right: 0.5rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.remove-btn {
  color: red;
  border: none;
  background: none;
}

.basket-total {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: bold;
}


.checkout-btn-container {
  margin-top: 1rem;
}

.checkout-btn {
  padding: 0.8rem 1.5rem;
  background: green;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.checkout-btn:hover {
  opacity: 0.85;
}
</style>