<template>
  <NavBar>
    <template #search>
      <SearchBar v-model="searchTerm" @search="search"></SearchBar>
    </template>
  </NavBar>
  <div v-if="searchTerm && isSearch" class="search-result">
    <h2>Showing search results for '<em>{{ searchName }}</em>'</h2>
  </div>
  <div v-if="liveVideos?.length > 0" class="live-container">
    <div class="live-videos">
      <h3 class="container-name">Live Videos</h3>
      <div class="show-all-btn" v-if="liveCount > liveVideos?.length && !isShowAllLive" @click="showAllLive()">
        <img src="@/assets/icons/play.svg" height="10" class="play-button" />
        Show all
      </div>
      <div class="show-all-btn" v-else-if="isShowAllLive" @click="showAllLive()">
        <img src="@/assets/icons/play.svg" height="10" class="play-button" />
        Hide all
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
      <div class="arrow right" v-if="offset < (totalPages-1) && !isShowAllLive" @click="nextPage()">
        <img src="~/assets/icons/right-arrow.svg" class="icon" />
      </div>
    </div>
    <!-- <div class="divider"></div> -->
  </div>
  <div v-if="data?.length > 0" class="live-container other-videos-container">
    <div class="live-videos">
      <h3 class="container-name">Related Videos</h3>
      <!-- <div class="show-all-btn">
        <img src="@/assets/icons/play.svg" height="10" class="play-button" />
        Show all
      </div> -->
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

onMounted(() => {
  fetchData();
  fetchLiveData();
  count();
})
const limit = 5;
const offset = ref(0);
const page = computed(() => Math.floor(offset.value / limit) + 1)
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
      ...(!isShowAllLive.value ? { limit: limit } : {}),
      ...(!isShowAllLive.value ? { offset: offset.value} : {}),
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
const liveCount = ref(0);
const otherVideoCount = ref(0);
const count = async () => {
  const res = await $directus.request(
    aggregate("videos", {
      aggregate: { count: "*" },
      groupBy: ["event_type"],
    }
    ))
  const liveObj = res.find(item => item.event_type === "live");
  liveCount.value = liveObj ? liveObj.count : 0;
}
const totalPages = computed(() => {
  return Math.ceil(liveCount.value / limit);
});
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
  sessionStorage.setItem('tenantId', item.tenant.id);
  router.push({ path: item.tenant.slug, query: { video: item.id } });
}
const searchName = ref('')
async function search() {
  searchName.value = searchTerm.value;
  isSearch.value = true;
  offset.value = 0;
  const res = await getItems({
    collection: 'videos',
    params: {
      aggregate: {
        count: ['*']
      },
      ...(searchTerm.value ? { search: searchTerm.value } : {}),
      filter: {
        event_type: {
          _eq: 'live',
        }
      }
    }
  })
  liveCount.value = res[0].count
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
</script>