import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import ProductsPage from "../pages/ProductsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Products",
    component: ProductsPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
