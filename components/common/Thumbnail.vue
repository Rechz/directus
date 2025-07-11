<template>
    
            <NuxtImg :src="image" style="height: 200px; width: 260px;"/>
            <h4>{{ title }}</h4>
            <p v-html="description"></p>

</template>

<script setup lang="ts">
const props = defineProps({
    title: String,
    image: String,
    description: String,
})
const emits = defineEmits([
    'goTo'
])

</script>