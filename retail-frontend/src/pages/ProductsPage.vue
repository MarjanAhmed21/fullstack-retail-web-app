<script setup lang="ts">
import { ref, onMounted } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { useRouter } from "vue-router";
const router = useRouter();

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

const products = ref<Product[]>([]);
const loading = ref(true);

const fetchProducts = async (category = "") => {
  const url = category
    ? `http://localhost:3000/products?category=${category}`
    : "http://localhost:3000/products";

  const res = await fetch(url);
  products.value = await res.json();
};

onMounted(async () => {
  try {
    await fetchProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
});


</script>

<template>
  <div class="page">
    <h1>Retail Store</h1>

    <div class="filters">
      <button @click="fetchProducts()">All</button>
      <button @click="fetchProducts('shoes')">Shoes</button>
      <button @click="fetchProducts('tshirts')">T-Shirts</button>
      <button @click="fetchProducts('jumpers')">Jumpers</button>
      <button @click="fetchProducts('trousers')">Trousers</button>
    </div>


    <p v-if="loading">Loading...</p>

    <div v-else class="grid">
      <ProductCard 
      v-for="product in products"
      :key="product.id"
      :product="product" 
      @click="router.push(`/products/${product.id}`)"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

</style>
