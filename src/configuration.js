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
            { value: 'space-around', label: { en: 'Space around', fr: 'Space around' } },
            { value: 'space-between', label: { en: 'Space between', fr: 'Space between' } },
        ],
    },
};
const TYPE = {
    label: { en: 'Type', fr: 'Type' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'grid', label: { en: 'Grid', fr: 'Grille' } },
            { value: 'flex', label: { en: 'Flex', fr: 'Flex' } },
        ],
    },
};

const BEHAVIOR = {
    label: { en: 'Overflow', fr: 'Overflow' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'fit', label: { en: 'None', fr: 'Aucun' } },
            { value: 'wrap', label: { en: 'Wrap', fr: 'A la ligne' } },
            { value: 'scroll', label: { en: 'Scroll', fr: 'Scroll' } },
        ],
    },
};

function getGrid(disabled) {
    return {
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
                disabled,
            },
        },
        lengthInUnit: {
            label: { en: 'Nb of units', fr: "Nb d'unité" },
            type: 'Number',
            options: {
                disabled,
            },
        },
    };
}

export function getRowConfiguration(content) {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            type: TYPE,
            ...(content.type === 'grid' ? { behavior: BEHAVIOR } : null),
            alignItems: ALIGN_ITEMS,
            ...(content.type === 'flex' || content.behavior === 'wrap' ? { justifyContent: JUSTIFY_CONTENT } : null),
        },
        settingsOptions: getGrid(content.type === 'flex'),
    };
}

export function getColumnConfiguration() {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            justifyContent: JUSTIFY_CONTENT,
        },
        settingsOptions: getGrid(true),
    };
}
