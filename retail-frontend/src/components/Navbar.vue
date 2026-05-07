<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useBasketStore } from "../stores/basket";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();

/* =========================
   AUTH STATE
========================= */

const token = ref<string | null>(null);
const userName = ref<string | null>(null);
const role = ref<string | null>(null);

const isLoggedIn = computed(() => !!token.value);

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const updateAuth = () => {
  const storedToken = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  token.value = storedToken;
  role.value = storedRole;

  if (storedToken) {
    const decoded = decodeToken(storedToken);
    userName.value = decoded?.name || "Account";
  } else {
    userName.value = null;
  }
};

onMounted(() => {
  updateAuth();
  window.addEventListener("storage", updateAuth);
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", updateAuth);
});

/* =========================
   ACCOUNT DROPDOWN
========================= */

const showAccountMenu = ref(false);
const accountContainer = ref<HTMLElement | null>(null);

const toggleAccountMenu = () => {
  showAccountMenu.value = !showAccountMenu.value;
};

const logout = () => {
  localStorage.removeItem("token");
  updateAuth();
  showAccountMenu.value = false;
  router.push("/products");
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    accountContainer.value &&
    !accountContainer.value.contains(event.target as Node)
  ) {
    showAccountMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});



const showSidebar = ref(false)

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebar = () => {
  showSidebar.value = false
}

/* =========================
   NAVIGATION
========================= */

const homeRoute = computed(() => {
  return role.value === "admin" ? "/admin/home" : "/home";
});

const productsRoute = computed(() => {
  return role.value === "admin"
    ? "/admin/products"
    : "/products";
});

/* =========================
   BASKET
========================= */

const basket = useBasketStore();
const { itemCount } = storeToRefs(basket);

const goToBasket = () => {
  if (role.value === "admin") {
    router.push("/admin/products"); // or an admin-specific basket page if exists
  } else {
    router.push("/basket");
  }
};

/* =========================
   SEARCH
========================= */

const searchTerm = ref("");
const products = ref<Array<{ id: number; name: string }>>([]);
const showSuggestions = ref(false);

const hideSuggestions = () => {
  setTimeout(() => (showSuggestions.value = false), 200);
};

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:3000/products");
    products.value = await res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
  }
});

