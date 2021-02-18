<template>
    <div class="ww-container" :class="[level % 2 === 0 ? 'blue' : 'green', { editing: isEditing, empty: isEmpty }]">
        <wwLayout
            class="ww-container__layout"
            :class="content.direction"
            :style="layoutStyle"
            ww-responsive="ww-layout"
            :direction="content.direction"
            :type="content.type"
            :placeholderIndex="mustPushLast ? -1 : null"
            :max="content.maxItem"
            path="wwObjects"
            ref="layout"
        >
            <template v-slot="{ layoutId, item, index }" class="ww-container__item">
                <wwLayoutItem
                    class="ww-container__item"
                    :class="[
                        {
                            editing: isEditing,
                            draging: dragingIndex === index,
                        },
                    ]"
                    :style="getItemStyle(item, index)"
                    :ww-responsive="`index-${index}`"
                    ref="layoutItem"
                >
                    <wwObject
                        v-bind="item"
                        class="ww-container__object"
                        :data-ww-layout-id="layoutId"
                        :data-ww-layout-index="index"
                        :style="wwObjectStyle"
                        :ww-responsive="`wwobject-${index}`"
                    ></wwObject>
                    <!-- wwManager:start -->
                    <template v-if="isEditing && content.direction === 'row' && content.type === 'grid'">
                        <wwDraggable
                            v-if="behavior === 'fit' && index > 0"
                            class="ww-container__handle start"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <wwDraggable
                            v-if="behavior !== 'fit' || index < content.wwObjects.length - 1"
                            class="ww-container__handle end"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                        />
                        <div v-if="isDraging" class="ww-container__units">
                            {{ `${getGridAt(index)}${content.lengthInUnit === 100 ? '%' : ''}` }}
                        </div>
                        <div class="ww-container__border"></div>
                    </template>
                    <!-- wwManager:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwManager:start -->
        <div class="ww-container__menu" :style="{ '--ww-container-menu-offset': menuSize }">
            <wwEditorIcon small name="config"></wwEditorIcon>
        </div>
        <div class="ww-container__border"></div>
        <!-- wwManager:end -->
    </div>
</template>

<script>
import { getRowConfiguration, getColumnConfiguration } from './configuration';

