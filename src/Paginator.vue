<template>
    <nav role="navigation">
        <ul>
            <li :class="{ 'hide-icon': !$parent.isEditing && currentPage === 0 }" @click="prev">
                <wwObject v-if="$parent.content.paginatorPrev" v-bind="$parent.content.paginatorPrev"></wwObject>
            </li>
            <template v-if="$parent.content.paginatorText">
                <li
                    v-for="(nav, index) in navigation"
                    :key="index"
                    :aria-current="nav.index === currentPage"
                    @click="goTo(nav.index)"
                >
                    <wwObject
                        v-bind="$parent.content.paginatorText"
                        :ww-props="{ text: nav.label }"
                        :states="nav.index === currentPage ? ['active'] : []"
                    ></wwObject>
                </li>
            </template>
            <li :class="{ 'hide-icon': !$parent.isEditing && currentPage === nbPage - 1 }" @click="next">
                <wwObject v-if="$parent.content.paginatorNext" v-bind="$parent.content.paginatorNext"></wwObject>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    computed: {
        nbPage() {
            if (this.$parent.content.maxItem) {
                return Math.ceil(this.$parent.total / this.$parent.content.maxItem);
            } else {
                return 1;
            }
        },
        currentPage() {
            if (this.$parent.content.maxItem) {
                return Math.floor(this.$parent.start / this.$parent.content.maxItem);
            } else {
                return 1;
            }
        },
        navigation() {
            const lastPage = this.nbPage - 1;
            const prev = this.currentPage - 1;
            const next = this.currentPage + 1;
            let index = 0;
            let navigation = [];
            navigation.push({ label: '1', index: 0 });

            // Prev page
            if (prev > index) {
                // Separator
                if (prev > index + 1) {
                    navigation.push({ label: '...', index: -1 });
                }
                navigation.push({ label: `${prev + 1}`, index: prev });
                index = prev;
            }

            // Current page
            if (this.currentPage !== 0 && this.currentPage !== lastPage) {
                navigation.push({ label: `${this.currentPage + 1}`, index: this.currentPage });
                index = this.currentPage;
            }

            // NextPage
            if (next < lastPage && next > index) {
                navigation.push({ label: `${next + 1}`, index: next });
                index = next;
                // Separator
                if (next < lastPage - 1) {
                    navigation.push({ label: '...', index: -1 });
                }
            }

            // Last page
            if (lastPage > index) {
                navigation.push({ label: `${lastPage + 1}`, index: lastPage });
            }

            return navigation;
        },
    },
    async mounted() {
        /* wwEditor:start */
        if (this.$parent.wwEditorState.isACopy) {
            return;
        }
        if (!this.$parent.content.paginatorText) {
            this.$parent.$emit('update:content:effect', { paginatorText: await wwLib.createElement('ww-text') });
        }
        if (!this.$parent.content.paginatorPrev) {
            const paginatorPrev = await wwLib.createElement('ww-icon');
            this.$parent.$emit('update:content:effect', { paginatorPrev });
        }
        if (!this.$parent.content.paginatorNext) {
            this.$parent.$emit('update:content:effect', { paginatorNext: await wwLib.createElement('ww-icon') });
        }
        /* wwEditor:end */
    },
    methods: {
        goTo(index) {
            if (index !== -1 && index !== this.currentPage) {
                this.$parent.start = index * this.$parent.content.maxItem;
            }
        },
        prev() {
            if (this.currentPage > 0) {
                this.goTo(this.currentPage - 1);
            }
        },
        next() {
            if (this.currentPage < this.nbPage - 1) {
                this.goTo(this.currentPage + 1);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
ul {
    display: flex;
    align-items: center;
    justify-content: center;
    list-style: none;
    margin: 0;
    padding: 0;
    li {
        padding: 0;
        user-select: none;
        cursor: pointer;
    }
}
.hide-icon {
    opacity: 0;
    pointer-events: none;
}
</style>
