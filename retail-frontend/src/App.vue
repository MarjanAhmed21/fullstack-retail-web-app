<script setup>
import { onMounted, ref } from "vue";
import api from "./services/api";

const products = ref([]);

onMounted(async () => {
  try {
    const res = await api.get("/products");
    products.value = res.data;
  } catch (err) {
    console.error(err);
  }
});
</script>

<template>
  <h1>Retail Store</h1>

  <div v-for="product in products" :key="product.id">
    <h3>{{ product.name }}</h3>
    <p>{{ product.description }}</p>
    <p>£{{ product.price }}</p>
  </div>
</template>
