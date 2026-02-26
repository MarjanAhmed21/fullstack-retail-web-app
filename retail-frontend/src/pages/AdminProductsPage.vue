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
  category: string | null;
}

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

// Toggle the admin action panel for a product
const toggleAdminActions = (id: number) => {
  expandedProductId.value = expandedProductId.value === id ? null : id;
};

const viewProduct = (product: Product) => {
  router.push(`/products/${product.id}`);
};


const editProduct = (product: Product) => {
  editingProduct.value = { ...product }; // clone so original isn’t immediately changed
  showEditForm.value = true; // show the modal
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
  category: ""
});

const submitNewProduct = async () => {
  try {
    const res = await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newProduct.value)
    });

    if (!res.ok) {
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
    const res = await fetch(`http://localhost:3000/products/${editingProduct.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProduct.value),
    });

    if (!res.ok) {
      alert("Failed to update product");
      return;
    }

    alert("Product updated!");
    showEditForm.value = false;
    editingProduct.value = null;
    fetchProducts(); // refresh the grid
  } catch (err) {
    console.error(err);
    alert("Error updating product");
  }
};




// Category filter
const categories = ref<string[]>(["shoes", "t-shirts", "jumpers", "trousers"]);
const selectedCategory = ref<string>(""); // empty = show all

const filterByCategory = async (category: string) => {
  selectedCategory.value = category;
  const url = category
    ? `http://localhost:3000/products?category=${category}`
    : "http://localhost:3000/products";
  try {
    const res = await fetch(url);
    products.value = await res.json();
  } catch (err) {
    console.error("Error filtering products:", err);
  }
};

onMounted(fetchProducts);
</script>

<template>
  <div class="page">
    <h1>Admin - Products</h1>
    
  <div class="top-bar">
    <div class="filters">
        <button @click="filterByCategory('')">All</button>
        <button @click="filterByCategory('shoes')">Shoes</button>
        <button @click="filterByCategory('tshirts')">T-Shirts</button>
        <button @click="filterByCategory('jumpers')">Jumpers</button>
        <button @click="filterByCategory('trousers')">Trousers</button>
    </div>

    <button class="add-btn" @click="addProduct">+ Add Product</button>
  </div>


    <div v-if="loading" class="loading">
      Loading...
    </div>


<!-- ADD MODAL -->
<div v-if="showAddForm" class="modal">
  <div class="modal-content">
    <h2>Add New Product</h2>

    <label>
      Name
      <input v-model="newProduct.name" />
    </label>

    <label>
      Description
      <textarea v-model="newProduct.description"></textarea>
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
        <option disabled value="">Select category</option>
        <option value="shoes">Shoes</option>
        <option value="tshirts">T-Shirts</option>
        <option value="jumpers">Jumpers</option>
        <option value="trousers">Trousers</option>
      </select>
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
        <option value="shoes">Shoes</option>
        <option value="tshirts">T-Shirts</option>
        <option value="jumpers">Jumpers</option>
        <option value="trousers">Trousers</option>
      </select>
    </label>

    <div class="modal-actions">
      <button @click="submitEditProduct">Save</button>
      <button @click="showEditForm = false">Cancel</button>
    </div>
  </div>
</div>




    <div v-else class="grid">
      <div v-for="product in products" :key="product.id" class="product-wrapper">
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
  position: relative;
  margin-bottom: 2rem;
}


.add-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);

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
</style>
