<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
    <div class="ww-container" v-style="c_style">
        <wwLayout :options="wwObject.content.data.options" tag="div" :ww-list="wwObject.content.data.wwObjects" class="wwobjects-wrapper" @ww-add="add($event)" @ww-remove="remove($event)">
            <wwObject v-for="(wwObject, index) in wwObject.content.data.wwObjects" :key="index" :ww-object="wwObject" :indexInBoundedParent="isRootCmsTemplate ? index : -1"></wwObject>
        </wwLayout>
    </div>
</template>

<!-- This is your Javascript -->
<!-- ✨ Here comes the magic ✨ -->
<script>
/* wwManager:start */
import { mapGetters } from 'vuex';
import makeStories from './stories';
/* wwManager:end */

export default {
    name: '__COMPONENT_NAME__',
    props: {
        // The wwObject controller object is passed. You can access it anytime
        wwObjectCtrl: Object
    },
    data() {
        return {
            /* wwManager:start */
            d_screens: ['lg', 'md', 'sm', 'xs']
            /* wwManager:end */
        };
    },
    computed: {
        // The wwObject contains all the info and data about the wwObject
        // Use it as you like !
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        c_style() {
            return { width: '100px', height: '100px' };
        },
        /* wwManager:start */
        ...mapGetters({ c_screen: 'front/getScreenSize' }),
        c_currentScreenOptions() {
            for (let screenIndex = this.d_screens.indexOf(this.c_screen); screenIndex > -1; screenIndex--) {
                if (this.wwObject.content.data.options[this.d_screens[screenIndex]]) {
                    return this.wwObject.content.data.options[this.d_screens[screenIndex]];
                }
            }
            for (let screenIndex = this.d_screens.indexOf(this.c_screen); screenIndex < this.d_screens.length; screenIndex++) {
                if (this.wwObject.content.data.options[this.d_screens[screenIndex]]) {
                    return this.wwObject.content.data.options[this.d_screens[screenIndex]];
                }
            }
            return {};
        },
        isRootCmsTemplate() {
            const { cms } = this.wwObject.content;
            return cms && Object(cms) === cms && Object(cms.bindings) === cms.bindings && cms.bindings.collection;
        }
        /* wwManager:end */
    },
    created() {
        this.initData();
        if (this.isRootCmsTemplate) this.initDataBindings();
    },
    methods: {
        isContainer(wwObject) {
            return wwObject.content.type === 'ww_container';
        },
        initData() {
            //Init objects
            let needUpdate = false;
            if (!this.wwObject.content.data.options) {
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'row',
                        reverse: false,
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '25%'
                    }
                };

                needUpdate = true;
            }

            if (!Array.isArray(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
                needUpdate = true;
            }

            if (needUpdate) {
                this.wwObjectCtrl.update(this.wwObject);
            }
        },
        /* wwManager:start */
        async initDataBindings() {
            const collectionDescriptor = this.wwObjectCtrl.getCmsCollection(this.wwObject.content.cms.bindings.collection);
            this.createBoundedChildren(collectionDescriptor);
            await this.wwObjectCtrl.update(this.wwObject);
        },

        async edit() {
            wwLib.wwObjectHover.setLock(this);

            const stories = makeStories(this.c_currentScreenOptions);
            Object.keys(stories).forEach(key => {
                wwLib.wwPopups.addStory(key, stories[key]);
            });

            let options = {
                firstPage: 'WWCONTAINER_EDIT',
                data: {
                    wwObject: this.wwObject
                }
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                if (!this.wwObject.content.data.options[this.c_screen]) {
                    this.wwObject.content.data.options[this.c_screen] = _.cloneDeep(this.wwObject.content.data.options.lg);
                }

                if (typeof result.direction != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].direction = result.direction;
                }

                if (typeof result.reverse != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].reverse = result.reverse;
                }

                if (typeof result.justifyContent != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].justifyContent = result.justifyContent;
                }

                if (typeof result.alignItems != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].alignItems = result.alignItems;
                }

                if (typeof result.flexWrap != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].flexWrap = result.flexWrap;
                }

                if (typeof result.minHeight != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].minHeight = result.minHeight;
                }

                await this.wwObjectCtrl.update(this.wwObject);

                await this.wwObjectCtrl.globalEdit(result);
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },
        async add(options) {
            this.wwObject.content.data.wwObjects.splice(options.index, 0, options.wwObject);
            await this.wwObjectCtrl.update(this.wwObject);
        },
        async remove(options) {
            this.wwObject.content.data.wwObjects.splice(options.index, 1);
            await this.wwObjectCtrl.update(this.wwObject);
        },

        async connectCmsCollection() {
            const {
                bindings: { collectionDescriptor }
            } = await this.wwObjectCtrl.connectCmsCollection();
            this.createBoundedChildren(collectionDescriptor);
            this.wwObjectCtrl.update(this.wwObject);
        },
        createBoundedChildren(collectionDescriptor) {
            const cmsTemplateId = this.wwObject.content.data.wwObjects[0].uniqueId;
            const cmsTemplate = this.wwObjectCtrl.getWwObjectById(cmsTemplateId);
            this.wwObject.content.cms = {
                bindings: {
                    collection: collectionDescriptor.name
                }
            };
            this.wwObject.content.data.wwObjects = collectionDescriptor.data.map(() => {
                return this.getCmsTemplateCopy(cmsTemplate);
            });
        },

        getCmsTemplateCopy(templateWwObject) {
            return JSON.parse(JSON.stringify(templateWwObject));
        }
        /* wwManager:end */
    }
};
</script>

<!-- This is your CSS -->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- Add lang="scss" or others to use computed CSS -->
<style lang="scss" scoped>
.ww-container {
}
</style>