export default {
    wwDefaultContent: {
        wwObjects: [],
        grid: wwLib.responsive([]),
        gridDisplay: wwLib.responsive([]),
        direction: wwLib.responsive('row'),
        reverse: wwLib.responsive(false),
        lengthInUnit: wwLib.responsive(100),
        columnGap: wwLib.responsive('0px'),
        type: wwLib.responsive('grid'),
        behavior: wwLib.responsive('fit'),
        justifyContent: wwLib.responsive('center'),
        alignItems: wwLib.responsive('start'),
        pushLast: wwLib.responsive(false),
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
        objectId: { from: 'objectId' },
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
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            return false;
        },
        isEmpty() {
            /* wwEditor:start */
            return !this.content || !this.content.wwObjects || !this.content.wwObjects.length;
            /* wwEditor:end */
            return false;
        },
        isBinded() {
            return this.wwEditorState.bindedProps.wwObjects;
        },
        screenSize() {
            return this.$store.getters['front/getScreenSize'];
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
            const style = {};

            //DIRECTION
            style.flexDirection = `${this.content.direction}${this.content.reverse ? '-reverse' : ''}`;

            style.width = 'unset';
            style.flexWrap = 'unset';
            style.justifyContent = 'unset';
            style.overflowX = 'visible';
            style.columnGap = 'unset';

            if (this.content.direction === 'column') {
                style.justifyContent = this.content.justifyContent;
            } else if (this.content.type === 'flex') {
                style.width = '100%';
                style.flexWrap = 'wrap';
                style.justifyContent = this.content.justifyContent;
                style.columnGap = this.content.columnGap;
            } else if (this.behavior === 'wrap') {
                style.flexWrap = 'wrap';
                style.justifyContent = this.content.justifyContent;
            } else if (this.behavior === 'scroll') {
                style.overflowX = 'auto';
                style.width = '100%';
            }

            return style;
        },
        wwObjectStyle() {
            if (this.content.alignItems === 'stretch') {
                return { height: '100%' };
            }
            return { height: 'auto' };
        },
        mustPushLast() {
            return (this.content.type === 'flex' || this.content.direction === 'column') && this.content.pushLast;
        },
        // TODO: not good
        behavior() {
            /* wwEditor:start */
            if (this.isBinded && this.content.behavior === 'fit') {
                return 'wrap';
            }
            /* wwEditor:end */

            return this.content.behavior;
        },
        /* wwEditor:start */
        menuSize() {
            return `${6 * (this.level - 1)}px`;
        },
        /* wwEditor:end */
    },
    watch: {
        /* wwEditor:start */
        'content.wwObjects': {
            handler(objects, oldObjects) {
                if (!_.isEqual(objects, oldObjects)) {
                    if (!oldObjects) return;
                    objects = objects || [];
                    if (!oldObjects) return;
                    if (objects.length === oldObjects.length) return;
                    if (objects.length === 0) {
                        this.$emit('update', { grid: [] });
                        return;
                    }
                    this.equalize();
                }
            },
        },
        'content.lengthInUnit': {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal)) {
                    this.equalize();
                }
            },
        },
        'content.type': {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal)) {
                    if (this.content.type === 'grid') {
                        this.equalize();
                    }
                }
            },
        },
        'content.behavior': {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal)) {
                    if (this.content.behavior === 'fit') {
                        this.equalize();
                    }
                    if (this.content.behavior === 'wrap') {
                        const grid = this.content.grid.map(val => Math.min(val, this.content.lengthInUnit));

                        this.$emit('update', { grid });
                    }
                }
            },
        },
        'content.gridDisplay': {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal)) {
                    this.equalize();
                }
            },
        },
        'content.grid': {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal) && !this.isBinded) {
                    this.equalize();
                }
            },
        },
        isBinded: {
            handler(oldVal, newVal) {
                if (!_.isEqual(oldVal, newVal)) {
                    this.equalize();
                }
            },
        },
        screenSize: {
            handler() {
                this.equalize();
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
    methods: {
        getItemStyle(item, index) {
            const style = {
                display: 'block',
                width: 'unset',
                flexDirection: '',
                justifyContent: 'unset',
                minWidth: 'unset',
                flexShrink: 'unset',
            };

            //wwObject Hidden
            if (this.content.gridDisplay && this.content.gridDisplay[index] === false) {
                style.display = 'none';
                return style;
            }

            //Column
            if (this.content.direction === 'column') {
                return style;
            }

            //Stretch
            if (this.content.alignItems !== 'stretch') {
                style.display = 'flex';
                style.flexDirection = 'column';
                style.justifyContent = this.content.alignItems;
            }

            //Flex
            if (this.content.type === 'flex') {
                const wwObject = this.$store.getters['websiteData/getWwObject'](item.uid);

                const width = wwLib.getResponsiveStyleProp({
                    store: this.$store,
                    style: (wwObject._state || {}).style || {},
                    prop: 'width',
                });
                if (width && width.endsWith('%')) style.width = width;

                style.minWidth = '40px';
                return style;
            }

            const widthInUnit = this.getGridAt(index);
            style.width = `calc(${widthInUnit} * 100% / ${this.content.lengthInUnit})`;
            style.flexShrink = '0';

            return style;
        },
        getGridAt(index) {
            if (!this.content.grid) return 0;
            if (index > this.content.grid.length) {
                return this.content.grid[0] || 0;
            } else {
                return this.content.grid[index];
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
                this.initialGrid[this.isBinded ? 0 : this.dragingIndex] + Math.round(totalDeltaX / this.unitLengthInPx)
            );
            if (this.behavior === 'fit') {
                const fromIndex = this.dragingHandle === 'start' ? this.dragingIndex - 1 : this.dragingIndex + 1;
                const sum = this.initialGrid[fromIndex] + this.initialGrid[this.dragingIndex];
                newGridValue = Math.min(newGridValue, sum - 1);
                this.setGridValue({ [this.dragingIndex]: newGridValue, [fromIndex]: sum - newGridValue });
            } else {
                if (this.behavior === 'wrap') {
                    newGridValue = Math.min(newGridValue, this.content.lengthInUnit);
                }
                this.setGridValue({ [this.isBinded ? 0 : this.dragingIndex]: newGridValue });
            }
        },
        setGridValue(update) {
            const grid = this.content.grid.map((val, i) => update[i] || val);
            this.$emit('update', { grid });
        },
        equalize() {
            if (this.isEmpty) {
                return;
            }
            clearTimeout(this.updateGridTimeout);

            if (this.isBinded) {
                this.$emit('update', { grid: [this.content.lengthInUnit] });
                return;
            }

            let lengthInUnit = this.content.lengthInUnit;

            //Set gridDisplay
            let gridDisplay = [...this.content.gridDisplay];
            if (!gridDisplay.length) {
                gridDisplay = this.content.wwObjects.map(() => true);
            }
            while (gridDisplay.length < this.content.wwObjects.length) {
                gridDisplay.push(true);
            }
            while (gridDisplay.length > this.content.wwObjects.length) {
                gridDisplay.pop();
            }

            const visibleWwObjectCount = gridDisplay.filter(value => value !== false).length;

            if (this.content.direction === 'row') {
                let totalGrid = this.content.grid.reduce((total, col, i) => total + (gridDisplay[i] ? col : 0), 0);

                //Set lenght unit to at list wwObject length if fit mode
                if (this.behavior === 'fit' && lengthInUnit < visibleWwObjectCount) {
                    this.$emit('update', { lengthInUnit: visibleWwObjectCount });
                    lengthInUnit = visibleWwObjectCount;
                }

                if (
                    this.behavior === 'fit' &&
                    (totalGrid != lengthInUnit || this.content.grid.length !== this.content.wwObjects.length)
                ) {
                    const itemLength = Math.floor(lengthInUnit / visibleWwObjectCount);
                    const firstItemLength = lengthInUnit - (visibleWwObjectCount - 1) * itemLength;
                    const grid = this.content.wwObjects.map((_, i) => (i === 0 ? firstItemLength : itemLength));
                    this.updateGridTimeout = setTimeout(() => this.$emit('update', { grid }), 1);

                    return;
                }

                let grid = [...this.content.grid];
                while (grid.length < this.content.wwObjects.length) {
                    for (const index in this.content.wwObjects) {
                        if (this.wwObjectGridSizes[this.content.wwObjects[index].uid] === undefined) {
                            let previousWwObjectIndex = index > 0 ? index - 1 : index + 1;
                            previousWwObjectIndex =
                                previousWwObjectIndex > grid.length - 1 ? -1 : previousWwObjectIndex;

                            if (previousWwObjectIndex > -1) {
                                grid.splice(index, 0, grid[previousWwObjectIndex]);
                            } else {
                                grid.splice(index, 0, lengthInUnit);
                            }
                        }
                    }
                }

                while (grid.length > this.content.wwObjects.length) {
                    const wwObjectGridSizesArray = Object.keys(this.wwObjectGridSizes);
                    for (const index in wwObjectGridSizesArray) {
                        let wwObjectExists = false;
                        for (const wwObject of this.content.wwObjects) {
                            if (wwObject.uid === wwObjectGridSizesArray[index]) wwObjectExists = true;
                        }
                        if (!wwObjectExists) {
                            grid.splice(index, 1);
                        }
                    }
                }

                if (!_.isEqual(grid.length, this.content.grid.length)) {
                    this.updateGridTimeout = setTimeout(() => this.$emit('update', { grid }), 1);
                    this.setWwObjectGridSizes();
                }
            }
        },
        setWwObjectGridSizes() {
            this.wwObjectGridSizes = [];
            for (const index in this.content.wwObjects) {
                let size = this.content.grid.length > index ? this.content.grid[index] : 1;

                this.wwObjectGridSizes.push({ [this.content.wwObjects[index].uid]: size });
            }
        },
        /* wwEditor:end */
    },
    mounted() {
        /* wwEditor:start */
        this.setWwObjectGridSizes();
        this.equalize();
        /* wwEditor:end */
    },
};
</script>

<style scoped lang="scss">
.ww-container {
    position: relative;
    box-sizing: border-box;
    --ww-container-color: var(--ww-color-blue-400);

    &__layout {
        display: flex;
        height: 100%;
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
        /deep/ > .ww-layout__placeholder {
            flex: 1;
        }
    }
    &__item {
        position: relative;
        box-sizing: border-box;

        /* wwEditor:start */
        .ww-container__handle {
            display: none;
        }
        &.editing:hover,
        &.editing.draging {
            > .ww-container__handle {
                display: flex;
            }
            & > .ww-container__border {
                border: 1px dashed var(--ww-container-color);
                display: block;
            }
        }
        /* wwEditor:end */
    }

    /* wwEditor:start */
    &__border {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: none;
        pointer-events: none;
        z-index: 10;
    }
    &__menu {
        opacity: 0;
        pointer-events: none;
        display: flex;
        position: absolute;
        border-radius: 100%;
        padding: var(--ww-spacing-01);
        transition: opacity 0.2s ease;
        z-index: 11;
        cursor: pointer;
        background-color: var(--ww-container-color);
        color: white;
        justify-content: center;
        align-items: center;
        left: 0;
        top: var(--ww-container-menu-offset);
        transform: translate(-50%, -50%);
        transition: transform 0.3s ease;
        // width: var(--ww-container-menu-size);
        // height: var(--ww-container-menu-size);

        &:hover {
            transform: translate(-50%, -50%) scale(1.3);
        }

        // &:after {
        //     content: '';
        //     position: absolute;
        //     top: 50%;
        //     left: 50%;
        //     transform: translate(-50%, -50%) rotate(45deg);
        //     width: 30px;
        //     height: 30px;
        // }
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
        background-color: var(--ww-container-color);
        color: white;
        font-size: 1.8rem;
        padding: var(--ww-spacing-02);
        z-index: 11;
    }

    &.editing {
        &:hover {
            & > .ww-container__border {
                border: 1px solid var(--ww-container-color);
                display: block;
            }
            > .ww-container__menu {
                opacity: 1;
                pointer-events: all;
            }
        }

        &.empty {
            & > .ww-container__border {
                border: 1px dashed var(--ww-color-dark-500);
                display: block;
            }
            & > .ww-container__plus {
                display: flex;
            }
        }
    }
    /* wwEditor:end */
}
</style>
