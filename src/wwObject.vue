<template>
    <div class="ww-container" :class="[this.level % 2 === 0 ? 'odd' : 'even', { editing: isEditing }]">
        <wwObject class="ww-container__background" isBackground v-bind="content.background"></wwObject>
        <wwLayout
            class="ww-container__layout"
            :class="content.direction"
            :style="layoutStyle"
            :direction="content.direction"
            path="wwObjects"
            ref="layout"
        >
            <template v-slot="{ item, index }">
                <wwLayoutItem
                    class="ww-container__item"
                    :class="[content.direction, { editing: isEditing, draging: dragingIndex === index }]"
                    :style="getItemStyle(index)"
                    ref="layoutItem"
                >
                    <wwObject v-bind="item" class="ww-container__object"></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing && content.direction === 'row'">
                        <wwDraggable
                            v-if="content.width === 'fit' && index > 0"
                            class="ww-container__handle start"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <wwDraggable
                            v-if="content.width !== 'fit' || index < content.wwObjects.length - 1"
                            class="ww-container__handle end"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <div v-if="isDraging" class="ww-container__units">
                            {{ content.grid ? content.grid[index] : 0 }}
                        </div>
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
import { getRowConfiguration, getColumnConfiguration } from './configuration';

export default {
    name: '__COMPONENT_NAME__',
    wwDefaultContent: {
        background: { isWwObject: true, type: 'ww-color' },
        wwObjects: [],
        grid: [],
        direction: 'row',
        lengthInUnit: 100,
        width: 'fit',
        justifyContent: 'center',
        alignItems: 'start',
    },
    wwEditorConfiguration({ content }) {
        return content.direction === 'row' ? getRowConfiguration(content) : getColumnConfiguration(content);
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
        layoutStyle() {
            if (this.content.direction === 'column') {
                return {};
            }
            if (this.content.width === 'wrap') {
                return { flexWrap: 'wrap', justifyContent: this.content.justifyContent };
            } else if (this.content.width === 'scroll') {
                return { overflowX: 'auto', width: '100%' };
            } else {
                return {};
            }
        },
    },
    methods: {
        getItemStyle(index) {
            if (this.content.direction === 'column') {
                return {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: this.content.alignItems,
                };
            }
            const base = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: this.content.alignItems,
            };
            if (this.content.width === 'fit') {
                return {
                    ...base,
                    flexGrow: this.content.grid ? this.content.grid[index] : 0,
                    flexBasis: '0',
                    flexShrink: '0',
                };
            } else {
                const widthInUnit = this.content.grid ? this.content.grid[index] : 0;
                return {
                    ...base,
                    width: `calc(${widthInUnit} * 100% / ${this.content.lengthInUnit})`,
                    flexShrink: '0',
                };
            }
        },
        /* wwEditor:start */
        add(index) {
            this.$refs.layout.add(index);
        },
        startDrag({ x }, index, handle) {
            this.dragingIndex = index;
            this.dragingHandle = handle;
            this.mouseX = x;
            if (this.$refs.layoutItem[0]) {
                const { width } = this.$refs.layoutItem[0].getBoundingClientRect();
                this.unitLengthInPx = (width / this.content.lengthInUnit) * this.content.grid[0];
            } else {
                this.unitLengthInPx = 10;
            }
        },
        endDrag() {
            this.dragingIndex = -1;
        },
        drag({ x }) {
            if (!this.isDraging) return;
            const distance = Math.abs(x - this.mouseX);
            if (distance < this.unitLengthInPx) return;
            if (this.content.width === 'fit') {
                const [min, max] =
                    this.dragingHandle === 'start'
                        ? [this.dragingIndex - 1, this.dragingIndex]
                        : [this.dragingIndex, this.dragingIndex + 1];
                const fromIndex = x > this.mouseX ? max : min;
                const toIndex = x > this.mouseX ? min : max;
                this.transfer(fromIndex, toIndex);
            } else {
                this.mouseX > x ? this.decrease(this.dragingIndex) : this.increase(this.dragingIndex);
            }
            this.mouseX = x;
        },
        transfer(fromIndex, toIndex, increment = 1) {
            if (this.content.grid[fromIndex] > increment) {
                const grid = this.content.grid.map((val, i) => {
                    if (i === fromIndex) return val - increment;
                    if (i === toIndex) return val + increment;
                    return val;
                });
                this.$emit('update', { grid });
            }
        },
        increase(index, increment = 1) {
            const grid = this.content.grid.map((val, i) => (i === index ? val + increment : val));
            this.$emit('update', { grid });
        },
        decrease(index, increment = 1) {
            const grid = this.content.grid.map((val, i) => (i === index ? Math.max(1, val - increment) : val));
            this.$emit('update', { grid });
        },
        equalize() {
            const itemLength = Math.ceil(this.content.lengthInUnit / this.content.wwObjects.length);
            const lastItemLength = itemLength + (this.content.lengthInUnit % this.content.wwObjects.length);
            const grid = this.content.wwObjects.map((_, i) => (i === 0 ? itemLength : lastItemLength));
            this.$emit('update', { grid });
        },
        /* wwEditor:end */
    },
    watch: {
        /* wwEditor:start */
        'content.wwObjects': {
            handler(objects, oldObjects) {
                if (!oldObjects) return;
                objects = objects || [];
                if (!oldObjects) return;
                if (objects.length === oldObjects.length) return;
                if (objects.length === 0) {
                    this.$emit('update', { grid: [] });
                    return;
                }
                this.equalize();
            },
        },
        'content.lengthInUnit': {
            handler() {
                this.equalize();
            },
        },
        'content.width': {
            handler() {
                if (this.content.width === 'fit') {
                    this.equalize();
                }
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
    &__units {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--ww-editor-color);
        color: white;
        font-size: 1.8rem;
        padding: var(--ww-spacing-02);
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
