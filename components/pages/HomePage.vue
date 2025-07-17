<template>
  <NavBar>
    <template #search>
      <SearchBar v-model="searchTerm" @search="search"></SearchBar>
    </template>
  </NavBar>
  <SliderChip @chipSelected="viewData" />
  <div v-if="searchTerm && isSearch" class="search-result">
    <h2>Showing search results for '<em>{{ searchName }}</em>'</h2>
  </div>
  <div v-if="liveVideos?.length > 0" class="live-container">
    <div class="live-videos">
      <h3 class="container-name">Live Videos</h3>
      <div class="show-all-btn" v-if="liveCount > liveVideos?.length && !isShowAllLive" @click="showAllLive()">
        Show more
      </div>
      <div class="show-all-btn" v-else-if="isShowAllLive" @click="showAllLive()">
        Show less
      </div>
    </div>
    <div v-if="liveVideos" class="thumbnail">
      <client-only>
        <div v-for="item in liveVideos" :key="item.id" class="card">
          <Thumbnail @go-to-tenant="goToTenant" :item="item" :image="img(item.thumbnail)" :title="item.title"
            :tenantName="item.tenant.name" :eventType="item?.event_type" :date="item?.date_created" />
        </div>
      </client-only>
      <div v-if="offset > 0 && !isShowAllLive" class="arrow left" @click="prevPage()">
        <img src="~/assets/icons/left-arrow.svg" class="icon" />
      </div>
      <div class="arrow right" v-if="offset < (totalPages - 1) && !isShowAllLive" @click="nextPage()">
        <img src="~/assets/icons/right-arrow.svg" class="icon" />
      </div>
    </div>
    <div v-if="liveCount >= liveVideos?.length" class="divider"></div>
  </div>
  <div v-if="data?.length > 0" class="live-container other-videos-container">
    <div class="live-videos">
      <h3 class="container-name">Related Videos</h3>
    </div>
    <div class="thumbnail other-videos">
      <client-only>
        <div v-for="item in data" :key="item.id" class="card">
          <Thumbnail @go-to-tenant="goToTenant" :item="item" :image="img(item.thumbnail)" :title="item.title"
            :tenantName="item.tenant.name" :eventType="item?.event_type" :date="item?.date_created" />
        </div>
      </client-only>
    </div>
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
const windowWidth = ref(0)
const getItemsPerPage = computed(() => {
  if (windowWidth.value < 600) return 1
  else if (windowWidth.value < 960) return 2
  else return 6
})
const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  offset.value = 0;
  fetchLiveData()
}
onMounted(() => {
  window.addEventListener('resize', updateWidth)
  updateWidth()
  fetchData();
  fetchLiveData();
  count();
})
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
const limit = 6;
const offset = ref(0);
const page = computed(() => Math.floor(offset.value / getItemsPerPage.value) + 1)
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
      ...(!isShowAllLive.value ? { limit: getItemsPerPage.value } : {}),
      ...(!isShowAllLive.value ? { offset: offset.value } : {}),
      ...(searchTerm.value ? { search: searchTerm.value } : {}),
      filter: {
        event_type: {
          _eq: 'live',
        },
        ...(selectedTenant.value ? { tenant: { name: { _eq: selectedTenant.value } } } : {})
      }
    }
  })
  liveVideos.value = res
}
const { $directus } = useNuxtApp();
import { aggregate } from '@directus/sdk';
const liveCount = ref(0);
const otherVideoCount = ref(0);
const count = async () => {
  const res = await $directus.request(
    aggregate("videos", {
      aggregate: { count: "*" },
      groupBy: ["event_type"],
      ...(searchTerm.value || selectedTenant.value
        ? {
            query: {
              ...(searchTerm.value ? { search: searchTerm.value } : {}),
              ...(selectedTenant.value
                ? {
                    filter: {
                      tenant: {
                        name: { _eq: selectedTenant.value }
                      }
                    }
                  }
                : {})
            }
          }
        : {})
    })
  );

  const liveObj = res.find(item => item.event_type === "live");
  liveCount.value = liveObj ? Number(liveObj.count) : 0;
};
const totalPages = computed(() => {
  return Math.ceil(liveCount.value / getItemsPerPage.value);
});
const data: Ref<Record<string, any>[]> = ref([])
const selectedTenant = ref<string | null>(null)
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
        },
        ...(selectedTenant.value ? { tenant: { name: { _eq: selectedTenant.value } } } : {}),
      }
    }
  })
  data.value = res
}
function goToTenant(item: any) {
  sessionStorage.setItem('tenantId', item.tenant.id);
  router.push({ path: item.tenant.slug, query: { video: item.id } });
}
const searchName = ref('')
async function search() {
  searchName.value = searchTerm.value;
  isSearch.value = true;
  offset.value = 0;
  count();
  fetchData();
  fetchLiveData();
}
watch(searchTerm, (newVal) => {
  if (newVal === '') {
    searchName.value = '';
    isSearch.value = false;
    offset.value = 0;
    count();
    fetchData();
    fetchLiveData();
  }
})
function prevPage() {
  offset.value--;
  fetchLiveData();
}
function nextPage() {
  offset.value++;
  fetchLiveData();
}
const { getThumbnail: img } = useDirectusFiles();
const isShowAllLive = ref(false);
async function showAllLive() {
  isShowAllLive.value = !isShowAllLive.value;
  offset.value = 0;
  fetchLiveData();
}
function viewData(option: string) {
  console.log(option)
  switch (option) {
    case 'All': {
      selectedTenant.value = null
      offset.value = 0
      isShowAllLive.value = false
      fetchData()
      fetchLiveData()
    }
      break
    case 'Live':
      {
        selectedTenant.value = null
        offset.value = 0
        isShowAllLive.value = true
        data.value = []
        fetchLiveData()
      }
      break
    case 'Related':
      {
        selectedTenant.value = null
        offset.value = 0
        isShowAllLive.value = false
        liveVideos.value = [];
        fetchData()
      }
      break
    default: {
      selectedTenant.value = option
      offset.value = 0
      isShowAllLive.value = false
      fetchData()
      count();
      fetchLiveData()
    }
      break
  }
}
</script>