<template>
  <NavBar>
    <template #tenant>
      <NuxtImg :src="img(selectedVideo?.tenant?.logo)" class="tenant-logo"></NuxtImg>
    </template>
    <template #search>
      <SearchBar v-model="searchTerm" @search="goToSearchResults()"></SearchBar>
    </template>
  </NavBar>
  <div class="tenant-container">
    <div class="main-video">
      <div class="image-video" v-if=!isClicked>
        <NuxtImg :src="img(selectedVideo.thumbnail)" class="thumbnail-image" @click="isClicked = true" />
        <div class="play-button-container" @click="isClicked = true">
          <img src="@/assets/icons/play.svg" class="play-button" />
        </div>
      </div>
      <div class="image-video" v-else>
        <iframe :src="embedUrl(selectedVideo.video_url)" class="thumbnail-video" frameborder="0"
          allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
      <div class="live-label" v-if="selectedVideo?.event_type === 'live'">
        <div class="live-dot" style=""></div>
        <p class="live-text">Live</p>
      </div>
    </div>
    <div class="main-video-description-container">
      <div class="main-video-description">
        <h2>{{ selectedVideo.title }}</h2>
        <p v-if="selectedVideo?.event_type !== 'live'" class="time">{{ selectedVideo?.date_created ? `Uploaded
          ${dayjs(selectedVideo.date_created).fromNow()}` : '' }}
        </p>
        <div v-else style="display: flex; align-items: center; gap:5px">
          <img src="@/assets/icons/live.svg" height="15" />
          <p class="time" style="margin-bottom: .7em;">Live Now</p>
        </div>
        <div class="desc" ref="descRef" v-html="selectedVideo?.description"></div>
        <!-- <button v-if="isOverflow" @click="toggle" class="read-more-btn">
          {{ isExpanded ? "Show less" : "Read more" }}
        </button> -->
      </div>
    </div>
  </div>
  <div class="related-videos-container">
    <h2>Related Videos</h2>
    <div v-if="relatedVideos?.length > 0" class="video-list-container">
      <div class="related-video" v-for="item in relatedVideos" :key="item.id" @click="changeVideo(item)">
        <div class="image-container">
          <NuxtImg :src="img(item.thumbnail)" class="image" />
          <div class="live-label" v-if="item?.event_type === 'live'">
            <div class="live-dot" style=""></div>
            <p class="live-text">Live</p>
          </div>
          <div class="play-button-container" @click="isClicked = true">
            <img src="@/assets/icons/play.svg" height="25" class="play-button" />
          </div>
        </div>
        <div class="details">
          <div>
            <h4 class="video-title">{{ item.title }}</h4>
            <div v-html="item.description" class="html-description"></div>
          </div>
          <p v-if="item?.event_type !== 'live'" class="time">{{ item?.date_created ? `Uploaded
            ${dayjs(item.date_created).fromNow()}` : '' }}</p>
          <div v-else style="" class="live-now-text">
            <img src="@/assets/icons/live.svg" height="15" />
            <p class="time">Live Now</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-videos">
      <p>Currently no related videos available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
