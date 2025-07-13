<template>
    <div class="play-button-container" @click="emits('play')">
      <img src="@/assets/icons/play.svg" height="25" class="play-button" />
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits([
  'play'
])
</script>