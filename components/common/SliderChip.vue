<template>
    <div class="slider-wrapper">
        <div v-for="opt in options" :key="opt">
            <p class="chip" :class="{ 'active': selectedOpt === opt }" @click="selectChip(opt)">
                {{ opt }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
const { getItems } = useDirectusItems();
const selectedOpt = ref('All')
const options = ref(['All', 'Live', 'Related'])
const tenants = ref([])
const getTenant = async () => {
    tenants.value = await getItems({
        collection: 'tenants',
        params: {
            fields: ['name', 'id']
        }
    })
    if (tenants.value && Array.isArray(tenants.value)) {
        const tenantNames = tenants.value.map((tenant: any) => tenant.name)
        options.value.push(...tenantNames)
    }
}
const emit = defineEmits(['chipSelected'])
const selectChip = (opt: string) => {
    selectedOpt.value = opt
    console.log(opt)
    emit('chipSelected', opt)
}
onMounted(() => {
    getTenant()
})
</script>

<style scoped lang="scss">
.slider-wrapper {
    padding: 0 3em;
    display: flex;
    // width: 100%; 
    // overflow-x: auto; 
    gap: 0.5em;

    .chip {
        cursor: pointer;
        padding: 0.5em .8em;
        background-color: #28292a9c;
        border-radius: .5em;
        font-size: 0.7em;

        &.active {
            background-color: #777778;
            font-weight: 500;
        }
    }
}
</style>