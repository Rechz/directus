<template>
    <div class="navbar">
        <div class="navbar-elements">
            <div class="navbar-elements-left">
                <div class="main-logo" @click="$router.push('/')">
                    <img :src="img(brand?.logo)" height="25" />
                    <h2>{{brand?.name}}</h2>
                </div>
                <slot name="tenant"></slot>
            </div>
            <slot name="search"></slot>
            <!-- <div class="navbar-elements-right">
                <Icon name="mdi-light:bell" style="color: white" size="1.5rem" />
                <Icon name="mdi-light:account" style="color: white" size="1.5rem" />
            </div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
const { getItems } = useDirectusItems();
const { getThumbnail: img } = useDirectusFiles();
const brand = ref({
    name: '',
    logo:''
})
const fetchBrand = async () => {
    try {
       const res:Record<string,any> = await getItems({
            collection: 'branding'
       })
        brand.value.name = res.brand_name
        brand.value.logo=res.brand_logo
    }catch(e){}
}
onMounted(() => {
    fetchBrand();
})
</script>