const COMMON_STYLE = {
    direction: {
        label: { en: 'Direction', fr: 'Direction' },
        type: 'TextSelect',
        options: {
            options: [
                { value: 'row', label: { en: 'Horizontal', fr: 'Horizontal' } },
                { value: 'column', label: { en: 'Vertical', fr: 'Vertical' } },
            ],
        },
    },
};
const ALIGN_ITEMS = {
    label: { en: 'Alignement', fr: 'Alignement' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'flex-start', label: { en: 'Start', fr: 'Début' } },
            { value: 'center', label: { en: 'Center', fr: 'Milieu' } },
            { value: 'flex-end', label: { en: 'End', fr: 'Fin' } },
        ],
    },
};
const JUSTIFY_CONTENT = {
    label: { en: 'Justify content', fr: 'Alignement du contenu' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'flex-start', label: { en: 'Start', fr: 'Début' } },
            { value: 'center', label: { en: 'Center', fr: 'Milieu' } },
            { value: 'flex-end', label: { en: 'End', fr: 'Fin' } },
        ],
    },
};

export function getRowConfiguration(content) {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            behavior: {
                label: { en: 'Behavior', fr: 'Comportement' },
                type: 'TextSelect',
                options: {
                    options: [
                        { value: 'fit', label: { en: 'Fit to container', fr: 'Taille du parent' } },
                        { value: 'wrap', label: { en: 'Wrap', fr: 'A la ligne' } },
                        { value: 'scroll', label: { en: 'Scroll', fr: 'Scroll' } },
                    ],
                },
            },
            alignItems: ALIGN_ITEMS,
            ...(content.behavior !== 'fit' && { justifyContent: JUSTIFY_CONTENT }),
        },
        settingsOptions: {
            lengthInUnitRadio: {
                path: 'lengthInUnit',
                label: { en: 'Layout grid', fr: 'Grille' },
                type: 'TextRadioGroup',
                options: {
                    choices: [
                        { title: 'Percentage', value: 100, label: '%' },
                        { title: '12 columns', value: 12, label: '12col' },
                        { title: 'Portrait', value: 6, label: '6col' },
                    ],
                },
            },
            lengthInUnit: {
                label: { en: 'Nb of units', fr: "Nb d'unité" },
                type: 'Number',
            },
        },
    };
}

export function getColumnConfiguration() {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            justifyContent: JUSTIFY_CONTENT,
        },
    };
}
