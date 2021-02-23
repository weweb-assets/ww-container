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
                            'show-length': showLength,
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
                            v-if="content.behavior === 'fit' && index > 0"
                            class="ww-container__handle start"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter.native="isHover = true"
                            @mouseleave.native="isHover = false"
                        />
                        <wwDraggable
                            v-if="content.behavior !== 'fit' || index < content.wwObjects.length - 1"
                            class="ww-container__handle end"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter.native="isHover = true"
                            @mouseleave.native="isHover = false"
                        />
                        <div v-if="showLength" class="ww-container__units">
                            {{ `${getGridAt(index)}${content.lengthInUnit === 100 ? '%' : ''}` }}
                        </div>
                        <div class="ww-container__border"></div>
                    </template>
                    <!-- wwManager:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwManager:start -->
        <div
            class="ww-container__menu"
            :style="{ '--ww-container-menu-offset': menuSize }"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
        >
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
        grid: wwLib.responsive({}),
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
        maxItem: wwLib.responsive(50),
    },
    wwEditorConfiguration({ content, bindedProps }) {
        return content.direction === 'row'
            ? getRowConfiguration(content, bindedProps)
            : getColumnConfiguration(content, bindedProps);
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

            /* wwEditor:start */
            isHover: false,
            /* wwEditor:end */
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
            return this.wwEditorState.bindedProps && this.wwEditorState.bindedProps.wwObjects;
        },
        screenSize() {
            return this.$store.getters['front/getScreenSize'];
        },
        level() {
            return this.parentLevel + 1;
        },
        isDraging() {
            return this.dragingIndex >= 0;
        },
        showLength() {
            return this.isDraging || this.isHover;
        },
        layoutStyle() {
            const style = {};

            //DIRECTION
            style.flexDirection = `${this.content.direction}`;

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
            } else if (this.content.behavior === 'wrap') {
                style.flexWrap = 'wrap';
                style.justifyContent = this.content.justifyContent;
            } else if (this.content.behavior === 'scroll') {
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
                    // if (this.isBinded && objects.length >= 1 && oldObjects.length === 0) {
                    //     this.$emit('update', { grid: [this.content.lengthInUnit] });
                    // }
                    this.equalize();
                }
            },
        },
        'content.lengthInUnit': {
            handler(newVal, oldVal) {
                if (!_.isEqual(newVal, oldVal)) {
                    this.equalize();
                    if (this.isBinded) {
                        this.$emit('update', { grid: [newVal] });
                    }
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
                    // if (this.content.behavior === 'wrap') {
                    //     const grid = this.content.grid.map(val => Math.min(val, this.content.lengthInUnit));

                    //     this.$emit('update', { grid });
                    // }
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
        // 'content.grid': {
        //     handler(oldVal, newVal) {
        //         if (!_.isEqual(oldVal, newVal) && !this.isBinded) {
        //             this.equalize();
        //         }
        //     },
        // },
        isBinded: {
            handler(newVal, oldVal) {
                if (!_.isEqual(newVal, oldVal)) {
                    if (newVal && this.content.behavior === 'fit') {
                        this.$emit('update', { behavior: 'wrap', gridDisplay: [] });
                    }
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

            //Reverse
            if (this.content.reverse) {
                style.order = this.content.wwObjects.length - 1 - index;
            } else {
                style.order = index;
            }

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
        getGridAt(index, grid) {
            index = this.isBinded ? 0 : index;
            grid = grid || this.content.grid;
            if (!grid) return 0;

            if (Array.isArray(grid)) {
                //LEGACY
                if (index >= grid.length) {
                    return grid[0] || 0;
                } else {
                    return grid[index];
                }
            } else {
                if (index >= this.content.wwObjects.length) {
                    return 0;
                } else {
                    return grid[this.content.wwObjects[index].uid];
                }
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
            this.initialGrid = { ...this.content.grid };
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
                this.getGridAt(this.isBinded ? 0 : this.dragingIndex, this.initialGrid) +
                    Math.round(totalDeltaX / this.unitLengthInPx)
            );
            if (this.content.behavior === 'fit') {
                const fromIndex = this.dragingHandle === 'start' ? this.dragingIndex - 1 : this.dragingIndex + 1;
                const sum =
                    this.getGridAt(fromIndex, this.initialGrid) + this.getGridAt(this.dragingIndex, this.initialGrid);
                newGridValue = Math.min(newGridValue, sum - 1);
                this.setGridValue({
                    [this.content.wwObjects[this.dragingIndex].uid]: newGridValue,
                    [this.content.wwObjects[fromIndex].uid]: sum - newGridValue,
                });
            } else {
                if (this.content.behavior === 'wrap') {
                    newGridValue = Math.min(newGridValue, this.content.lengthInUnit);
                }
                this.setGridValue({
                    [this.content.wwObjects[this.isBinded ? 0 : this.dragingIndex].uid]: newGridValue,
                });
            }
        },
        setGridValue(update) {
            const grid = { ...this.content.grid, ...update };
            if (!_.isEqual(grid, this.content.grid)) {
                this.$emit('update', { grid });
            }
        },
        equalize() {
            if (this.isEmpty) {
                return;
            }
            let lengthInUnit = this.content.lengthInUnit;

            if (this.isBinded) {
                const grid = { ...this.content.grid };
                grid[this.content.wwObjects[0].uid] = grid[this.content.wwObjects[0].uid] || lengthInUnit;
                this.$emit('update', { grid });
                return;
            }

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

            let grid = _.cloneDeep(this.content.grid || {});

            for (const wwObject of this.content.wwObjects) {
                if (!grid[wwObject.uid]) {
                    grid[wwObject.uid] = this.getGridAt(0) || lengthInUnit;
                }
            }

            if (this.content.direction === 'row') {
                if (this.content.behavior === 'fit') {
                    //Check if lengthInUnit is enouth
                    let newLengthInUnit = null;
                    const visibleWwObjectCount = gridDisplay.filter(value => value !== false).length;
                    if (lengthInUnit < visibleWwObjectCount) {
                        newLengthInUnit = visibleWwObjectCount;
                        lengthInUnit = visibleWwObjectCount;
                    }

                    //Check if total fits
                    let totalGrid = gridDisplay.reduce(
                        (total, display, i) => total + (display ? this.getGridAt(i, grid) : 0),
                        0
                    );

                    if (totalGrid != lengthInUnit) {
                        grid = {};
                        const itemLength = Math.floor(lengthInUnit / visibleWwObjectCount);
                        const firstItemLength = lengthInUnit - (visibleWwObjectCount - 1) * itemLength;
                        for (const index in this.content.wwObjects) {
                            grid[this.content.wwObjects[index].uid] = `${index}` === '0' ? firstItemLength : itemLength;
                        }
                    }

                    //Check need for update
                    const isEqual = false; //_.isEqual(grid, this.content.grid);
                    if (newLengthInUnit || !isEqual) {
                        const update = {};
                        if (newLengthInUnit) update.lengthInUnit = newLengthInUnit;
                        if (!isEqual) {
                            update.grid = grid;
                        }
                        this.$emit('update', update);
                    }

                    return;
                }

                if (this.content.type === 'flex') {
                    return;
                }

                for (const index in this.content.wwObjects) {
                    if (!this.getGridAt(index, grid)) {
                        grid[this.content.wwObjects[index].uid] =
                            this.getGridAt(index - 1, grid) || this.getGridAt(0, grid);
                    }
                    grid[this.content.wwObjects[index].uid] = Math.min(
                        grid[this.content.wwObjects[index].uid],
                        lengthInUnit
                    );
                }

                if (!_.isEqual(grid, this.content.grid)) {
                    this.$emit('update', { grid });
                }
            }
        },
        transformGrid() {
            if (Array.isArray(this.content.grid)) {
                const grid = {};
                for (const index in this.content.wwObjects) {
                    grid[this.content.wwObjects[index].uid] = this.content.grid[index] || 0;
                }
                this.$emit('update', { grid });
            }
        },
        /* wwEditor:end */
    },
    mounted() {
        /* wwEditor:start */
        this.transformGrid();
        this.$nextTick(this.equalize);
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
        &.editing.draging,
        &.editing.show-length {
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
