<template>
  <div v-if="condition" class="search-results">
    <img src="@/assets/icons/no-result.svg" height="80" />
    <h2 style="color:#2f2f31">No results found</h2>
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
