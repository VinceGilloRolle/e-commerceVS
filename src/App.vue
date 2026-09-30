<template>
  <ion-app @pointermove="onPointerMove">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';

const onPointerMove = (event) => {
  const root = document.documentElement;
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  root.style.setProperty('--pointer-x', `${x}%`);
  root.style.setProperty('--pointer-y', `${y}%`);
};
</script>
