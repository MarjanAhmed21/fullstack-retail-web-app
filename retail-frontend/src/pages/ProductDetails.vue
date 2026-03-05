<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBasketStore } from "../stores/basket";
import { getCurrentInstance } from "vue";

console.log("APP INSTANCE:", getCurrentInstance()?.appContext.app);

interface Product {
  id: number;
  name: string;
  description: string;
  long_description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string | null;
  disabled_sizes?: string[];
}


const route = useRoute();
const product = ref<Product | null>(null);
const loading = ref(true);


const selectedSize = ref<string | null>(null);

const sizes = [
  "6", "7", "7.5", "8", "8.5",
  "9", "9.5", "10", "10.5",
  "11", "11.5", "12"
];

const selectSize = (size: string) => {
  selectedSize.value = size;
  sizeError.value = false;
};

const sizeError = ref(false);

const addToBasket = () => {
  if (!selectedSize.value || !product.value) {
    sizeError.value = true;
    return;
  }

  sizeError.value = false;

 basket.addItem({
    productId: product.value.id,
    name: product.value.name,
    price: Number(product.value.price),
    size: selectedSize.value,
    quantity: 1,
    image_url: product.value.image_url
  });

  console.log("Basket store instance:", basket);
  console.log("Basket items after adding:", basket.items);
};


const basket = useBasketStore();


onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3000/products/${route.params.id}`);
    product.value = await res.json();
  } catch (err) {
    console.error("Error fetching product:", err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="product" class="details-page">
    <img :src="product.image_url" class="product-image" />

    <div class="info">
      <h1>{{ product.name }}</h1>

      <p class="price">£{{ product.price }}</p>
      <p>Stock: {{ product.stock }}</p>

      <div class="sizes">
  <label>Select a size:</label>

  <div class="size-grid">
    <button
  v-for="size in sizes"
  :key="size"
  :class="[
    'size-btn',
    { 
      selected: selectedSize === size,
      disabled: product.disabled_sizes?.includes(size)
    }
  ]"
  :disabled="product.disabled_sizes?.includes(size)"
  @click="selectSize(size)"
>
  {{ size }}
</button>

    <p v-if="sizeError" class="size-error">
    Please select a size before adding to basket.
    </p>

  </div>
</div>

      <button class="add-to-basket" @click="addToBasket">
        Add to Basket
      </button>
    </div>
  </div>

  <!-- Product details always under the main info -->
  <div v-if="product?.long_description" class="product-details">
    <h3>Product Details</h3>
    <p class="long-description">{{ product.long_description }}</p>
  </div>
</template>



<style scoped>
.details-page {
  display: flex;
  gap: 3rem;
  padding: 3rem;
  align-items: flex-start; /* optional, avoids stretching image */
}

.product-details {
  max-width: 900px; /* matches info width nicely */
  margin: 2rem 3rem; /* spacing from flex container */
  font-size: 1.2rem;
  line-height: 1.6;
}

.product-image {
  width: 400px;       /* keeps the width fixed */
  height: auto;       /* maintain aspect ratio */
  object-fit: contain; /* ensures it scales nicely */
  border-radius: 12px;
}

/* Stock text */
.info > p:nth-of-type(2) {
  font-size: 1.2rem;   /* bigger font */
  font-weight: 500;    /* optional, slightly bolder */
  margin: 0.5rem 0;    /* spacing */
}

/* Sizes label + select dropdown */
.sizes label {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.size-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.size-btn {
  padding: 0.6rem 1rem;
  background: white;
  border: 1.5px solid black;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

/* Hover state */
.size-btn:hover {
  background: #333;
  color: white;
}

/* Selected state */
.size-btn.selected {
  background: purple;
  color: white;
  border-color: purple;
}

.sizes select {
  font-size: 1.2rem;   /* make dropdown text bigger */
  padding: 0.3rem 0.5rem;
}

.size-btn.disabled {
  text-decoration: line-through;
  opacity: 0.5;
  cursor: not-allowed;
}

.size-error {
  color: red;
  margin-top: 0.6rem;
  font-size: 0.9rem;
}


.price {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0;
}

.add-to-basket {
  margin-top: 1rem;
  padding: 0.8rem 1.2rem;
  background: black;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>