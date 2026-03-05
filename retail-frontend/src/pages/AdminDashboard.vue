<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const users = ref<any[]>([]);
const orders = ref<any[]>([]);

const fetchAdminData = async () => {
  const token = localStorage.getItem("token");

  try {
    const usersRes = await fetch("http://localhost:3000/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!usersRes.ok) {
      console.error("Users fetch failed:", await usersRes.text());
      return;
    }

    const ordersRes = await fetch("http://localhost:3000/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!ordersRes.ok) {
      console.error("Orders fetch failed:", await ordersRes.text());
      return;
    }

    users.value = await usersRes.json();
    orders.value = await ordersRes.json();

  } catch (error) {
    console.error("Admin fetch error:", error);
  }
};

onMounted(fetchAdminData);



router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path.startsWith("/admin")) {
    if (!token) {
      return next("/login");
    }
  }

  next();
});

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role");

  // If admin tries to access normal product pages
  if (role === "admin") {

    if (to.path === "/products") {
      return next("/admin/products");
    }

    if (to.path.startsWith("/products/")) {
      const id = to.params.id;
      return next(`/admin/products/${id}`);
    }
  }

  next();
});

</script>

<template>
  <div class="admin-container">
    <h1>Admin Dashboard</h1>

    <h2>Users</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
        </tr>
      </tbody>
    </table>

    <h2>Orders</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.customer_name }}</td>
          <td>{{ order.status }}</td>
          <td>£{{ order.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-container {
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background: #f4f4f4;
}
</style>