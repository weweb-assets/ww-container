<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
    <div class="ww-container" v-style="c_style">
        <wwLayout :options="wwObject.content.data.options" tag="div" :ww-list="wwObject.content.data.wwObjects" class="wwobjects-wrapper" @ww-add="add($event)" @ww-remove="remove($event)">
            <wwObject v-for="wwObject in wwObject.content.data.wwObjects" :key="wwObject.uniqueId" :ww-object="wwObject"></wwObject>
        </wwLayout>
    </div>
</template>

<!-- This is your Javascript -->
<!-- ✨ Here comes the magic ✨ -->
<script>
/* wwManager:start */
import { mapGetters } from 'vuex';
/* wwManager:end */
const wwu = window.wwLib.wwUtils;

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
            return {};
        },
        isConnectedToCms() {
            return !!this.wwObject.content.cms;
        },
        canAddContent() {
            return !this.isConnectedToCms;
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
        }
        /* wwManager:end */
    },
    methods: {
        initData() {
            //Init objects
            let needUpdate = false;
            if (!this.wwObject.content.data.options) {
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'column',
                        reverse: false,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '50%'
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
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            let editList = {
                SELECT_LAYOUT: {
                    separator: {
                        en: "Container's layout",
                        fr: 'Disposition du container'
                    },
                    title: {
                        en: "Container's layout",
                        fr: 'Disposition du container'
                    },
                    desc: {
                        en: 'Set layout to column or row.',
                        fr: 'Changer la disposition du container en colonne ou en ligne.'
                    },
                    icon: 'fas fa-columns',
                    shortcut: 'l',
                    next: 'WWCONTAINER_LAYOUT'
                }
            };

            wwLib.wwPopups.addStory('WWCONTAINER_EDIT', {
                title: {
                    en: 'Edit Container',
                    fr: 'Editer le container'
                },
                type: 'wwPopupEditWwObject',
                buttons: null,
                storyData: {
                    list: editList
                }
            });

            wwLib.wwPopups.addStory('WWCONTAINER_LAYOUT', {
                title: {
                    en: "Container's layout",
                    fr: 'Disposition du container'
                },
                type: 'wwPopupForm',
                buttons: {
                    OK: {
                        text: {
                            en: 'Ok',
                            fr: 'Valider'
                        },
                        next: false
                    }
                },
                storyData: {
                    fields: [
                        {
                            label: {
                                en: "Container's layout",
                                fr: 'Disposition du container'
                            },
                            desc: {
                                en: 'Set layout to column or row.',
                                fr: 'Changer la disposition du container en colonne ou en ligne.'
                            },
                            type: 'select',
                            key: 'direction',
                            value: this.c_currentScreenOptions.direction,
                            options: {
                                wwObject: {},
                                values: [
                                    {
                                        value: 'column',
                                        text: {
                                            en: 'Column',
                                            fr: 'Colonne'
                                        }
                                    },
                                    {
                                        value: 'row',
                                        default: true,
                                        text: {
                                            en: 'Row',
                                            fr: 'Ligne'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            label: {
                                en: "Reverse elements' order",
                                fr: "Inverser l'ordre des élements"
                            },
                            desc: {
                                en: 'Show element in reverse order.',
                                fr: 'Afficher les élements dans un sens inversé.'
                            },
                            type: 'radio',
                            key: 'reverse',
                            value: this.c_currentScreenOptions.reverse
                        },
                        {
                            label: {
                                en: "Elements' position on primary axis",
                                fr: "Position des élements sur l'axe principal"
                            },
                            desc: {
                                en: '',
                                fr: ''
                            },
                            type: 'select',
                            key: 'justifyContent',
                            value: this.c_currentScreenOptions.justifyContents,
                            options: {
                                wwObject: {},
                                values: [
                                    {
                                        value: 'flex-start',
                                        text: {
                                            en: 'Start',
                                            fr: 'Début'
                                        }
                                    },
                                    {
                                        value: 'center',
                                        default: true,
                                        text: {
                                            en: 'Center',
                                            fr: 'Millieu'
                                        }
                                    },
                                    {
                                        value: 'flex-end',
                                        text: {
                                            en: 'End',
                                            fr: 'Fin'
                                        }
                                    },
                                    {
                                        value: 'space-between',
                                        text: {
                                            en: 'Space between elements',
                                            fr: 'Espace entre les élements'
                                        }
                                    },
                                    {
                                        value: 'space-around',
                                        text: {
                                            en: 'Space around elements',
                                            fr: 'Espace autours des élements'
                                        }
                                    },
                                    {
                                        value: 'space-evenly',
                                        text: {
                                            en: 'Even Spaces around elements',
                                            fr: 'Espace égaux autours des élements'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            label: {
                                en: "Elements' position on secondary axis",
                                fr: "Position des élements sur l'axe secondaire"
                            },
                            desc: {
                                en: '',
                                fr: ''
                            },
                            type: 'select',
                            key: 'alignItems',
                            value: this.c_currentScreenOptions.alignItems,
                            options: {
                                wwObject: {},
                                values: [
                                    {
                                        value: 'flex-start',
                                        text: {
                                            en: 'Start',
                                            fr: 'Début'
                                        }
                                    },
                                    {
                                        value: 'center',
                                        default: true,
                                        text: {
                                            en: 'Center',
                                            fr: 'Millieu'
                                        }
                                    },
                                    {
                                        value: 'flex-end',
                                        text: {
                                            en: 'End',
                                            fr: 'Fin'
                                        }
                                    },
                                    {
                                        value: 'stretch',
                                        text: {
                                            en: 'Stretch',
                                            fr: 'Etirer'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            label: {
                                en: 'Wrap elements if needed (For rows only)',
                                fr: "Mettre les élements à la ligne si necessaire (Pour l'affichage en lignes seulement)"
                            },
                            desc: {
                                en: '',
                                fr: ''
                            },
                            type: 'radio',
                            key: 'flexWrap',
                            value: this.c_currentScreenOptions.flexWrap === 'wrap'
                        },
                        {
                            label: {
                                en: 'Min height',
                                fr: 'Hauteur minumale'
                            },
                            desc: {
                                en: "Use 'px' or '%' as unit.",
                                fr: "Utiliser 'px' ou '%' comme unité."
                            },
                            type: 'text',
                            key: 'minHeight',
                            value: this.c_currentScreenOptions.minHeight
                        }
                    ]
                }
            });

            let options = {
                firstPage: 'WWCONTAINER_EDIT',
                data: {
                    wwObject: this.wwObject
                }
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                /*=============================================m_ÔÔ_m=============================================\
                  LAYOUT
                \================================================================================================*/
                /*
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'column',
                        reverse: false,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '50%'
                    }
                };
                */

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

                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },
        add(options) {
            if (!Array.isArray(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
            }
            this.wwObject.content.data.wwObjects.splice(options.index, 0, options.wwObject);
            this.wwObjectCtrl.update(this.wwObject);
        },
        remove(options) {
            if (_.isEmpty(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
            }

            this.wwObject.content.data.wwObjects.splice(options.index, 1);

            this.wwObjectCtrl.update(this.wwObject);
        },
        async connectCmsCollection() {
            const {
                bindings: { collection }
            } = await this.wwObjectCtrl.connectCmsCollection(this.wwObject);
            const templateWwObject = this.cloneTemplateWwObject(this.wwObject.content.data.wwObjects[0]);
            this.duplicateElements(collection, templateWwObject);
            this.wwObject.content.cms = {
                collection: collection.name,
                template: {
                    ...templateWwObject
                }
            };
            this.wwObjectCtrl.update(this.wwObject);
        },
        duplicateElements(collection, templateWwObject) {
            this.wwObject.content.data.wwObjects = collection.data.map((item, index) => {
                const clone = this.cloneTemplateWwObject(templateWwObject);
                clone.content.cms = {
                    bindings: {
                        collection: collection.name,
                        index
                    }
                };
                return clone;
            });
        },
        cloneTemplateWwObject(templateWwObject) {
            const clone = JSON.parse(JSON.stringify(templateWwObject));
            wwu.changeUniqueIds(clone);
            clone.uniqueId = wwu.getUniqueId();
            return clone;
        }
        /* wwManager:end */
    },
    created() {
        this.initData();
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
