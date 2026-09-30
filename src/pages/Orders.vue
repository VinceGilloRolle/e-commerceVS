<template>
  <ion-page>
    <Navbar title="My Orders" :show-back="true" />

    <ion-content class="page-shell">
      <div v-if="loading" class="empty-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading orders...</p>
      </div>

      <div v-else-if="error" class="empty-state">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <ion-button @click="fetchOrders">Retry</ion-button>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <h2>No orders yet</h2>
        <p>Your order history will appear here.</p>
        <ion-button router-link="/home">Start Shopping</ion-button>
      </div>

      <div v-else class="orders-shell rise-in">
        <header>
          <p class="eyebrow">History</p>
          <h1>My orders</h1>
        </header>

        <article class="order-block" v-for="order in orders" :key="order.id">
          <div class="order-top">
            <div>
              <p class="meta">Order #{{ order.id }} · {{ formatDate(order.created_at) }}</p>
            </div>
            <strong class="price-text">₱{{ formatPrice(order.total) }}</strong>
          </div>

          <div class="order-items">
            <div class="order-item" v-for="item in order.items" :key="item.id">
              <img :src="item.image_url" :alt="item.product_name" />
              <div>
                <h3>{{ item.product_name }}</h3>
                <p>Qty {{ item.quantity }} × ₱{{ formatPrice(item.price) }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonSpinner } from '@ionic/vue';
import Navbar from '../components/Navbar.vue';
import { getUserOrders, getUser } from '../services/api';

const orders = ref([]);
const loading = ref(true);
const error = ref('');

const formatPrice = (price) => parseFloat(price).toFixed(2);

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fetchOrders = async () => {
  loading.value = true;
  error.value = '';

  const user = getUser();
  if (!user) {
    error.value = 'Please log in to view orders.';
    loading.value = false;
    return;
  }

  try {
    const res = await getUserOrders(user.id);
    orders.value = res.data;
  } catch (err) {
    error.value =
      err.response?.data?.message || 'Could not load orders.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.orders-shell {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #ff4d8d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 1.5rem;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}

.order-block {
  padding: 1.1rem 0;
  border-top: 1px solid #f3d6e3;
}

.order-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.meta {
  margin: 0;
  color: #5c5c5c;
  font-size: 0.9rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.order-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.order-item img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  background: #fff0f5;
}

.order-item h3 {
  margin: 0 0 0.15rem;
  font-size: 0.95rem;
}

.order-item p {
  margin: 0;
  color: #5c5c5c;
  font-size: 0.85rem;
}
</style>
