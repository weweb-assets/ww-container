const SIZE_HEIGHT = {
    auto: true,
    ratio: false,
    fixed: [
        {
            unit: 'px',
            min: 1,
            max: 1000,
        },
        {
            unit: 'vh',
            min: 1,
            max: 100,
        },
    ],
};

const COMMON_STYLE = {
    direction: {
        label: { en: 'Direction', fr: 'Direction' },
        type: 'TextSelect',
        options: {
            options: [
                { value: 'row', label: { en: 'Vertical', fr: 'Vertical' } },
                { value: 'column', label: { en: 'Horizontal', fr: 'Horizontal' } },
            ],
        },
    },
    alignItems: {
        label: { en: 'Alignement', fr: 'Alignement' },
        type: 'TextSelect',
        options: {
            options: [
                { value: 'flex-start', label: { en: 'Start', fr: 'Début' } },
                { value: 'center', label: { en: 'Center', fr: 'Milieu' } },
                { value: 'flex-end', label: { en: 'End', fr: 'Fin' } },
            ],
        },
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
            width: {
                label: { en: 'Width', fr: 'Longueur' },
                type: 'TextSelect',
                options: {
                    options: [
                        { value: 'fit', label: { en: 'Fit to container', fr: 'Taille du parent' } },
                        { value: 'wrap', label: { en: 'Wrap', fr: 'A la ligne' } },
                        { value: 'scroll', label: { en: 'Scroll', fr: 'Scroll' } },
                    ],
                },
            },
            ...(content.width !== 'fit' && { justifyContent: JUSTIFY_CONTENT }),
        },
        settingsOptions: {
            lengthInUnit: {
                label: { en: 'Nb of units', fr: "Nb d'unité" },
                type: 'Number',
            },
        },
        size: {
            height: SIZE_HEIGHT,
            width: false,
            maxWidth: false,
        },
    };
}

export function getColumnConfiguration() {
    return {
        styleOptions: {
            ...COMMON_STYLE,
        },
        size: {
            height: SIZE_HEIGHT,
        },
    };
}
