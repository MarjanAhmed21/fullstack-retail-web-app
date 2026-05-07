<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

const heroTitle = ref("");
const heroSubtitle = ref("");


const products = ref<Product[]>([]);
const currentIndex = ref(0);
let interval: number | null = null;

const startSlideshow = () => {
  stopSlideshow();

  interval = window.setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopSlideshow = () => {
  if (interval) {
    clearInterval(interval);
  }
};

const nextSlide = () => {
  currentIndex.value =
    (currentIndex.value + 1) % products.value.length;
};

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + products.value.length) % products.value.length;
};

const manualNext = () => {
  nextSlide();
  startSlideshow(); // reset 5s timer
};

const manualPrev = () => {
  prevSlide();
  startSlideshow(); // reset 5s timer
};


onMounted(async () => {

  const res = await fetch("http://localhost:3000/admin/homepage-products");
  const data = await res.json();

  products.value = data;


  const heroRes = await fetch("http://localhost:3000/admin/homepage-hero");
const hero = await heroRes.json();

heroTitle.value = hero.title;
heroSubtitle.value = hero.subtitle;

  startSlideshow();

});

onBeforeUnmount(() => {
  stopSlideshow();
});
</script>

<template>
  <div class="home">

    <section class="hero">
      <h1>{{ heroTitle }}</h1>
      <p class="herosubtitle">{{ heroSubtitle }}</p>
    </section>

    <section class="featured">
      <h2>Featured Products</h2>

      <div v-if="products.length" class="slideshow">

    <button class="nav left" @click="manualPrev">‹</button>

    <Transition name="slide" mode="out-in">
      <div class="slide" :key="products[currentIndex].id">

        <div class="slide-image">
            <img :src="products[currentIndex].image_url" />
        </div>

        <div class="slide-info">
      <h3>{{ products[currentIndex].name }}</h3>
      <p class="price">£{{ products[currentIndex].price }}</p>
      <p class="description">{{ products[currentIndex].description }}</p>
    </div>
      </div>
    </Transition>

    <button class="nav right" @click="manualNext">›</button>

  </div>

    </section>

  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: #f6f6f6;
}

.hero h1{
font-size:2.5rem;
margin-bottom:12px;
}

.herosubtitle{
font-size:1.2em;
color:#555;
max-width:700px;
margin:0 auto 20px auto;
}


.featured {
  padding: 3rem;
  text-align:center;
}

.slideshow{
  position:relative;
  max-width:900px;
  margin:0 auto;
  padding: 1rem;
}

.slide{
  display:flex;
  align-items:center;
  gap:3rem;
}

.slide-image{
  flex:1;
}

.slide-image img{
  width:100%;
  height:350px;
  object-fit:cover;
  border:1px solid #ddd;
}

.slide-info{
  flex:1;
  text-align:left;
}

.slide-info h3{
  font-size:1.8rem;
  margin-bottom:10px;
}

.price{
  font-size:1.4rem;
  font-weight:bold;
  margin-bottom:15px;
}

.description{
  color:#555;
  line-height:1.5;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.45s ease, opacity 0.45s ease;
}

.slide-enter-from {
  transform: translateX(60px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}

.nav{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  background:white;
  border:1px solid #ccc;
  font-size:2rem;
  cursor:pointer;
  padding:5px 12px;
}

.nav.left{
  left:-60px;
}

.nav.right{
  right:-60px;
}

.nav:hover{
  background:purple;
  color:white;
}
</style>