<template>
    <div class="ww-container-test">
        <wwLayout class="ww-container-test__layout" path="wwObjects"> </wwLayout>
    </div>
</template>

<script>
export default {
    wwDefaultContent: {
        wwObjects: [],
    },
    props: {
        content: Object,
    },
};
</script>

<style scoped lang="scss">
.ww-container-test {
    &__layout {
        display: flex;
        flex-direction: column;
    }
}
</style>
