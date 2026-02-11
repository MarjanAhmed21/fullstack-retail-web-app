<script setup lang="ts">
import { ref, onMounted } from "vue";

const products = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch("http://localhost:3000/products");
    products.value = await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1>Products</h1>

    <p v-if="loading">Loading...</p>

    <div v-else>
      <div v-for="product in products" :key="product.id">
        {{ product.name }} - £{{ product.price }}
      </div>
    </div>
  </div>
</template>
