<template>
  <div v-if="condition" class="search-results">
    <img src="@/assets/icons/no-result.svg"/>
    <h2>No results found</h2>
  </div>
</template>
<script setup lang="ts">
defineProps({
  condition: {
    type: Boolean,
    required: true,
    default: false
  }
})
</script>