const filteredProducts = computed(() => {
  if (!searchTerm.value) return [];
  return products.value.filter(p =>
    p.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const goToProduct = (id: number) => {
  searchTerm.value = "";
  showSuggestions.value = false;

  {
    router.push(`/products/${id}`);
  }
};
</script>

<template>
  <nav class="navbar">


  <!-- SIDEBAR OVERLAY -->
<div v-if="showSidebar" class="overlay" @click="closeSidebar"></div>

<!-- SIDEBAR MENU -->
<div :class="['sidebar', { open: showSidebar }]">

  <div class="sidebar-header">
    <span @click="closeSidebar" class="close-btn">✕</span>
  </div>

  <div class="sidebar-links">

    <router-link :to="homeRoute" @click="closeSidebar">
      Home
    </router-link>

    <router-link :to="productsRoute" @click="closeSidebar">
      Products
    </router-link>

    <router-link to="/contact" @click="closeSidebar">
      Contact
    </router-link>

    <router-link v-if="role === 'admin'" to="/admin" @click="closeSidebar">
      Admin Dashboard
    </router-link>

  </div>

</div>

  <!-- ROW 1 -->
  <div class="nav-top">

    <!-- HAMBURGER -->
    <div class="menu-icon" @click="toggleSidebar">
      ☰
    </div>

    <!-- LOGO -->
    <router-link :to="homeRoute" class="logo">
      Marjan Threads
    </router-link>

    <!-- RIGHT SIDE -->
    <div class="nav-right">

      <!-- ACCOUNT -->
      <div class="account-container" ref="accountContainer">

        <div class="account-trigger" @click="toggleAccountMenu">
          <span v-if="isLoggedIn">
            {{ userName }}
          </span>
          <span v-else>
            👤
          </span>
        </div>

        <div v-if="showAccountMenu" class="account-dropdown">

          <template v-if="!isLoggedIn">
            <router-link
              :to="{ path: '/login', query: { redirect: route.fullPath }}"
              class="dropdown-item"
              @click="showAccountMenu = false"
            >
              Sign In
            </router-link>

            <router-link
              :to="{ path: '/signup', query: { redirect: route.fullPath }}"
              class="dropdown-item"
              @click="showAccountMenu = false"
            >
              Create Account
            </router-link>
          </template>

          <template v-else>
            <div class="dropdown-item" @click="logout">
              Sign Out
            </div>
          </template>

        </div>
      </div>

      <!-- WISHLIST -->
      <span v-if="role !== 'admin'" class="icon">❤️</span>

      <!-- BASKET -->
      <div v-if="role !== 'admin'" class="basket-icon" @click="goToBasket">
        🛒
        <span v-if="itemCount > 0" class="basket-count">
          {{ itemCount }}
        </span>
      </div>

    </div>
  </div>

  <!-- ROW 2 -->
  <div class="nav-search">

    <input
      type="text"
      placeholder="Search for products..."
      v-model="searchTerm"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
    />

    <ul
      v-if="showSuggestions && filteredProducts.length"
      class="suggestions"
    >
      <li
        v-for="product in filteredProducts"
        :key="product.id"
        @click="goToProduct(product.id)"
      >
        {{ product.name }}
      </li>
    </ul>

  </div>

</nav>
</template>

<style scoped>

.navbar{
  display:flex;
  flex-direction:column;
  border-bottom:1px solid #ddd;
  background:white;
}

/* TOP ROW */

.nav-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:1rem 2rem;
  position:relative;
}

.menu-icon{
  font-size:1.5rem;
  cursor:pointer;
}

/* CENTER LOGO */

.logo{
  font-size:1.5rem;
  font-weight:bold;
  text-decoration:none;
  color:black;

  position:absolute;
  left:50%;
  transform:translateX(-50%);
}

/* RIGHT SIDE */

.nav-right{
  display:flex;
  align-items:center;
  gap:1.2rem;
}

/* SEARCH ROW */

.nav-search{
  position:relative;
  padding:0.7rem 2rem 1rem 2rem;
}

.nav-search input{
  width:100%;
  padding:0.8rem 1rem;
  border-radius:25px;
  border:1px solid #ccc;
  font-size:1rem;
}

.nav-search input:focus{
  outline:none;
  border-color:purple;
  box-shadow:0 0 5px rgba(128,0,128,0.5);
}

.nav-left {
  flex: 1;
}

.nav-center {
  position: relative;
}


/* OVERLAY */

.overlay{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.4);
  z-index:90;
}

/* SIDEBAR */

.sidebar{
  position:fixed;
  top:0;
  left:0;
  width:280px;
  height:100vh;
  background:white;
  box-shadow:2px 0 10px rgba(0,0,0,0.2);
  transform:translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index:100;
  padding:1.5rem;
}

.sidebar.open{
  transform:translateX(0);
}

/* HEADER */

.sidebar-header{
  display:flex;
  justify-content:flex-end;
}

.close-btn{
  font-size:1.3rem;
  cursor:pointer;
}

/* LINKS */

.sidebar-links{
  margin-top:2rem;
  display:flex;
  flex-direction:column;
  gap:1.2rem;
}

.sidebar-links a{
  text-decoration:none;
  font-size:1.1rem;
  color:black;
  font-weight:500;
}

.sidebar-links a:hover{
  color:purple;
}

.suggestions {
  position: absolute;
  top: 100%;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 4px;
  list-style: none;
  padding: 0;
}

.suggestions li {
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.suggestions li:hover {
  background: purple;
  color: white;
}


.account-container {
  position: relative;
}

.account-trigger {
  cursor: pointer;
  font-weight: 600;
  font-family: Inter, sans-serif;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.2s ease;
  color: blue;
  -webkit-text-stroke: 0.4px black;
  text-decoration: underline;
}

.account-trigger:hover {
  background: #f3f3f3;
}

.account-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 180px;
  z-index: 100;
}

.dropdown-item {
  display: block;
  padding: 0.8rem 1rem;
  cursor: pointer;
  text-decoration: none;
  color: black;
}

.dropdown-item:hover {
  background: purple;
  color: white;
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