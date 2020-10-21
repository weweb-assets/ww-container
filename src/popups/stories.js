wwLib.wwPopups.addStory('WWCONTAINER_LAYOUT', {
    title: {
        en: "Container's layout",
        fr: 'Disposition du container',
    },
    type: 'wwPopupForm',
    buttons: {
        OK: {
            text: {
                en: 'Ok',
                fr: 'Valider',
            },
            next: false,
        },
    },
    storyData: {
        fields: [
            {
                label: {
                    en: "Container's layout",
                    fr: 'Disposition du container',
                },
                desc: {
                    en: 'Set layout to column or row.',
                    fr: 'Changer la disposition du container en colonne ou en ligne.',
                },
                type: 'select',
                key: 'direction',
                valueData: 'direction',
                options: {
                    values: [
                        {
                            value: 'column',
                            text: {
                                en: 'Column',
                                fr: 'Colonne',
                            },
                        },
                        {
                            value: 'row',
                            text: {
                                en: 'Row',
                                fr: 'Ligne',
                            },
                        },
                    ],
                },
            },
        ],
    },
});
