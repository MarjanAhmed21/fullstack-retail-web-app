<script setup lang="ts">
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

defineProps<{
  product: Product;
}>();
</script>

<template>
  <div class="card">
    <img 
    :src="product.image_url || '/images/placeholder.jpg'" 
    alt="Product image"
    />

    <div class="content">
      <h2>{{ product.name }}</h2>
      <p class="description">{{ product.description }}</p>

      <div class="bottom">
       <span class="price">£{{ Number(product.price).toFixed(2) }}</span>
        <span class="stock" :class="{ low: product.stock < 5 }">
          {{ product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock" }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
}

img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.description {
  font-size: 0.9rem;
  color: #666;
}

.bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  font-size: 1.1rem;
}

.stock.low {
  color: red;
  font-weight: bold;
}
</style>
