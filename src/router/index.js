import { createRouter, createWebHistory } from '@ionic/vue-router';
import { getUser, isLoggedIn } from '../services/api';

import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Home from '../pages/Home.vue';
import ProductDetails from '../pages/ProductDetails.vue';
import Cart from '../pages/Cart.vue';
import Checkout from '../pages/Checkout.vue';
import Orders from '../pages/Orders.vue';
import Profile from '../pages/Profile.vue';
import Store from '../pages/Store.vue';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/product/:id',
    name: 'ProductDetails',
    component: ProductDetails,
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/store',
    name: 'Store',
    component: Store,
    meta: { requiresAuth: true, role: 'store-owner' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Protect routes that need login, and keep each role on its own pages
router.beforeEach((to, from, next) => {
  const user = getUser();
  const loggedIn = isLoggedIn();

  if (to.meta.requiresAuth && !loggedIn) {
    next('/login');
    return;
  }

  if (to.meta.role && user?.role !== to.meta.role) {
    next(user?.role === 'store-owner' ? '/store' : '/home');
    return;
  }

  next();
});

export default router;
