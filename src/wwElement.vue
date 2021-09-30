<template>
    <div
        class="ww-container"
        :class="{
            /* wwEditor:start */
            editing: isEditing,
            empty: isEmpty,
            /* wwEditor:end */
        }"
    >
        <wwLayout
            ref="layout"
            class="ww-container__layout"
            :class="content.direction"
            :style="layoutStyle"
            ww-responsive="ww-layout"
            :direction="content.direction"
            :inherit-from-element="inheritFromElement"
            path="wwObjects"
            @update:list="update"
        >
            <template #default="{ layoutId, item, index }" class="ww-container__item">
                <wwLayoutItem
                    ref="layoutItem"
                    class="ww-container__item"
                    :class="[
                        {
                            /* wwEditor:start */
                            editing: isEditing,
                            draging: dragingIndex === index,
                            'show-length': showLength,
                            /* wwEditor:end */
                        },
                    ]"
                    :style="getItemStyle(item, index)"
                    :ww-responsive="`index-${index}`"
                >
                    <wwObject
                        v-bind="item"
                        class="ww-container__object"
                        :data-ww-layout-id="layoutId"
                        :data-ww-layout-index="index"
                        :style="{ flex: wwObjectFlex }"
                        :ww-responsive="`wwobject-${index}`"
                    ></wwObject>
                    <!-- wwEditor:start -->
                    <template v-if="isEditing && content.direction === 'row' && content.type === 'grid'">
                        <wwEditorDraggable
                            v-if="content.behavior === 'fit' && index > 0"
                            class="ww-container__handle start"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'start')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter="isHover = true"
                            @mouseleave="isHover = false"
                        />
                        <wwEditorDraggable
                            v-if="content.behavior !== 'fit' || index < content.wwObjects.length - 1"
                            class="ww-container__handle end"
                            :class="{ active: isDraging }"
                            data-is-ui
                            @startDrag="startDrag($event, index, 'end')"
                            @drag="drag($event)"
                            @endDrag="endDrag($event)"
                            @mouseenter="isHover = true"
                            @mouseleave="isHover = false"
                        />
                        <div v-if="showLength" class="ww-container__units">
                            {{ `${getGridAt(index)}${content.lengthInUnit === 100 ? '%' : ''}` }}
                        </div>
                        <div class="ww-container__border" :class="{ '-bound': isBound }"></div>
                    </template>
                    <!-- wwEditor:end -->
                </wwLayoutItem>
            </template>
        </wwLayout>
        <!-- wwEditor:start -->
        <div
            class="ww-container__menu"
            :style="{ '--ww-container-menu-offset': menuSize }"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
        >
            <wwEditorIcon small name="config"></wwEditorIcon>
        </div>
        <div class="ww-container__border" :class="{ '-bound': isBound }"></div>
        <!-- wwEditor:end -->
    </div>
</template>

