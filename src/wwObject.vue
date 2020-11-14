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
            <template v-slot="{ layoutId, item, index }">
                <wwLayoutItem
                    class="ww-container__item"
                    :class="[content.direction, { editing: isEditing, draging: dragingIndex === index }]"
                    :style="getItemStyle(index)"
                    ref="layoutItem"
                >
                    <wwObject
                        v-bind="item"
                        class="ww-container__object"
                        :data-ww-layout-id="layoutId"
                        :data-ww-layout-index="index"
                    ></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing && content.direction === 'row'">
                        <wwDraggable
                            v-if="content.behavior === 'fit' && index > 0"
                            class="ww-container__handle start"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <wwDraggable
                            v-if="content.behavior !== 'fit' || index < content.wwObjects.length - 1"
                            class="ww-container__handle end"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <div v-if="isDraging" class="ww-container__units">
                            {{ content.grid ? `${content.grid[index]}${content.lengthInUnit === 100 ? '%' : ''}` : 0 }}
                        </div>
                    </template>
                    <!-- wwEditor:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwEditor:start -->
        <div class="ww-container__menu" :class="level % 2 ? 'left' : 'right'">
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
        behavior: 'fit',
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
                return {
                    height: '100%',
                    justifyContent: this.content.justifyContent,
                };
            }
            if (this.content.behavior === 'wrap') {
                return { flexWrap: 'wrap', justifyContent: this.content.justifyContent };
            } else if (this.content.behavior === 'scroll') {
                return { overflowX: 'auto', width: '100%' };
            } else {
                return {};
            }
        },
    },
    methods: {
        getItemStyle(index) {
            if (this.content.direction === 'column') {
                return {};
            }
            const base = {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: this.content.alignItems,
            };
            if (this.content.behavior === 'fit') {
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
        startDrag(event, index, handle) {
            this.dragingIndex = index;
            this.dragingHandle = handle;
            const { width } = this.$el.getBoundingClientRect();
            this.unitLengthInPx = width / this.content.lengthInUnit;
            this.initialGrid = [...this.content.grid];
        },
        endDrag() {
            this.dragingIndex = -1;
        },
        drag({ totalDeltaX }) {
            if (!this.isDraging) return;
            if (this.dragingHandle === 'start') {
                totalDeltaX = -1 * totalDeltaX;
            }
            let newGridValue = Math.max(
                1,
                this.initialGrid[this.dragingIndex] + Math.round(totalDeltaX / this.unitLengthInPx)
            );
            if (this.content.behavior === 'fit') {
                const fromIndex = this.dragingHandle === 'start' ? this.dragingIndex - 1 : this.dragingIndex + 1;
                const sum = this.initialGrid[fromIndex] + this.initialGrid[this.dragingIndex];
                newGridValue = Math.min(newGridValue, sum - 1);
                this.setGridValue({ [this.dragingIndex]: newGridValue, [fromIndex]: sum - newGridValue });
            } else {
                if (this.content.behavior === 'wrap') {
                    newGridValue = Math.min(newGridValue, this.content.lengthInUnit);
                }
                this.setGridValue({ [this.dragingIndex]: newGridValue });
            }
        },
        setGridValue(update) {
            const grid = this.content.grid.map((val, i) => update[i] || val);
            this.$emit('update', { grid });
        },
        equalize() {
            const itemLength = Math.floor(this.content.lengthInUnit / this.content.wwObjects.length);
            const firstItemLength = this.content.lengthInUnit - (this.content.wwObjects.length - 1) * itemLength;
            const grid = this.content.wwObjects.map((_, i) => (i === 0 ? firstItemLength : itemLength));
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
        'content.behavior': {
            handler() {
                if (this.content.behavior === 'fit') {
                    this.equalize();
                }
                if (this.content.behavior === 'wrap') {
                    const grid = this.content.grid.map(val => Math.min(val, this.content.lengthInUnit));
                    this.$emit('update', { grid });
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
    position: relative;
    box-sizing: border-box;
    &__menu {
        opacity: 0;
        pointer-events: none;
    }
    &.editing:hover {
        &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 1px solid var(--ww-editor-color);
            pointer-events: none;
            z-index: 10;
        }
        > .ww-container__menu {
            opacity: 1;
            pointer-events: all;
        }
    }
    &__layout {
        display: flex;
        &.column {
            flex-direction: column;
        }
        &.row {
            height: 100%;
        }
        &::-webkit-scrollbar-thumb {
            background-color: #808080;
        }
        &::-webkit-scrollbar-track {
            background-color: #ffffff00;
        }
        &::-webkit-scrollbar {
            width: 5px;
            height: 5px;
            background-color: #ffffff00;
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
        .ww-container__handle {
            display: none;
        }
        &.editing:hover,
        &.editing.draging {
            > .ww-container__handle {
                display: flex;
            }
            &:after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 1px solid var(--ww-editor-color);
                pointer-events: none;
                z-index: 10;
            }
        }
        &.column {
            > * {
                width: 100%;
            }
        }
    }
    &__handle {
        position: absolute;
        background: white;
        height: 32px;
        max-height: calc(100% - 6px);
        top: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        border: 1px solid var(--ww-color-green-500);
        box-shadow: 0px 0px 3px #b8bbc0;
        border-radius: 4px;
        z-index: 12;
        cursor: ew-resize;
        transition: transform 0.2s ease;

        &:hover,
        &.active {
            transform: translate(-50%, -50%) scale(1.2);
        }
        &.start {
            left: 0;
        }
        &.end {
            left: 100%;
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
        z-index: 3;
    }
    &__menu {
        display: flex;
        position: absolute;
        top: 0;
        border-radius: 100%;
        padding: var(--ww-spacing-01);
        transition: opacity 0.2s ease;
        z-index: 11;
        cursor: pointer;
        background-color: var(--ww-editor-color);
        color: white;
        justify-content: center;
        align-items: center;

        &:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 30px;
            height: 30px;
        }

        &.right {
            right: 0;
            transform: translate(50%, -50%);
        }
        &.left {
            left: 0;
            transform: translate(-50%, -50%);
        }
    }
}
</style>
