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
    <div class="thumbnail search-container" v-if="data">
        <client-only>
            <div v-for="item in data" :key="item.id" @click="goToTenant(item)" class="card">
                <Thumbnail 
                  @go-to-tenant="goToTenant" 
                  :image="img(item.thumbnail)" 
                  :title="item.title"  
                  :item="item"     
                  :tenantName="item.tenant.name"
                  :eventType="item?.event_type" 
                  :date="item?.date_created"
                />
            </div>
        </client-only>
    </div>
    <NoResults :condition="!!searchTerm && data?.length === 0"/>
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
    tenantName.value = route.query.tenant as string ||''
    searchTerm.value = route.query.search as string || ''
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