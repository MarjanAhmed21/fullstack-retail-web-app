<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const name = ref("");
const email = ref("");
const password = ref("");

const register = async () => {
  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  // Automatically log in after signup
  const loginRes = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok) {
    alert("Login failed after signup");
    return;
  }

  // Save token
  localStorage.setItem("token", loginData.token);

  window.dispatchEvent(new Event("storage"));

  // 🔁 Redirect back to previous page or products
  const redirectPath = route.query.redirect as string || "/products";
  router.push(redirectPath);
};
</script>

<template>
  <div class="login-page">
    <h1>Create Account</h1>

    <div class="form-group">
      <label>Full Name:</label>
      <input v-model="name" type="text" placeholder="Enter your full name" />
    </div>

    <div class="form-group">
      <label>Email:</label>
      <input v-model="email" type="email" placeholder="Enter your email" />
    </div>

    <div class="form-group">
      <label>Password:</label>
      <input v-model="password" type="password" placeholder="Enter your password" />
    </div>

    <button @click="register">
      Create Account
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

button:hover {
  opacity: 0.85;
}
</style>