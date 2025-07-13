<template>
    <NavBar>
        <!-- <template #tenant>
            <NuxtImg height="25"></NuxtImg>
        </template> -->
        <template #search>
            <SearchBar v-model="searchTerm" @search="search"></SearchBar>
        </template>
    </NavBar>
    <div v-if="searchTerm && isSearch" class="search-result">
        <h2>Showing search results for '<em>{{ searchName }}</em>'</h2>
    </div>
    <div v-if="data" class="thumbnail">
        <client-only>
            <div v-for="item in data" :key="item.id" class="card">
                <Thumbnail 
                  @go-to-tenant="goToTenant" 
                  :item="item" 
                  :image="img(item.thumbnail)" 
                  :title="item.title"       
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
const isSearch = ref(false);
const { getItems } = useDirectusItems();
const router = useRouter();
const data: Ref<Record<string, any>[]> = ref([])
onMounted(() => {
    fetchData();
})
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
const searchName = ref('')
function search() {
    searchName.value = searchTerm.value
    isSearch.value = true;
    fetchData();
}
watch(searchTerm, (newVal) => {
    if (newVal === '') {
        searchName.value = ''
        isSearch.value = false;
        fetchData()
    }
})

const { getThumbnail: img } = useDirectusFiles()
</script>