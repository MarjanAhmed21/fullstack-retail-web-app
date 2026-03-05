<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const loading = ref(false);

const login = async () => {
  if (!email.value || !password.value) return alert("Enter email and password");

  loading.value = true;

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      loading.value = false;
      return;
    }

  const tokenData = data.token;
localStorage.setItem("token", tokenData);

// Decode JWT to get role if data.role missing
let role = data.role;
if (!role) {
  const decoded = JSON.parse(atob(tokenData.split(".")[1]));
  role = decoded.role;
}

localStorage.setItem("role", role);
localStorage.setItem("name", data.name);

const redirectPath = (route.query.redirect as string) || (role === "admin" ? "/admin" : "/products");
router.push(redirectPath);

    alert("Login successful!");
    
  } catch (err) {
    console.error(err);
    alert("Server error");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <h1>Customer Login</h1>

    <div class="form-group">
      <label>Email:</label>
      <input v-model="email" type="email" placeholder="Enter your email" />
    </div>

    <div class="form-group">
      <label>Password:</label>
      <input v-model="password" type="password" placeholder="Enter your password" />
    </div>

    <button @click="login" :disabled="loading">
      {{ loading ? "Logging in..." : "Login" }}
    </button>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

input {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

button {
  padding: 0.8rem 1.5rem;
  background: purple;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>