<template>
  <article
    class="product-tile"
    @click="$emit('click', product)"
    @pointermove="onTilt"
    @pointerleave="resetTilt"
  >
    <div class="media" :style="tiltStyle">
      <div class="shine" :style="shineStyle"></div>
      <img :src="product.image_url" :alt="product.name" loading="lazy" />
      <span class="stock" :class="{ out: product.stock <= 0 }">
        {{ product.stock > 0 ? `${product.stock} left` : 'Sold out' }}
      </span>
      <span class="peek">View</span>
    </div>
    <div class="meta">
      <p class="category">{{ product.category || 'Catalog' }}</p>
      <h3>{{ product.name }}</h3>
      <div class="meta-row">
        <p class="price-text">₱{{ formatPrice(product.price) }}</p>
        <span class="line"></span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  product: { type: Object, required: true },
});

defineEmits(['click']);

const tiltStyle = ref({});
const shineStyle = ref({});

const formatPrice = (price) => parseFloat(price).toFixed(2);

const onTilt = (event) => {
  const card = event.currentTarget.querySelector('.media');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * 10;
  const rotateX = (0.5 - y) * 10;
  tiltStyle.value = {
    transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
  };
  shineStyle.value = {
    opacity: 0.55,
    background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.55), transparent 45%)`,
  };
};

const resetTilt = () => {
  tiltStyle.value = { transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' };
  shineStyle.value = { opacity: 0 };
};
</script>

<style scoped>
.product-tile {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  text-align: left;
  animation: catalog-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1.08;
  background:
    linear-gradient(155deg, #fff0f5 0%, #ffffff 48%, #f2f2f2 100%);
  border: 1px solid rgba(243, 214, 227, 0.9);
  transform-style: preserve-3d;
  transition: transform 0.25s ease-out, box-shadow 0.35s ease;
  will-change: transform;
}

.product-tile:hover .media {
  box-shadow: 0 24px 50px rgba(10, 10, 10, 0.14);
}

.shine {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  mix-blend-mode: soft-light;
}

.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-tile:hover .media img {
  transform: scale(1.08);
}

.stock {
  position: absolute;
  left: 0.75rem;
  bottom: 0.75rem;
  z-index: 3;
  padding: 0.32rem 0.7rem;
  background: rgba(5, 5, 5, 0.82);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.stock.out {
  background: rgba(212, 20, 106, 0.92);
}

.peek {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 3;
  padding: 0.3rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(5, 5, 5, 0.35);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  backdrop-filter: blur(8px);
}

.product-tile:hover .peek {
  opacity: 1;
  transform: translateY(0);
}

.meta {
  padding: 0 0.1rem 0.35rem;
}

.category {
  margin: 0 0 0.28rem;
  color: #8a8a8a;
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h3 {
  margin: 0 0 0.55rem;
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #0f0f0f;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price-text {
  margin: 0;
}

.line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #ff4d8d, transparent);
  transform-origin: left;
  transform: scaleX(0.35);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-tile:hover .line {
  transform: scaleX(1);
}

@media (hover: none) {
  .peek {
    display: none;
  }
}
</style>
