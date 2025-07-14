<template>
  <NavBar>
    <template #search>
      <SearchBar v-model="searchTerm" @search="search"></SearchBar>
    </template>
  </NavBar>
  <div v-if="searchTerm && isSearch" class="search-result">
    <h2>Showing search results for '<em>{{ searchName }}</em>'</h2>
  </div>

  <div v-if="liveVideos?.length>0" class="live-container">
    <div class="live-videos">
      <h3>Live Videos</h3>
        <div class="show-all-btn">
          <img src="@/assets/icons/play.svg" height="10" class="play-button" /> 
          Show all
        </div>
    </div>
    <div v-if="liveVideos" class="thumbnail">
      <client-only>
        <div v-for="item in liveVideos" :key="item.id" class="card">
          <Thumbnail @go-to-tenant="goToTenant" :item="item" :image="img(item.thumbnail)" :title="item.title"
            :tenantName="item.tenant.name" :eventType="item?.event_type" :date="item?.date_created" />
        </div>
      </client-only>
    </div>
    <div class="divider"></div>
    <div class="arrow left">
      <img src="~/assets/icons/left-arrow.svg" class="icon"/>
    </div>
     <div class="arrow right">
      <img src="~/assets/icons/right-arrow.svg" class="icon"/>
    </div>
  </div>
  <div v-if="data" class="thumbnail">
    <client-only>
      <div v-for="item in data" :key="item.id" class="card">
        <Thumbnail @go-to-tenant="goToTenant" :item="item" :image="img(item.thumbnail)" :title="item.title"
          :tenantName="item.tenant.name" :eventType="item?.event_type" :date="item?.date_created" />
      </div>
    </client-only>
  </div>
  <NoResults :condition="!!searchTerm && data?.length === 0" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
const searchTerm = ref('');
const isSearch = ref(false);
const { getItems } = useDirectusItems();
const router = useRouter();

onMounted(() => {
  fetchData();
  fetchLiveData()
})
const limit = 5;
const page = ref(1);
const liveVideos: Ref<Record<string, any>[]> = ref([]);
async function fetchLiveData() {
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
      limit: limit,
      page: page.value,
      ...(searchTerm.value ? { search: searchTerm.value } : {}),
      filter: {
        event_type: {
          _eq: 'live',
        }
      }
    }
  })
  liveVideos.value = res
}
const { $directus } = useNuxtApp();
import { aggregate } from '@directus/sdk';
const agg = await $directus.request(
  aggregate("videos", {
    aggregate: { count: "*" },
    groupBy: ["event_type"],
  }))
const data: Ref<Record<string, any>[]> = ref([])
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
      ...(searchTerm.value ? { search: searchTerm.value } : {}),
      filter: {
        event_type: {
          _neq: 'live',
        }
      }
    }
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
  fetchLiveData();
}
watch(searchTerm, (newVal) => {
  if (newVal === '') {
    searchName.value = ''
    isSearch.value = false;
    fetchData();
    fetchLiveData();
  }
})

const { getThumbnail: img } = useDirectusFiles()
</script>