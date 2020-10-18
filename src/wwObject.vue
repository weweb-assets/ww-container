<template>
    <div class="ww-container" :class="{ selected: isSelected, blue: level % 2 === 0, green: level % 2 === 1 }">
        <wwObject class="ww-container__background" isBackground v-bind="content.background"></wwObject>
        <wwLayout class="ww-container__layout" :style="style" :direction="content.options.direction" path="wwObjects">
            <template v-slot="{ item, duplicate, index }">
                <wwLayoutItem class="ww-container__item" :class="{ editing: isEditing }">
                    <wwObject v-bind="item" noHover></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing">
                        <div class="ww-container__resize-handle" :class="content.options.direction"></div>
                        <button
                            class="ww-container__duplicate"
                            :class="content.options.direction"
                            @click="duplicate(index)"
                        >
                            <wwEditorIcon small name="add"></wwEditorIcon>
                        </button>
                    </template>
                    <!-- wwEditor:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwEditor:start -->
        <template v-if="isEditing">
            <div class="ww-container__menu" :class="[level % 2 ? 'left' : 'right']">
                <wwEditorIcon small name="config"></wwEditorIcon>
            </div>
        </template>
        <!-- wwEditor:end -->
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
    inject: {
        parentLevel: { from: 'level', default: 0 },
    },
    provide() {
        return {
            level: this.level,
        };
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
        isSelected() {
            return this.wwEditorState.isSelected;
        },
        level() {
            return this.parentLevel + 1;
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
    border: 1px solid transparent;
    &.blue {
        --ww-container-color: var(--ww-color-blue-500);
    }
    &.green {
        --ww-container-color: var(--ww-color-green-500);
    }
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
    &__item {
        box-sizing: border-box;
        border: 1px solid transparent;
        &.editing:hover {
            border: 1px dashed;
            border-color: var(--ww-container-color);
            > .ww-container__resize-handle,
            > .ww-container__duplicate {
                display: flex;
            }
        }
    }
    &:hover,
    .selected {
        border: 1px dashed var(--ww-container-color);
        > .ww-container__menu {
            display: flex;
        }
    }
    &__menu {
        position: absolute;
        display: none;
        top: 0;
        border-radius: 100%;
        padding: var(--ww-spacing-01);
        &.right {
            right: 0;
            transform: translate(50%, -50%);
        }
        &.left {
            left: 0;
            transform: translate(-50%, -50%);
        }
        background-color: var(--ww-container-color);
        z-index: 10;
        color: white;
        justify-content: center;
        align-items: center;
    }
    &__resize-handle {
        position: absolute;
        background-color: var(--ww-container-color);
        display: none;
        &.row {
            height: 24px;
            width: 6px;
            top: calc(50% - 12px);
            right: -3px;
            cursor: col-resize;
        }
        &.column {
            height: 6px;
            width: 24px;
            bottom: -3px;
            right: calc(50% - 12px);
            cursor: row-resize;
        }
    }
    &__duplicate {
        position: absolute;
        background: var(--ww-container-color);
        color: white;
        display: none;
        padding: var(--ww-spacing-01);
        border: none;
        outline: none;
        border-radius: 100%;
        &.row {
            top: 25%;
            right: 0;
            transform: translate(50%, -50%);
        }
        &.column {
            right: 25%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
