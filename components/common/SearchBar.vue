<template>
  <div class="searchbar">
    <input v-model="model" @keyup.enter="emits('search')" type="search" placeholder="Search videos..." />
    <div class="search-icon" @click="emits('search')">
      <Icon name="fa-solid:search" style="color: white;"></Icon>
    </div>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>()
const emits = defineEmits(['search'])
</script>

