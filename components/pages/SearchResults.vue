<template>
    <NavBar>
        <template #tenant>
            <NuxtImg :src="img(logo)" height="50"></NuxtImg>
        </template>
        <template #search>
            <SearchBar v-model="searchTerm" @search="search"></SearchBar>
        </template>
    </NavBar>
    <div v-if="searchTerm" class="search-result">
        <h2>Showing search results for '<em>{{ route.query.search }}</em>'</h2>
    </div>
    <div class="thumbnail" v-if="data">
        <client-only>
            <div v-for="item in data" :key="item.id" @click="goToTenant(item)" class="card">
                <div class="card-image-container">
                    <NuxtImg :src="img(item.thumbnail)" class="card-image" />
                    <div class="play-button-container">
                        <img src="@/assets/icons/play.svg" height="25" class="play-button" />
                    </div>
                </div>
                <div class="card-details">
                    <h3>{{ item.title }}</h3>
                    <p class="tenant-name">{{ item.tenant.name }}</p>
                    <p v-if="item?.event_type !== 'live'" class="time">{{ item?.date_created ? `Uploaded
                        ${dayjs(item.date_created).fromNow()}` : '' }}</p>
                    <div v-else style="display: flex; align-items: center; gap:5px">
                        <img src="@/assets/icons/live.svg" height="15" />
                        <p class="time" style="margin-bottom: 5px;">Live Now</p>
                    </div>
                    <!-- <p v-html="item.description"></p> -->
                </div>
                <div class="live-label" v-if="item?.event_type === 'live'">
                    <div class="live-dot" style=""></div>
                    <p class="live-text">Live</p>
                </div>
            </div>
        </client-only>
    </div>
     <div v-if="searchTerm && data?.length === 0" style=" height: 40vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <img src="@/assets/icons/no-result.svg" height="80"/>
        <h2 style="color:#2f2f31">No results found</h2>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
const searchTerm = ref('');
const { getItems } = useDirectusItems();
const router = useRouter();
const data: Ref<Record<string, any>[]> = ref([])
const route = useRoute()
const tenant = ref('')
const logo = ref('')
const tenantName = ref('')
onMounted(() => {
    tenant.value = sessionStorage.getItem('tenantId') || ''
    logo.value = sessionStorage.getItem('logo') || ''
    tenantName.value = route.query.tenant
    searchTerm.value = route.query.search || ''
    fetchData();
})
function search(){
    router.push({ path: '/results', query: { ...(searchTerm.value ? { search: searchTerm.value } : {}), tenant: tenantName.value } })
    // fetchData()
}
async function fetchData() {
    const res: Record<string, any>[] = await getItems({
        collection: 'videos',
        params: {
            fields: [
                '*',
                'tenant.id',
                'tenant.name',
                'tenant.slug',
                'tenant.logo'
            ],
            filter: {
                tenant: {
                    _eq: tenant.value
                }
            },
            ...(searchTerm.value ? { search: searchTerm.value } : {})
        }
    })
    res.sort((a, b) => {
        if (a.event_type === 'live' && b.event_type !== 'live') {
            return -1
        }
        if (a.event_type !== 'live' && b.event_type === 'live') {
            return 1
        }
        return 0
    })
    data.value = res
}
function goToTenant(item: any) {
    sessionStorage.setItem('tenantId', item.tenant.id)
    router.push({ path: item.tenant.slug, query: { video: item.id } });
}
watch(searchTerm, (newVal) => {
    if (newVal === '') {
        search()
    }
})
const { getThumbnail: img } = useDirectusFiles()
watch(
  () => route.query.search,
  async (newVal, oldVal) => {
    await fetchData()
  },
  { immediate: true }
)
</script>