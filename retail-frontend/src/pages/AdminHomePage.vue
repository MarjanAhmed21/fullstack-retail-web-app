<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  description: string;
}

interface Hero {
  title: string;
  subtitle: string;
}

const allProducts = ref<Product[]>([]);
const slideshowProducts = ref<(Product | null)[]>([null, null, null, null]);

const currentIndex = ref(0);

const hero = ref<Hero | null>(null);

const showHeroModal = ref(false);

const editingHero = ref({
  title: "",
  subtitle: ""
});

let interval: number | null = null;

/* --------------------------
   SLIDESHOW
---------------------------*/

const startSlideshow = () => {
  stopSlideshow();

  interval = window.setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopSlideshow = () => {
  if (interval) clearInterval(interval);
};

const nextSlide = () => {
  currentIndex.value =
    (currentIndex.value + 1) % slideshowProducts.value.length;
};

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + slideshowProducts.value.length) %
    slideshowProducts.value.length;
};

const manualNext = () => {
  nextSlide();
  startSlideshow();
};

const manualPrev = () => {
  prevSlide();
  startSlideshow();
};

/* --------------------------
   HERO EDITOR
---------------------------*/

const openHeroEditor = () => {
  if (!hero.value) return;

  editingHero.value = {
    title: hero.value.title,
    subtitle: hero.value.subtitle
  };

  showHeroModal.value = true;
};

const saveHero = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/admin/homepage-hero", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingHero.value)
    });

    if (!res.ok) {
      alert("Failed to update hero");
      return;
    }

    hero.value = { ...editingHero.value };

    showHeroModal.value = false;

    alert("Hero updated!");
  } catch (err) {
    console.error(err);
    alert("Error updating hero");
  }
};

/* --------------------------
   PRODUCT SELECTOR
---------------------------*/

const showPicker = ref(false);
const selectingIndex = ref<number | null>(null);

const openSelector = (index: number) => {
  selectingIndex.value = index;
  showPicker.value = true;
};

const selectProduct = (product: Product) => {
  if (selectingIndex.value !== null) {
    slideshowProducts.value[selectingIndex.value] = product;
  }

  showPicker.value = false;
};

const saveSlideshow = async () => {

  const productIds = slideshowProducts.value
    .filter(p => p !== null)
    .map(p => p!.id);

  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/admin/homepage-products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      products: productIds
    })
  });

  if (res.ok) {
    alert("Homepage slideshow saved!");
  } else {
    alert("Failed to save slideshow");
  }

};

/* --------------------------
   LOAD DATA
---------------------------*/

onMounted(async () => {

  const resProducts = await fetch("http://localhost:3000/products");
  const all = await resProducts.json();
  allProducts.value = all;

  const resSlideshow = await fetch("http://localhost:3000/admin/homepage-products");
  const saved = await resSlideshow.json();
  slideshowProducts.value = saved;

  const heroRes = await fetch("http://localhost:3000/admin/homepage-hero");
  const heroData: Hero = await heroRes.json();
  hero.value = heroData;

  startSlideshow();
});

onBeforeUnmount(() => {
  stopSlideshow();
});
</script>

<template>
<div class="admin-home">

<!-- HERO -->
<section v-if="hero" class="hero">

<h1>{{ hero.title }}</h1>
<p class="hero-subtitle">{{ hero.subtitle }}</p>

<button class="edit-btn" @click="openHeroEditor">
Edit Hero
</button>

</section>

<!-- ADMIN CONTROLS -->
<section class="admin-controls">

<h2>Homepage Slideshow Products</h2>

<button class="save-btn" @click="saveSlideshow">
Save Slideshow
</button>

<div class="slot-column">

<div
v-for="(product,index) in slideshowProducts"
:key="index"
class="slot-box"
@click="openSelector(index)"
>

<div v-if="product">
<img :src="product.image_url" />
<p>{{ product.name }}</p>
<p>£{{ product.price }}</p>
</div>

<div v-else class="empty">
Select Product {{ index + 1 }}
</div>

</div>

</div>

</section>

<!-- SLIDESHOW PREVIEW -->

<section class="featured">

<h2>Homepage Preview</h2>

<div v-if="slideshowProducts.length" class="slideshow">

<button class="nav left" @click="manualPrev">‹</button>

<Transition name="slide" mode="out-in">

<div
class="slide"
:key="slideshowProducts[currentIndex]?.id"
v-if="slideshowProducts[currentIndex]"
>

