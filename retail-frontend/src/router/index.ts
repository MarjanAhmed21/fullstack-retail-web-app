import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"
import ProductsPage from "../pages/ProductsPage.vue"
import AdminProductsPage from "../pages/AdminProductsPage.vue"
import ProductDetails from "../pages/ProductDetails.vue"
import BasketPage from "../pages/BasketPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: ProductsPage
  },

  {
    path: "/products",
    name: "Products",
    component: ProductsPage
  },

  {
  path: "/admin/products",
  name: "AdminProducts",
  component: AdminProductsPage
},

{
  path: "/products/:id",
  name: "ProductDetails",
  component: ProductDetails
},

{
  path: "/basket",
  name: "Basket",
  component: BasketPage
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router