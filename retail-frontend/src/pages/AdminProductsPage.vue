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
  category: string | null;

  brand?: string;
  colour?: string;
  size?: string;
}

const sortOption = ref("");

const newBrandInput = ref("");

const filters = ref({
  brands: [] as string[],
  colour: [] as string[],
  size: [] as string[]
});

const availableBrands = ref<string[]>([]);


const addNewBrand = async () => {
  const brand = newBrandInput.value.trim();
  if (!brand) return;

  try {
    const res = await fetch("http://localhost:3000/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: brand }),
    });

    if (!res.ok) {
      alert("Failed to add brand (maybe duplicate?)");
      return;
    }

    // reload from DB
    await fetchBrands();

    // auto select it
    newProduct.value.brand = brand;

    // clear input
    newBrandInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Error adding brand");
  }
};


const addNewCategory = async () => {
  const category = newCategoryInput.value.trim();

  if (!category) return;

  try {
    const res = await fetch("http://localhost:3000/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: category }),
    });

    if (!res.ok) {
      alert("Failed to add category");
      return;
    }

    await fetchCategories();

    // auto-select new category
    newProduct.value.category = category;

    newCategoryInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Error adding category");
  }
};



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

const filteredProducts = computed(() => {
  let result = [...products.value];

  // CATEGORY FILTER
  if (selectedCategories.value.length > 0) {
    result = result.filter(product =>
      selectedCategories.value.includes(product.category || "")
    );
  }

  // BRAND FILTER
  if (filters.value.brands.length > 0) {
    result = result.filter(p =>
      filters.value.brands.includes(p.brand || "")
    );
  }


  // COLOUR
if (filters.value.colour.length > 0) {
  result = result.filter(p =>
    filters.value.colour.includes(p.colour || "")
  );
}

// SIZE
if (filters.value.size.length > 0) {
  result = result.filter(p => {
    // SHOES
    if (p.category === "shoes") {
      return filters.value.size.some(size =>
        ["6","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12"].includes(size)
      );
    }

    // CLOTHING
    if (["tshirts", "jumpers", "trousers"].includes(p.category || "")) {
      return filters.value.size.some(size =>
        ["XS","S","M","L","XL"].includes(size)
      );
    }

    return false;
  });
}

  return result;
});


const isFilterApplied = computed(() => {
  return (
    selectedCategories.value.length > 0 ||
    filters.value.brands.length > 0 ||
    filters.value.colour.length > 0 ||
    filters.value.size.length > 0
  );
});

const showFilterPanel = ref(false);

const products = ref<Product[]>([]);
const loading = ref(true);

// Tracks which product card's admin actions are expanded
const expandedProductId = ref<number | null>(null);

// Fetch all products from backend
const fetchProducts = async () => {
  try {
    const res = await fetch("http://localhost:3000/products");
    products.value = await res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
  } finally {
    loading.value = false;
  }
};

const fetchBrands = async () => {
  try {
    const res = await fetch("http://localhost:3000/brands");
    availableBrands.value = await res.json();
  } catch (err) {
    console.error("Error fetching brands:", err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await fetch("http://localhost:3000/categories");
    categories.value = await res.json();
  } catch (err) {
    console.error("Error fetching categories:", err);
  }
};

// Toggle the admin action panel for a product
const toggleAdminActions = (id: number) => {
  expandedProductId.value = expandedProductId.value === id ? null : id;
};

const viewProduct = (product: Product) => {
  router.push(`/admin/products/${product.id}`);
};


const editProduct = (product: Product) => {
  editingProduct.value = {
    ...product,
    brand: product.brand || "",
    colour: product.colour || "",
    size: product.size || ""
  };
  showEditForm.value = true;
};



const deleteProduct = async (product: Product) => {
  if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/products/${product.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert(`${product.name} deleted!`);
      fetchProducts();
    } else {
      alert("Failed to delete product");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting product");
  }
};


// Add product button handler
const showAddForm = ref(false);

const addProduct = () => {
  showAddForm.value = true;
};

const newProduct = ref({
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image_url: "",
  category: "",

  brand: "",
  colour: "",
  size: ""
});

const submitNewProduct = async () => {
  try {
    const token = localStorage.getItem("token");

const res = await fetch("http://localhost:3000/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(newProduct.value)
});

    if (!res.ok) {
     const text = await res.text();
  console.log(text);
      alert("Failed to add product");
      return;
    }

    alert("Product added!");

    showAddForm.value = false;

    // Reset form
    newProduct.value = {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      image_url: "",
      category: ""
    };

    fetchProducts(); // refresh grid
  } catch (err) {
    console.error(err);
    alert("Error adding product");
  }
};