<div class="slide-image">
<img :src="slideshowProducts[currentIndex]?.image_url" />
</div>

<div class="slide-info">
<h3>{{ slideshowProducts[currentIndex]?.name }}</h3>

<p class="price">
£{{ slideshowProducts[currentIndex]?.price }}
</p>

<p class="description">
{{ slideshowProducts[currentIndex]?.description }}
</p>
</div>

</div>

</Transition>

<button class="nav right" @click="manualNext">›</button>

</div>

</section>

<!-- HERO EDIT MODAL -->

<div v-if="showHeroModal" class="modal">
  <div class="modal-content">

    <h2>Edit Homepage Hero</h2>

    <label>
      Title
      <input v-model="editingHero.title" />
    </label>

    <label>
      Subtitle
      <textarea v-model="editingHero.subtitle"></textarea>
    </label>

    <div class="modal-actions">
      <button @click="saveHero">Save</button>
      <button @click="showHeroModal = false">Cancel</button>
    </div>

  </div>
</div>

<!-- PRODUCT PICKER MODAL -->

<div v-if="showPicker" class="modal-overlay">

<div class="modal">

<h3>Select Product</h3>

<div class="picker-grid">

<div
v-for="product in allProducts"
:key="product.id"
class="picker-card"
@click="selectProduct(product)"
>

<img :src="product.image_url" />

<h4>{{ product.name }}</h4>

<p>£{{ product.price }}</p>

</div>

</div>

<button class="close-btn" @click="showPicker=false">
Close
</button>

</div>

</div>

</div>
</template>

<style scoped>

/* HERO */

.hero{
text-align:center;
padding:4rem 2rem;
background:#f6f6f6;
}

.hero h1{
font-size:2.5rem;
margin-bottom:10px;
}

.hero-subtitle{
font-size:1.2rem;
color:#555;
max-width:700px;
margin:0 auto 20px auto;
}

/* ADMIN CONTROL */

.admin-controls{
padding:2rem 3rem;
text-align:center;
}

.slot-column{
display:flex;
justify-content:center;
gap:20px;
margin:20px auto;
flex-wrap:wrap;
}

.slot-box{
border:2px dashed #bbb;
padding:10px;
cursor:pointer;
background:#fafafa;
width:200px;
text-align:center;
}

.slot-box img{
width:100%;
height:120px;
object-fit:cover;
}

.empty{
text-align:center;
color:#777;
}

/* SLIDESHOW */

.featured{
padding:3rem;
text-align:center;
}

.slideshow{
position:relative;
max-width:900px;
margin:auto;
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

.price{
font-size:1.4rem;
font-weight:bold;
margin:10px 0;
}

.description{
color:#555;
}

/* BUTTONS */

.save-btn{
margin-bottom:20px;
padding:13px 16px;
border:none;
background:purple;
color:white;
cursor:pointer;
font-weight:600;
border-radius:6px;
}

.save-btn:hover{
opacity:0.85;
}

.edit-btn{
padding:13px 16px;
margin-bottom: -20px;
border:none;
background:purple;
color:white;
cursor:pointer;
font-weight:600;
border-radius:6px;
}

.edit-btn:hover{
opacity:0.85;
}

/* NAV */

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
left:-120px;
}

.nav.right{
right:-120px;
}

.nav:hover{
background:purple;
color:white;
}

/* MODALS */

.modal{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.5);
display:flex;
justify-content:center;
align-items:center;
}

.modal-content{
background:white;
padding:2rem;
border-radius:12px;
width:420px;
display:flex;
flex-direction:column;
gap:1rem;
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

.modal-content input,
.modal-content textarea{
padding:0.6rem;
font-size:1rem;
border:1px solid #ccc;
border-radius:6px;
width:100%;
}

.modal-actions{
display:flex;
justify-content:space-between;
}

/* PRODUCT PICKER */

.modal-overlay{
position:fixed;
top:0;
left:0;
right:0;
bottom:0;
background:rgba(0,0,0,0.5);
display:flex;
align-items:center;
justify-content:center;
}

.modal{
background:white;
padding:30px;
max-width:900px;
width:90%;
max-height:80vh;
overflow:auto;
}

.picker-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:15px;
margin-top:20px;
}

.picker-card{
border:1px solid #ddd;
padding:10px;
cursor:pointer;
text-align:center;
}

.picker-card img{
width:100%;
height:120px;
object-fit:cover;
}

.close-btn{
margin-top:20px;
padding:8px 16px;
border:none;
background:#444;
color:white;
cursor:pointer;
}

</style>