function getSubtitle() {
  const subtitleWrapper = document.getElementById("subtitle-box-wrapper");
  const subtitleBox = document.getElementById("subtitle-box");
  let autoScroll = true;
  subtitleWrapper.addEventListener('mouseenter', () => {
    autoScroll = false;
  });
  subtitleWrapper.addEventListener('mouseleave', () => {
    autoScroll = true;
    scrollToBottom();
  });
  function scrollToBottom() {
    subtitleWrapper.scrollTop = subtitleWrapper.scrollHeight;
  }
  window.addEventListener("message", function (event) {
    console.log('origin', event.origin)
    const allowedOrigins = [
      "https://webcastalpha.vconsol.com"
    ];
    if (!allowedOrigins.includes(event.origin)) {
      console.log('return')
      return;
    }
    const data = event.data;
    if (data && data.caption && data.caption.text && data.type === "video-caption") {
      const captionText = data.caption.text;
      if (captionText && typeof captionText === 'string') {
        const p = document.createElement("p");
        p.textContent = captionText;
        subtitleBox.appendChild(p);
        if (autoScroll) {
          scrollToBottom();
        }
      }
    }
  });
}
const router = useRouter()
function changeVideo(item: any) {
  sessionStorage.setItem('tenantId', item.tenant.id)
  router.push({ path: item.tenant.slug, query: { video: item.id } });
}
const searchTerm = ref('')
function goToSearchResults() {
  router.push({ path: '/results', query: { search: searchTerm.value, tenant: tenantDetails.value[0].name } })
}
function embedUrl(url: string) {
  if (url.includes('youtu.be')) {
    const id = url.split('/').pop()?.split('?')[0]
    return `https://www.youtube.com/embed/${id}?autoplay=1`
  }
  return url
}
const descRef = ref<HTMLElement | null>(null);
const isClicked = ref(false)
const { getThumbnail: img } = useDirectusFiles()
const tenant = ref<string>('')
const { getItems } = useDirectusItems();
const relatedVideos = ref<Record<string, any>>({})
const route = useRoute()
const selectedVideo = ref<any>({})
const tenantDetails = ref<Record<string, any>>({})
const isOverflow = ref(false);
const showSubtitle = ref(false);
function checkOverflow() {
  const el = descRef.value
  if (!el) return
  requestAnimationFrame(() => {
    isOverflow.value = el.scrollHeight > el.clientHeight
  })
}
watch(() => selectedVideo.value.description, () => {
  nextTick(() => {
    checkOverflow()
  })
})
const getTenant = async () => {
  const res = await getItems({
    collection: 'tenants',
    params: {
      filter: {
        id: {
          _eq: tenant.value
        }
      },
      fields: ['name', 'logo']
    }
  })
  return res
}
const getRelatedVideos = async () => {
  const res = await getItems({
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
        },
        id: {
          _neq: route.query.video
        }
      }
    }
  })
  return res;
}
onMounted(async () => {
  tenant.value = sessionStorage.getItem('tenantId') || ''
  if (tenant.value) {
    tenantDetails.value = await getTenant();
    sessionStorage.setItem('logo', tenantDetails.value[0].logo)
    relatedVideos.value = await getRelatedVideos();
    relatedVideos.value.sort((a: any, b: any) => {
      if (a.event_type === 'live' && b.event_type !== 'live') {
        return -1
      }
      if (a.event_type !== 'live' && b.event_type === 'live') {
        return 1
      }
      return 0
    })
  }
  const res = await getItems({
    collection: 'videos',
    params: {
      filter: {
        id: {
          _eq: route.query.video
        }
      },
      fields: [
        '*',
        'tenant.id',
        'tenant.name',
        'tenant.slug',
        'tenant.logo'
      ]
    }
  })
  if (res) {
    selectedVideo.value = res[0]
    const el = descRef.value;
  }
  getSubtitle()
})
watch(
  () => route.query.video,
  async (newVideoId) => {
    if (newVideoId) {
      // fetch new video details
      const res = await getItems({
        collection: 'videos',
        params: {
          filter: {
            id: {
              _eq: newVideoId
            }
          },
          fields: [
            '*',
            'tenant.id',
            'tenant.name',
            'tenant.slug',
            'tenant.logo'
          ]
        }
      })
      if (res && res.length > 0) {
        selectedVideo.value = res[0]
      }

      // update related videos
      relatedVideos.value = await getItems({
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
            },
            id: {
              _neq: newVideoId
            }
          }
        }
      })
      relatedVideos.value.sort((a: any, b: any) => {
        if (a.event_type === 'live' && b.event_type !== 'live') {
          return -1
        }
        if (a.event_type !== 'live' && b.event_type === 'live') {
          return 1
        }
        return 0
      })
    }
  },
  { immediate: true }
)
</script>