const editingProduct = ref<Product | null>(null);
const showEditForm = ref(false);

const submitEditProduct = async () => {
  if (!editingProduct.value) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/products/${editingProduct.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct.value),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.log("UPDATE ERROR:", text);
      alert("Failed to update product");
      return;
    }

    alert("Product updated!");
    showEditForm.value = false;
    editingProduct.value = null;
    fetchProducts();

  } catch (err) {
    console.error(err);
    alert("Error updating product");
  }
};




// Category filter

const categories = ref<string[]>([]);
const newCategoryInput = ref("");
const selectedCategories = ref<string[]>([]); // empty = show all



onMounted(() => {
  fetchProducts();
  fetchBrands();
  fetchCategories();
});



const sortProducts = () => {

  if (sortOption.value === "priceLow") {
    products.value.sort((a, b) => a.price - b.price);
  }

  if (sortOption.value === "priceHigh") {
    products.value.sort((a, b) => b.price - a.price);
  }

  if (sortOption.value === "az") {
    products.value.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortOption.value === "za") {
    products.value.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (sortOption.value === "new") {
    products.value.sort((a, b) => b.id - a.id);
  }

};


</script>

<template>
  <div class="page">
    <h1>Admin - Products</h1>
    
  <div class="top-bar">
    

    <button class="add-btn" @click="addProduct">+ Add Product</button>
  </div>


    <div v-if="loading" class="loading">
      Loading...
    </div>

    <!-- FILTER OVERLAY -->
<div v-if="showFilterPanel" class="filter-overlay" @click="showFilterPanel = false"></div>

   <div :class="['filter-sidebar', { open: showFilterPanel }]">

   <div class="filter-header">
    <span class="close-btn" @click="showFilterPanel = false">✕</span>
  </div>

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


<div class="filter-section">

  <h4>Category</h4>

  <label
    v-for="category in categories"
    :key="category"
    class="checkbox-option"
  >
    <input
      type="checkbox"
      :value="category"
      v-model="selectedCategories"
    />

    <span class="checkmark"></span>

    {{ category.charAt(0).toUpperCase() + category.slice(1) }}
  </label>

</div>

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


<!-- ADD MODAL -->
<div v-if="showAddForm" class="modal">
  <div class="modal-content">
    <h2>Add New Product</h2>

    <label>
  Brand
  <select v-model="newProduct.brand">
  <option value="">Select brand</option>
  <option v-for="brand in availableBrands" :key="brand">
    {{ brand }}
  </option>
</select>

<input 
  v-model="newBrandInput"
  placeholder="Or enter new brand"
/>

<button @click="addNewBrand">Add Brand</button>
</label>

    <label>
      Name
      <input v-model="newProduct.name" />
    </label>

    <label>
      Description
      <textarea v-model="newProduct.description"></textarea>
    </label>

    <label>
  Colour
  <select v-model="newProduct.colour">
  <option value="">Select colour</option>

  <option
    v-for="colour in availableColours"
    :key="colour.name"
    :value="colour.name"
  >
    {{ colour.name }}
  </option>
</select>
</label>



    <label>
      Price (£)
      <input v-model.number="newProduct.price" type="number" />
    </label>

    <label>
      Stock Quantity
      <input v-model.number="newProduct.stock" type="number" />
    </label>

    <label>
      Image URL
      <input v-model="newProduct.image_url" />
    </label>

    <label>
  Category

  <select v-model="newProduct.category">
    <option value="">Select category</option>

    <option
      v-for="category in categories"
      :key="category"
      :value="category"
    >
      {{ category }}
    </option>
  </select>

  <input
    v-model="newCategoryInput"
    placeholder="Or enter new category"
  />

  <button @click="addNewCategory">
    Add Category
  </button>
</label>

    <div class="modal-actions">
      <button @click="submitNewProduct">Save</button>
      <button @click="showAddForm = false">Cancel</button>
    </div>
  </div>
</div>



<!-- EDIT MODAL -->
<div v-if="showEditForm && editingProduct" class="modal">
  <div class="modal-content">
    <h2>Edit Product</h2>

    <label>
      Name
      <input v-model="editingProduct.name" />
    </label>

        <label>
      Brand
      <input v-model="editingProduct.brand" />
    </label>

    <label>
      Colour
      <select v-model="editingProduct.colour">
  <option value="">Select colour</option>

  <option
    v-for="colour in availableColours"
    :key="colour.name"
    :value="colour.name"
  >
    {{ colour.name }}
  </option>
</select>
    </label>


    <label>
      Description
      <textarea v-model="editingProduct.description"></textarea>
    </label>

    <label>
      Price
      <input v-model.number="editingProduct.price" type="number" />
    </label>

    <label>
      Stock
      <input v-model.number="editingProduct.stock" type="number" />
    </label>

    <label>
      Image URL
      <input v-model="editingProduct.image_url" />
    </label>

    <label>
      Category
      <select v-model="editingProduct.category">
  <option
    v-for="category in categories"
    :key="category"
    :value="category"
  >
    {{ category }}
  </option>
</select>
    </label>

    <div class="modal-actions">
      <button @click="submitEditProduct">Save</button>
      <button @click="showEditForm = false">Cancel</button>
    </div>
  </div>
</div>


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

    <div class="grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-wrapper">
        <ProductCard 
        :product="product" 
        @click="toggleAdminActions(product.id)"
        />

        <div v-if="expandedProductId === product.id" class="admin-actions">
          <button class="view-btn" @click="viewProduct(product)">View</button>
          <button class="edit-btn" @click="editProduct(product)">Edit</button>
          <button class="delete-btn" @click="deleteProduct(product)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}


.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}


