import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import HomePage from "../pages/HomePage.vue"
import AdminHomePage from "../pages/AdminHomePage.vue"
import AdminDashboard from "../pages/AdminDashboard.vue"
import SignUp from "../pages/SignUp.vue"
import LoginPage from "../pages/LoginPage.vue"
import ProductsPage from "../pages/ProductsPage.vue"
import AdminProductsPage from "../pages/AdminProductsPage.vue"
import ProductDetails from "../pages/ProductDetails.vue"
import AdminProductDetails from "../pages/AdminProductDetails.vue"
import BasketPage from "../pages/BasketPage.vue"
import ContactPage from "../pages/ContactPage.vue"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomePage
  },

  {
    path: "/home",
    name: "HomePage",
    component: HomePage
  },
  
  {
    path: "/admin/home",
    name: "AdminHome",
    component: AdminHomePage,
    meta: { requiresAdmin: true }
  },

  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },

  {
    path: "/login",
    name: "Login",
    component: LoginPage
  },

  
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp
  },

  {
    path: "/products",
    name: "Products",
    component: ProductsPage
  },

  {
  path: "/admin/products",
  name: "AdminProducts",
  component: AdminProductsPage,
  meta: { requiresAdmin: true }
},

{
  path: "/products/:id",
  name: "ProductDetails",
  component: ProductDetails
},

{
  path: "/admin/products/:id",
  name: "AdminProductDetails",
  component: AdminProductDetails,
  meta: { requiresAdmin: true }
},

{
  path: "/basket",
  name: "Basket",
  component: BasketPage
},

{
  path: "/contact",
  name: "Contact",
  component: ContactPage
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAdmin) {

    if (!token) {
      return next({
        path: "/login",
        query: { redirect: to.fullPath }
      });
    }

    if (role !== "admin") {
      return next("/products");
    }

  }

  next();
});

export default router