<script>
export default {
    inject: {
        parentLevel: { from: 'level', default: 0 },
        objectId: { from: 'objectId' },
    },
    provide() {
        return {
            level: this.level,
        };
    },
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
        wwFrontState: { type: Object, required: true },
    },
    emits: ['update:content', 'update:content:effect'],
    data() {
        return {
            dragingHandle: 'start',
            dragingIndex: -1,

            // Optimisation because content change a lot
            layoutStyle: this.getLayoutStyle(),
            wwObjectFlex: this.getWwObjectFlex(),
            inheritFromElement: this.getInheritFromElement(),

            /* wwEditor:start */
            isHover: false,
            /* wwEditor:end */
        };
    },
    computed: {
        screenSize() {
            return this.wwFrontState.screenSize;
        },
        isBound() {
            /* wwEditor:start */
            return this.wwEditorState.boundProps && this.wwEditorState.boundProps.wwObjects;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        level() {
            return this.parentLevel + 1;
        },
        /* wwEditor:start */
        isEditing() {
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
        },
        isEmpty() {
            return !this.content || !this.content.wwObjects || !this.content.wwObjects.length;
        },
        isDraging() {
            return this.dragingIndex >= 0;
        },
        showLength() {
            return this.isDraging || this.isHover;
        },
        menuSize() {
            return 0; //`${6 * (this.level - 1)}px`;
        },
        /* wwEditor:end */
    },
    watch: {
        /* wwFront:start */
        screenSize(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.layoutStyle = this.getLayoutStyle();
                this.wwObjectFlex = this.getWwObjectFlex();
            }
        },
        /* wwFront:end */
        /* wwEditor:start */
        isBound: {
            handler(newVal, oldVal) {
                if (!_.isEqual(newVal, oldVal)) {
                    if (newVal) {
                        let gridDisplay = [];
                        let grid = [];
                        let wwObjects = [];
                        if (this.content.wwObjects.length) {
                            gridDisplay = [true];
                            grid = [this.content.grid[0]];
                            wwObjects = [this.content.wwObjects[0]];
                        }
                        const behavior = this.content.behavior === 'fit' ? 'wrap' : this.content.behavior;
                        this.$emit('update:content:effect', { behavior, gridDisplay, grid, wwObjects });
                    }
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
        'content.lengthInUnit'(newVal, oldVal){
            if (this.wwEditorState.isACopy) {
                return;
            }
            if(newVal && newVal !== oldVal) this.calc();
        },
        'content.grid'(newVal, oldVal) {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if (!this.isDraging) {
                if(!_.isEqual(newVal, oldVal)) this.calc();
                this.correctData();
            }
        },
        'content.gridDisplay'(newVal, oldVal) {
            if (this.wwEditorState.isACopy) {
                return;
            }
            if(!_.isEqual(newVal, oldVal)) this.calc();
        },
        'content.alignItems'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.wwObjectFlex = this.getWwObjectFlex();
            }
        },
        'content.direction'(...options) {
            this.updateLayoutStyle(options);
        },
        'content.justifyContent'(...options) {
            this.updateLayoutStyle(options);
        },
        'content.columnGap'(...options) {
            this.updateLayoutStyle(options);
        },
        'content.behavior'(newVal, oldVal) {
            if(newVal !== oldVal) this.calc();
            this.updateLayoutStyle(newVal, oldVal);
        },
        'content.type'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.calc();
                this.inheritFromElement = this.getInheritFromElement();
            }
        },
        /* wwEditor:end */
    },
    mounted() {
        /* wwEditor:start */
        this.correctData();
        /* wwEditor:end */
    },
    methods: {
        calc(){
            let grid = this.normalizeGrid(this.content.grid); // legacy
                if (this.content.behavior === 'fit') {
                    grid = this.fit(this.content.wwObjects, this.content.grid, this.content.gridDisplay);
                } else {
                    const getNewGridItem = item => {
                        return Math.round(
                            (this.content.lengthInUnit * item) / (this.content.lengthInUnit)
                        );
                    };
                    grid = this.content.grid.map(item => Math.min(getNewGridItem(item), this.content.lengthInUnit));
                }
                if (!_.isEqual(grid, this.content.grid)) this.$emit('update:content:effect', { grid });
        },
        getWwObjectFlex() {
            return this.content.alignItems === 'stretch' ? '1' : 'unset';
        },
        getInheritFromElement() {
            return this.content.type === 'flex' ? ['width'] : [];
        },
        getLayoutStyle() {
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
        updateLayoutStyle(oldVal, newVal) {
            if (oldVal !== newVal) {
                this.layoutStyle = this.getLayoutStyle();
            }
        },
        getItemStyle(item, index) {
            const style = {
                display: 'block',
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

            //Push last
            if (this.content.pushLast) {
                const push = !this.content.reverse ? index === this.content.wwObjects.length - 1 : index === 0;
                if (push) {
                    if (this.content.direction === 'column') {
                        style.marginTop = 'auto';
                    } else if (this.content.type === 'flex') {
                        style.marginLeft = 'auto';
                    }
                }
            }

            //Column
            if (this.content.direction === 'column') {
                return style;
            }

            style.display = 'flex';

            //Stretch
            if (this.content.alignItems !== 'stretch') {
                style.flexDirection = 'column';
                style.justifyContent = this.content.alignItems;
            }

            //Flex
            if (this.content.type === 'flex') {
                style.minWidth = '40px';
                return style;
            }
            const widthInUnit = this.getGridAt(index);
            style.width = `calc(${widthInUnit} * 100% / ${this.content.lengthInUnit})`;
            style.flexShrink = '0';

            return style;
        },
        getGridAt(index, grid) {
            index = this.isBound ? 0 : index;
            grid = grid || this.content.grid;
            if (!grid) return 0;

            if (Array.isArray(grid)) {
                if (index >= grid.length) {
                    return grid[0] || 0;
                } else {
                    return grid[index];
                }
            } else {
                //LEGACY
                if (index >= this.content.wwObjects.length) {
                    return 0;
                } else {
                    return grid[this.content.wwObjects[index].uid.split('_')[0]];
                }
            }
        },
        update(event) {
            /* wwEditor:start */
            let gridDisplay = [...this.content.gridDisplay];

            switch (event.type) {
                case 'add':
                    gridDisplay.splice(event.index, 0, true);
                    break;
                case 'remove':
                    gridDisplay.splice(event.fromIndex, 1);
                    break;
                case 'move':
                    gridDisplay = this.moveItem(gridDisplay, event.fromIndex, event.index);
                    break;
            }

            gridDisplay = gridDisplay.slice(0, event.list.length);

            if (this.content.direction === 'column') {
                this.$emit('update:content:effect', { gridDisplay });
            } else {
                const grid = this.getNewGrid(event, gridDisplay);
                this.$emit('update:content:effect', { grid, gridDisplay });
            }
            /* wwEditor:end */
        },
        getNewGrid(event, gridDisplay) {
            let grid;
            switch (event.type) {
                case 'add': {
                    const index = Math.max(0, event.index - 1);
                    grid = [...this.content.grid];
                    grid.splice(event.index, 0, this.content.grid[index] || this.content.lengthInUnit);
                    if (this.content.behavior === 'fit') {
                        grid = this.fit(event.list, grid, gridDisplay);
                    }
                    break;
                }
                case 'remove':
                    grid = [...this.content.grid];
                    grid.splice(event.index, 1);
                    if (this.content.behavior === 'fit') {
                        grid = this.fit(event.list, grid, gridDisplay);
                    }
                    break;
                case 'move':
                    grid = this.moveItem(this.content.grid, event.fromIndex, event.index);
                    break;
            }

            grid = grid.map(item => Math.min(item, this.content.lengthInUnit));

            return grid;
        },
        moveItem(grid, fromIndex, toIndex) {
            const list = [...grid];
            const [item] = list.splice(fromIndex, 1);
            if (fromIndex < toIndex) toIndex--;
            list.splice(toIndex, 0, item);
            return list;
        },
        fit(list, grid, gridDisplay) {
            gridDisplay = list.map((_, index) => (gridDisplay[index] === false ? false : true));
            let totalGrid = list.reduce((total, item, i) => total + (gridDisplay[i] ? grid[i] : 0), 0);
            const lengthInUnit = this.content.lengthInUnit;
            if (totalGrid === lengthInUnit && list.length === grid.length) return grid;

            const visibleWwObjectCount = Math.max(1, gridDisplay.filter(value => value !== false).length);

            const itemLength = Math.floor(lengthInUnit / visibleWwObjectCount);
            const firstItemLength = lengthInUnit - (visibleWwObjectCount - 1) * itemLength;

            const firstVisibleItemIndex = gridDisplay.findIndex(isVisible => isVisible);
            return list.map((_, index) => {
                if (!gridDisplay[index]) return itemLength;
                return firstVisibleItemIndex === index ? firstItemLength : itemLength;
            });
        },
        /* wwEditor:start */
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
                this.getGridAt(this.isBound ? 0 : this.dragingIndex, this.initialGrid) +
                    Math.round(totalDeltaX / this.unitLengthInPx)
            );
            if (this.content.behavior === 'fit') {
                const fromIndex = this.dragingHandle === 'start' ? this.dragingIndex - 1 : this.dragingIndex + 1;
                const sum =
                    this.getGridAt(fromIndex, this.initialGrid) + this.getGridAt(this.dragingIndex, this.initialGrid);
                newGridValue = Math.min(newGridValue, sum - 1);
                this.setGridValue({
                    [this.dragingIndex]: newGridValue,
                    [fromIndex]: sum - newGridValue,
                });
            } else {
                if (this.content.behavior === 'wrap') {
                    newGridValue = Math.min(newGridValue, this.content.lengthInUnit);
                }
                this.setGridValue({
                    [this.isBound ? 0 : this.dragingIndex]: newGridValue,
                });
            }
        },
        setGridValue(update) {
            const grid = this.content.grid.map((val, i) => update[i] || val);
            if (!_.isEqual(grid, this.content.grid)) {
                this.$emit('update:content', { grid });
            }
        },
        // Legacy
        normalizeGrid(grid) {
            if (!Array.isArray(grid)) {
                const newGrid = [];
                for (const index in this.content.wwObjects) {
                    newGrid.push(this.content.grid[this.content.wwObjects[index].uid] || this.content.lengthInUnit);
                }
                return newGrid;
            }
            return grid;
        },
        correctData() {
            let update = null;
            if (!Array.isArray(this.content.grid)) {
                update = update || {};
                update.grid = this.normalizeGrid(this.content.grid);
            } else if (this.content.grid.length !== this.content.wwObjects.length) {
                update = update || {};
                const grid = update.grid || this.content.grid;
                update.grid = this.content.wwObjects.map((_, index) =>
                    grid[index] !== undefined ? grid[index] : true
                );
            }
            if (this.content.gridDisplay.length !== this.content.wwObjects.length) {
                update = update || {};
                update.gridDisplay = this.content.wwObjects.map((_, index) =>
                    this.content.gridDisplay[index] !== undefined ? this.content.gridDisplay[index] : true
                );
            }
            if (update) {
                this.$emit('update:content:effect', update);
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
    --ww-container-color: var(--ww-color-yellow-400);

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
        :deep(*) > .ww-layout__placeholder {
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
                &.-bound {
                    border-color: var(--ww-color-purple-500);
                }
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
                &.-bound {
                    border-color: var(--ww-color-purple-500);
                }
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
        }
    }
    /* wwEditor:end */
}
</style>
