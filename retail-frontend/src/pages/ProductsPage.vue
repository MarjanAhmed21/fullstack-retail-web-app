<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
  category?: string;
  brand: string;
}

const products = ref<Product[]>([]);
const loading = ref(true);

/* ---------------- FETCH ---------------- */

const fetchProducts = async () => {
  try {
    const res = await fetch("http://localhost:3000/products");
    products.value = await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);

/* ---------------- FILTER STATE ---------------- */

const showFilterPanel = ref(false);

const categories = ["shoes", "tshirts", "jumpers", "trousers"];
const selectedCategories = ref<string[]>([]);

const filters = ref({
  brands: [] as string[],
  colour: [] as string[],
  size: [] as string[]
});

const availableBrands = [
  "Nike",
  "Adidas",
  "Puma",
  "New Balance",
  "Under Armour",
  "BOSS",
  "Armani",
  "Reebok",
  "Hoodrich",
  "Basic",
  "Ralph Lauren",
];

const availableColours = [
  { name: "Blue", hex: "#007BFF" },
  { name: "Light Blue", hex: "#5BC0DE" },
  { name: "Red", hex: "#DC3545" },
  { name: "Dark Green", hex: "#006400" },
  { name: "Green", hex: "#28A745" },
  { name: "Yellow", hex: "#FFC107" },
  { name: "Brown", hex: "#986228" },
  { name: "Pink", hex: "#E83E8C" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Grey", hex: "#6C757D" }
];

const availableSizes = [
  "XS","S","M","L","XL",
  "6","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12"
];

const toggleColour = (colour: string) => {
  const index = filters.value.colour.indexOf(colour);
  if (index > -1) {
    filters.value.colour.splice(index, 1);
  } else {
    filters.value.colour.push(colour);
  }
};

const toggleSize = (size: string) => {
  const index = filters.value.size.indexOf(size);
  if (index > -1) {
    filters.value.size.splice(index, 1);
  } else {
    filters.value.size.push(size);
  }
};

/* ---------------- SORT ---------------- */

const sortOption = ref("");

const sortProducts = (list: Product[]) => {
  let sorted = [...list];

  if (sortOption.value === "priceLow") {
    sorted.sort((a, b) => a.price - b.price);
  }

  if (sortOption.value === "priceHigh") {
    sorted.sort((a, b) => b.price - a.price);
  }

  if (sortOption.value === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortOption.value === "za") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (sortOption.value === "new") {
    sorted.sort((a, b) => b.id - a.id);
  }

  return sorted;
};

/* ---------------- FILTERED PRODUCTS ---------------- */

const filteredProducts = computed(() => {
  let result = [...products.value];

  // CATEGORY FILTER
  if (selectedCategories.value.length > 0) {
    result = result.filter(p =>
      selectedCategories.value.includes(p.category || "")
    );
  }

  // BRAND FILTER
  if (filters.value.brands.length > 0) {
    result = result.filter(p =>
      filters.value.brands.includes(p.brand)
    );
  }

// COLOUR
if (filters.value.colour.length > 0) {
  result = result.filter(p =>
    filters.value.colour.includes((p as any).colour || "")
  );
}

// SIZE
if (filters.value.size.length > 0) {
  result = result.filter(p => {
    if (p.category === "shoes") {
      return filters.value.size.some(size =>
        ["6","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12"].includes(size)
      );
    }

    if (["tshirts","jumpers","trousers"].includes(p.category || "")) {
      return filters.value.size.some(size =>
        ["XS","S","M","L","XL"].includes(size)
      );
    }

    return false;
  });
}
  

  // SORT
  return sortProducts(result);
});

const isFilterApplied = computed(() => {
  return (
    selectedCategories.value.length > 0 ||
    filters.value.brands.length > 0 ||
    filters.value.colour.length > 0 ||
    filters.value.size.length > 0
  );
});
</script>

<template>
  <div class="page">
    <h1>Marjan Threads</h1>

    <!-- SORT + FILTER BAR -->
    <div class="sort-filter-bar">

      <button class="filter-btn" @click="showFilterPanel = true">
  Filters
  <span v-if="isFilterApplied" class="applied-badge">Applied</span>
</button>

      <div class="sort">
        <label>Sort By:</label>

        <select v-model="sortOption" @change="sortProducts">
      <option value="">Default</option>
      <option value="priceLow">Price (Low → High)</option>
      <option value="priceHigh">Price (High → Low)</option>
      <option value="az">A → Z</option>
      <option value="za">Z → A</option>
      <option value="new">What's New</option>
    </select>
      </div>
    </div>

    <!-- FILTER OVERLAY -->
    <div v-if="showFilterPanel" class="filter-overlay" @click="showFilterPanel = false"></div>

    <!-- SIDEBAR -->
<div :class="['filter-sidebar', { open: showFilterPanel }]">

  <div class="filter-header">
    <span class="close-btn" @click="showFilterPanel = false">✕</span>
  </div>

  <!-- BRAND -->
  <div class="filter-section">
    <h4>Brand</h4>

    <label
      v-for="brand in availableBrands"
      :key="brand"
      class="checkbox-option"
    >
      <input
        type="checkbox"
        :value="brand"
        v-model="filters.brands"
      />
      <span class="checkmark"></span>
      {{ brand }}
    </label>
  </div>

  <!-- CATEGORY -->
  <div class="filter-section">
    <h4>Category</h4>

    <label
      v-for="cat in categories"
      :key="cat"
      class="checkbox-option"
    >
      <input
        type="checkbox"
        :value="cat"
        v-model="selectedCategories"
      />
      <span class="checkmark"></span>
      {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
    </label>
  </div>

  <!-- COLOUR -->
  <div class="filter-section">
  <h4>Colour</h4>

  <div class="colour-grid">
    <div
      v-for="colour in availableColours"
      :key="colour.name"
      class="colour-box"
      :class="{ selected: filters.colour.includes(colour.name) }"
      :style="{ backgroundColor: colour.hex }"
      @click="toggleColour(colour.name)"
    ></div>
  </div>
</div>

  <!-- SIZE -->
  <div class="filter-section">
  <h4>Size</h4>

  <div class="size-grid">
    <div
      v-for="size in availableSizes"
      :key="size"
      class="size-box"
      :class="{ selected: filters.size.includes(size) }"
      @click="toggleSize(size)"
    >
      {{ size }}
    </div>
  </div>
</div>

</div>

    <!-- PRODUCTS -->
    <p v-if="loading">Loading...</p>

    <div v-else class="grid">
      <ProductCard 
        v-for="product in filteredProducts"
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

.sort-filter-bar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1.5rem;
}

.sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort select{
  padding:0.4rem;
}

.applied-text {
  margin-left: 8px;
  font-size: 0.85rem;
  color: #28a745;
  font-weight: 500;
}

.applied-badge {
  margin-left: 8px;
  background: #28a745;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

.filter-btn{
  background:#444;
  color:white;
  border:none;
  padding:0.5rem 1rem;
}

.filter-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.4);
  z-index:9998;
}

.filter-sidebar{
  position:fixed;
  top:0;
  left:0;
  width:260px;
  height:100%;
  background:white;
  transform:translateX(-100%);
  transition:0.3s;
  padding:1rem;
  z-index:9999;
}

.filter-sidebar.open{
  transform:translateX(0);
}

.filter-header{
  display:flex;
  justify-content:flex-end;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-section h4{
  margin-bottom:0.3rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-option input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  border-radius: 3px;
  display: inline-block;
  position: relative;
}

.checkbox-option input:checked + .checkmark {
  background-color: #444;
  border-color: #444;
}

.checkbox-option input:checked + .checkmark::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  left: 2px;
  top: -1px;
}


.colour-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.colour-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.15s ease, border 0.15s ease;
}

.colour-box:hover {
  transform: scale(1.1);
}

.colour-box.selected {
  border: 2px solid #000;
}

.size-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.size-box {
  padding: 6px 0;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}


.size-box.selected {
  background-color: #333;
  color: white;
}

.filter-section select {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

</style>
