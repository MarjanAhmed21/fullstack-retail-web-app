<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { useBasketStore } from "../stores/basket";
import { storeToRefs } from "pinia";

const router = useRouter();


const basket = useBasketStore();
const { itemCount } = storeToRefs(basket);

const goToBasket = () => {
  router.push("/basket");
};



const searchTerm = ref("");
const products = ref<Array<{ id: number; name: string }>>([]);
const showSuggestions = ref(false);

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/products");
    const data = await res.json();
    products.value = data; // assuming each product has id and name
  } catch (err) {
    console.error("Error fetching products:", err);
  }
});

// filter products based on input
const filteredProducts = computed(() => {
  if (!searchTerm.value) return [];
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const goToProduct = (id: number) => {
  searchTerm.value = "";
  showSuggestions.value = false;
  router.push(`/products/${id}`);
};

</script>

<template>
  <nav class="navbar">
    <!-- Logo -->
    <div class="nav-left">
    <div class="logo" @click="router.push('/')">
      RetailStore
    </div>
    </div>

    <!-- Search -->
    <div class="nav-center">
  <input
    type="text"
    placeholder="Search for products..."
    v-model="searchTerm"
    @focus="showSuggestions = true"
    @blur="() => setTimeout(() => showSuggestions = false, 200)" 
  />

  <!-- Suggestions dropdown -->
  <ul v-if="showSuggestions && filteredProducts.length" class="suggestions">
    <li
      v-for="product in filteredProducts"
      :key="product.id"
      @click="goToProduct(product.id)"
    >
      {{ product.name }}
    </li>
  </ul>
</div>

    <!-- Icons -->
    <div class="nav-right">
      <span class="icon">👤</span>
      <span class="icon">❤️</span>

      <div class="basket-icon" @click="goToBasket">
        🛒
        <span v-if="itemCount > 0" class="basket-count">
          {{ itemCount }}
        </span>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 3rem;
  border-bottom: 1px solid #ddd;
  background: white;
}


.nav-left {
  flex: 1;
  display: flex;
  justify-content: flex-start; /* logo on left */
  align-items: center;
}

.nav-center {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0,0,0,0.15);
  z-index: 50;
  margin-top: 4px;
  padding: 0;
  list-style: none;
}

.suggestions li {
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.suggestions li:hover {
  background: purple;
  color: white;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end; /* icons on right */
  align-items: center;
  gap: 1.5rem;
}

.nav-center input {
  width: 100%;
  max-width: 500px; /* will never be bigger than 500px */
  min-width: 250px; /* still usable on small screens */
  padding: 0.7rem 1rem;
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.nav-center input:focus {
  outline: none;
  border-color: purple;
  box-shadow: 0 0 5px rgba(128, 0, 128, 0.5);
}


.logo {
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
}

.search-container {
  flex: 1;
  margin: 0 2rem;
}

.search-container input {
  height: 45px;
  width: 500px;
  font-size: 1rem;
  padding: 0 1.2rem;
  border-radius: 25px;
}

.icons {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon {
  font-size: 1.3rem;
  cursor: pointer;
}

.basket-icon {
  position: relative;
  cursor: pointer;
  font-size: 1.3rem;
}

.basket-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background: purple;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 50%;
}
</style>