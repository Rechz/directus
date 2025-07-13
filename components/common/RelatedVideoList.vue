<!-- <template>
  <div class="image-container">
    <NuxtImg :src="img(item.thumbnail)" class="image" />
    <div class="live-label" v-if="item?.event_type === 'live'">
      <div class="live-dot"></div>
      <p class="live-text">Live</p>
    </div>
    <div class="play-button-container" @click="isClicked = true">
      <img src="@/assets/icons/play.svg" height="25" class="play-button" />
    </div>
  </div>
  <div class="details">
    <div>
      <h4>{{ item.title }}</h4>
      <div v-html="item.description" class="html-description"></div>
    </div>
    <p v-if="item?.event_type !== 'live'" class="time">{{ item?.date_created ? `Uploaded
      ${dayjs(item.date_created).fromNow()}` : '' }}</p>
    <div v-else style="" class="live-now-text">
      <img src="@/assets/icons/live.svg" height="15" />
      <p class="time">Live Now</p>
    </div>
  </div>
</template> -->