.add-btn {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #218838;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-content input,
.modal-content textarea {
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}
.modal-content select {
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}





/* Grid same as customer page */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.product-wrapper {
  display: flex;
  flex-direction: column;
}

.admin-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.admin-actions button {
  flex: 1;
  padding: 0.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}


.view-btn {
  background-color: #17a2b8;
  color: white;
}

.edit-btn {
  background-color: #ffc107;
  color: black;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.admin-actions button:hover {
  opacity: 0.85;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
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

.filter-btn{
  padding:0.5rem 1rem;
  background:#444;
  color:white;
  border:none;
  border-radius:5px;
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

/* OVERLAY */

.filter-overlay{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.4);
  z-index:90;
}

/* SIDEBAR */

.filter-sidebar{
  position:fixed;
  top:0;
  left:0;
  width:280px;
  height:100vh;
  background:white;
  box-shadow:2px 0 10px rgba(0,0,0,0.2);
  transform:translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  z-index:100;
  padding:1.5rem;
  display:flex;
  flex-direction:column;
  gap:1.2rem;
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

/* Hover effect */
.colour-box:hover {
  transform: scale(1.1);
}

/* Selected state */
.colour-box.selected {
  border: 2px solid #000;
}

/* White needs visible border */
.colour-box[style*="rgb(255, 255, 255)"],
.colour-box[style*="#FFFFFF"] {
  border: 1px solid #ccc;
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
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.size-box:nth-child(n+6) {
  margin-top: 15px; /* adds a small gap before number sizes */
}

/* Hover */
.size-box:hover {
  background-color: #f1f1f1;
}

/* Selected */
.size-box.selected {
  background-color: #333;
  color: white;
  border-color: #333;
}
</style>
