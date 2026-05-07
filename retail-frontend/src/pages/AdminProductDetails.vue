<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

interface Product {
  id: number;
  name: string;
  description: string;
  long_description?: string; // make optional
  price: number;
  stock: number;
  image_url: string;
  category: string | null;
  disabled_sizes?: string[]; 
  
}

const route = useRoute();
const product = ref<Product | null>(null);
const loading = ref(true);
const editMode = ref(false);

const sizes = [
  "6","7","7.5","8","8.5",
  "9","9.5","10","10.5",
  "11","11.5","12"
];

const fetchProduct = async () => {
  try {
    const res = await fetch(`http://localhost:3000/products/${route.params.id}`);
    const data: Product = await res.json();

    // Ensure long_description and disabled_sizes exist
    if (!data.long_description) data.long_description = "";
    if (!data.disabled_sizes) data.disabled_sizes = [];

    product.value = data;
  } catch (err) {
    console.error("Error fetching product:", err);
    product.value = null; // fallback
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProduct);

const toggleEdit = () => {
  editMode.value = !editMode.value;
};

const toggleSizeDisabled = (size: string) => {
  if (!product.value) return;
  const index = product.value.disabled_sizes!.indexOf(size);
  if (index > -1) product.value.disabled_sizes!.splice(index, 1);
  else product.value.disabled_sizes!.push(size);
};

const saveChanges = async () => {
  if (!product.value) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:3000/products/${product.value.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(product.value)
    });

    if (!res.ok) {
      const text = await res.text();
      console.log("PUT failed:", text);
      alert("Failed to save changes");
      return;
    }

    editMode.value = false;
    alert("Product updated!");
  } catch (err) {
    console.error("Error saving changes:", err);
    alert("Failed to save changes");
  }
};
</script>


<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="product" class="details-page">
    <img :src="product.image_url" class="product-image" />

    <div class="info">

      <!-- NAME -->
      <div v-if="editMode">
        <input v-model="product.name" class="edit-input" />
      </div>
      <h1 v-else>{{ product.name }}</h1>

      <!-- PRICE -->
      <div v-if="editMode">
        <input type="number" v-model="product.price" class="edit-input" />
      </div>
      <p v-else class="price">£{{ product.price }}</p>

      <!-- STOCK -->
      <div v-if="editMode">
        <input type="number" v-model="product.stock" class="edit-input" />
      </div>
      <p v-else>Stock: {{ product.stock }}</p>

      <!-- SIZES (Admin Controls) -->
      <div class="sizes">
        <label>Size Availability:</label>

        <div class="size-grid">
          <button
  v-for="size in sizes"
  :key="size"
  :class="['size-btn', { disabled: product?.disabled_sizes?.includes(size) }]"
  @click="editMode && toggleSizeDisabled(size)"
>
  {{ size }}
</button>
        </div>
      </div>

      <!-- EDIT BUTTONS -->
      <button v-if="!editMode" class="add-to-basket" @click="toggleEdit">
        Edit Product
      </button>

      <div v-else class="admin-buttons">
        <button class="save-btn" @click="saveChanges">Save</button>
        <button class="cancel-btn" @click="toggleEdit">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Long Description Section -->
<div class="product-details" v-if="product">
  <h3>Product Details</h3>

  <textarea
    v-if="editMode"
    v-model="product.long_description"
    class="long-desc-edit"
    placeholder="Enter long description here..."
  ></textarea>

  <p v-else class="long-description">
    {{ product.long_description || "No long description added yet." }}
  </p>
</div>
</template>

<style scoped>
.details-page {
  display: flex;
  gap: 3rem;
  padding: 3rem;
  align-items: flex-start;
}

.product-details {
  max-width: 900px;
  margin: 2rem 3rem;
  font-size: 1.2rem;
  line-height: 1.6;
}

.product-image {
  width: 400px;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
}

.info > p:nth-of-type(2) {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

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

.size-btn:hover {
  background: #333;
  color: white;
}

.size-btn.disabled {
  text-decoration: line-through;
  opacity: 0.5;
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

/* Admin specific */
.edit-input {
  font-size: 1.2rem;
  padding: 0.4rem;
  margin-bottom: 0.8rem;
  width: 100%;
}

.long-desc-edit {
  width: 100%;
  min-height: 120px;
  font-size: 1rem;
  padding: 0.8rem;
}

.admin-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn {
  padding: 0.8rem 1.2rem;
  background: green;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  padding: 0.8rem 1.2rem;
  background: crimson;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>