<template>
    <div class="ww-container">
        <wwObject class="ww-container__background" isBackground v-bind="content.background"></wwObject>
        <wwLayout class="ww-container__layout" :style="style" path="wwObjects" />
        <!-- wwManager:start -->
        <div class="ww-container__handle" v-if="isEditing">
            <span class="wwi wwi-align-right"></span>
        </div>
        <!-- wwManager:end -->
    </div>
</template>

<script>
/* wwEditor:start */
import openPopup from './popups';
/* wwEditor:end */

export default {
    name: '__COMPONENT_NAME__',
    wwDefaultContent: {
        background: { isWwObject: true, type: 'ww-color' },
        wwObjects: [],
        options: {
            direction: 'row',
            reverse: false,
            justifyContent: 'space-around',
            alignItems: 'center',
            wrap: false,
        },
    },
    props: {
        content: Object,
        /* wwEditor:start */
        wwEditorState: Object,
        /* wwEditor:end */
    },
    computed: {
        style() {
            const style = {
                flexDirection: this.content.options.reverse
                    ? `${this.content.options.direction}-reverse`
                    : this.content.options.direction,
                justifyContent: this.content.options.justifyContent,
                alignItems: this.content.options.alignItems,
            };

            if (this.content.options.wrap) {
                style.flexWrap = 'wrap';
            }

            return style;
        },
        isEditing() {
            return this.wwEditorState.editMode === wwLib.wwSectionHelper.EDIT_MODES.CONTENT;
        },
    },
    methods: {
        /* wwEditor:start */
        async edit() {
            const update = await openPopup(this.content.options);
            if (update) {
                this.$emit('update', update);
            }
        },
        /* wwEditor:end */
    },
};
</script>

<style scoped lang="scss">
.ww-container {
    position: relative;
    box-sizing: border-box;
    &__layout {
        display: flex;
    }
    &__background {
        display: flex;
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        left: 0;
    }
    &__handle {
        position: absolute;
        display: flex;
        top: 0;
        right: 0;
        border-radius: 20px 0 0 20px;
        background-color: #d02e7c;
        z-index: 10;
        color: white;
        height: 40px;
        width: 45px;
        justify-content: center;
        align-items: center;
        font-size: 22px;
    }
}
</style>
