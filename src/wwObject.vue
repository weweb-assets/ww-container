<template>
    <div class="ww-container">
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

const DEFAULT_OPTIONS = {
    direction: 'row',
    reverse: false,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'nowrap',
    minHeight: '25%',
};

export default {
    name: '__COMPONENT_NAME__',
    wwDefaultContent: {
        wwObjects: [],
        options: {},
    },
    props: {
        content: Object,
        /* wwEditor:start */
        wwEditorState: Object,
        /* wwEditor:end */
    },
    computed: {
        options() {
            return { ...DEFAULT_OPTIONS, ...this.content.options };
        },
        style() {
            const style = {
                direction: this.options.reverse ? `${this.options.direction}-reverse` : this.options.direction,
                justifyContent: this.options.justifyContent,
                alignItems: this.options.alignItems,
                minHeight: this.options.minHeight,
            };

            if (this.options.flexWrap) {
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
            const update = await openPopup(this.content);
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
    &__layout {
        display: flex;
    }
    &__handle {
        position: absolute;
        display: flex;
        top: 10px;
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
