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

/* =========================
   NAVIGATION
========================= */

const homeRoute = computed(() => {
  return role.value === "admin" ? "/admin/products" : "/products";
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

    <!-- LOGO -->
    <div class="nav-left">
      <router-link :to="homeRoute" class="logo">
        RetailStore
      </router-link>
    </div>

    <!-- SEARCH -->
    <div class="nav-center">
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

      <router-link v-if="role === 'admin'" to="/admin" class="admin-link">
  Admin Dashboard
</router-link>

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
}

.nav-center {
  position: relative;
}

.nav-center input {
  max-width: 500px;
  min-width: 250px;
  padding: 0.7rem 1rem;
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.nav-center input:focus {
  outline: none;
  border-color: purple;
  box-shadow: 0 0 5px rgba(128, 0, 128, 0.5);
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

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  font-size: 1.4rem;
  font-weight: bold;
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