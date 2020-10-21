<template>
    <div class="ww-container" :class="[this.level % 2 === 0 ? 'odd' : 'even', { editing: isEditing }]">
        <wwObject class="ww-container__background" isBackground v-bind="content.background"></wwObject>
        {{ dragingIndex }}
        <wwLayout
            class="ww-container__layout"
            :class="content.direction"
            :direction="content.direction"
            path="wwObjects"
            ref="layout"
        >
            <template v-slot="{ item, index }">
                <wwLayoutItem
                    class="ww-container__item"
                    :class="[content.direction, { editing: isEditing, draging: dragingIndex === index }]"
                    :style="{ flexGrow: content.grid ? content.grid[index] : 0, flexBasis: '0', flexShrink: '0' }"
                >
                    <wwObject v-bind="item"></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing && content.direction === 'row'">
                        <div
                            class="ww-container__handle start"
                            v-if="index > 0"
                            @mousedown="startDraging($event, index, 'start')"
                            data-is-ui
                        ></div>
                        <div
                            class="ww-container__handle end"
                            v-if="index < content.wwObjects.length - 1"
                            @mousedown="startDraging($event, index, 'end')"
                            data-is-ui
                        ></div>
                    </template>
                    <!-- wwEditor:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwEditor:start -->
        <div class="ww-container__menu" :class="level % 2 ? 'right' : 'left'">
            <wwEditorIcon small name="config"></wwEditorIcon>
        </div>
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
        grid: [],
        direction: 'row',
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
    data() {
        return {
            lengthInUnit: 100,
            dragingHandle: 'start',
            dragingIndex: -1,
            mouseX: 0,
        };
    },
    computed: {
        isEditing() {
            return this.wwEditorState.editMode === wwLib.wwSectionHelper.EDIT_MODES.CONTENT;
        },
        isSelected() {
            return this.wwEditorState.isSelected;
        },
        level() {
            return this.parentLevel + 1;
        },
        isDraging() {
            return this.dragingIndex >= 0;
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
        add(index) {
            this.$refs.layout.add(index);
        },
        startDraging(event, index, handle) {
            // Ignore right and middle click
            if (event.button !== 0) return;
            event.stopPropagation();
            event.preventDefault();

            wwLib.getManagerWindow().document.addEventListener('mousemove', this.onMouseMouve);
            wwLib.getManagerWindow().document.addEventListener('mouseup', this.stopDraging, { once: true });
            this.dragingIndex = index;
            this.dragingHandle = handle;
            this.mouseX = event.screenX;
        },
        stopDraging() {
            // Ignore right and middle click
            if (event.button !== 0) return;
            wwLib.getManagerWindow().document.removeEventListener('mousemove', this.onMouseMouve);
            this.dragingIndex = -1;

            // Prevent click, which is different from mousedown
            wwLib.getManagerWindow().document.addEventListener(
                'click',
                e => {
                    e.stopPropagation();
                    e.preventDefault();
                },
                { once: true, capture: true }
            );
        },
        onMouseMouve(event) {
            if (!this.isDraging) return;
            const x = event.screenX;
            if (Math.abs(x - this.mouseX) < 10) return;
            const [min, max] =
                this.dragingHandle === 'start'
                    ? [this.dragingIndex - 1, this.dragingIndex]
                    : [this.dragingIndex, this.dragingIndex + 1];
            const fromIndex = x > this.mouseX ? max : min;
            const toIndex = x > this.mouseX ? min : max;
            this.drag(fromIndex, toIndex);
            this.mouseX = x;
        },
        drag(fromIndex, toIndex, increment = 1) {
            if (this.content.grid[fromIndex] > increment) {
                const grid = this.content.grid.map((val, i) => {
                    if (i === fromIndex) return val - increment;
                    if (i === toIndex) return val + increment;
                    return val;
                });
                this.$emit('update', { grid });
            }
        },
        /* wwEditor:end */
    },
    watch: {
        /* wwEditor:start */
        'content.wwObjects': {
            immediate: true,
            handler(objects, oldObjects = []) {
                objects = objects || [];
                if (objects.length === oldObjects.length) return;
                if (objects.length === 0) {
                    this.$emit('update', { grid: [] });
                    return;
                }
                const itemLength = Math.ceil(this.lengthInUnit / objects.length);
                const lastItemLength = itemLength + (this.lengthInUnit % objects.length);
                const grid = objects.map((_, i) => (i === 0 ? itemLength : lastItemLength));
                this.$emit('update', { grid });
            },
        },
        isDraging(isDraging) {
            // By preventing event on the iframe, we ensure that all event will be on Manager, and not capture by the iframe
            // Previous solution was double listners (both iframe and manager), but i think this is cleaner
            const iframe = wwLib.getManagerWindow().document.querySelector('.ww-manager-iframe');
            if (isDraging) {
                iframe.classList.add('ww-stop-event');
            } else {
                iframe.classList.remove('ww-stop-event');
            }
        },
        /* wwEditor:end */
    },
};
</script>

<style scoped lang="scss">
.ww-container {
    &.odd {
        --ww-editor-color: var(--ww-color-green-500);
    }
    &.even {
        --ww-editor-color: var(--ww-color-blue-500);
    }
    color: white;
    position: relative;
    box-sizing: border-box;
    &__menu {
        display: none;
    }
    &.editing:hover {
        > .ww-container__menu {
            display: flex;
        }
    }
    &__layout {
        display: flex;
        &.column {
            flex-direction: column;
        }
    }
    &__background {
        display: flex;
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
    }
    &__item {
        position: relative;
        box-sizing: border-box;
        border: 1px solid transparent;
        .ww-container__handle {
            display: none;
        }
        &.editing:hover,
        &.editing.draging {
            > .ww-container__handle {
                display: flex;
            }
            border: 1px solid var(--ww-editor-color);
        }
    }
    &__handle {
        position: absolute;
        background-color: var(--ww-editor-color);
        height: 30px;
        max-height: calc(100% - 10px);
        top: calc(50% - 15px);
        width: 6px;
        cursor: col-resize;
        &.start {
            left: -3px;
        }
        &.end {
            right: -3px;
        }
    }
    &__menu {
        position: absolute;
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
        background-color: var(--ww-editor-color);
        color: white;
        justify-content: center;
        align-items: center;
    }
}
</style>
