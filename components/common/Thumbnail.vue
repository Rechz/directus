<template>
    <div class="card-image-container" @click="emits('goToTenant',item)">
        <NuxtImg :src="image" class="card-image" />
        <!-- <div class="play-button-container" @click="emits('goToTenant',item)">
            <img src="@/assets/icons/play.svg" height="25" class="play-button" />
        </div> -->
        <PlayButton/>
    </div>
    <div class="card-details">
        <h3 class="title">{{ title }}</h3>
        <p class="tenant-name">{{ tenantName }}</p>
        <p v-if="eventType !== 'live'" class="time">{{ date ? `Uploaded
            ${dayjs(date).fromNow() }` : '' }}</p>
        <div v-else style="display: flex; align-items: center; gap:5px">
            <img src="@/assets/icons/live.svg" height="15" />
            <p class="time" style="margin-bottom: 5px;">Live Now</p>
        </div>
    </div>
    <div class="live-label" v-if="eventType === 'live'">
        <div class="live-dot" style=""></div>
        <p class="live-text">Live</p>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
defineProps({
    item: Object,
    title: String,
    tenantName: String,
    date: String,
    eventType: String,
    image: String
})
const emits = defineEmits([
    'goToTenant'
])

</script>