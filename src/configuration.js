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
    reverse: {
        label: { en: 'Reverse order', fr: "Inverser l'ordre" },
        type: 'TextRadioGroup',
        options: {
            choices: [
                { title: 'off', value: false, default: true, label: 'Off' },
                { title: 'on', value: true, label: 'On' },
            ],
        },
    },
};
const VERTICAL_ALIGN_ROW = {
    label: { en: 'Vertical alignement', fr: 'Alignement vertical' },
    type: 'TextRadioGroup',
    options: {
        choices: [
            { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-y-start' },
            { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-y-center' },
            { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-y-end' },
            { value: 'stretch', title: { en: 'Stretch', fr: 'Stretch' }, icon: 'align-y-stretch' },
            { value: 'baseline', title: { en: 'Baseline', fr: 'Baseline' }, icon: 'align-y-baseline' },
        ],
    },
};
const HORIZONTAL_ALIGN_ROW = {
    label: { en: 'Horizontal alignement', fr: 'Horizontal vertical' },
    type: 'TextRadioGroup',
    options: {
        choices: [
            { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-x-start' },
            { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-x-center' },
            { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-x-end' },
            { value: 'space-around', title: { en: 'Space around', fr: 'Space around' }, icon: 'align-x-space-around' },
            {
                value: 'space-between',
                title: { en: 'Space between', fr: 'Space between' },
                icon: 'align-x-space-between',
            },
        ],
    },
};
const VERTICAL_ALIGNEMENT_COLUMN = {
    type: 'TextRadioGroup',
    options: {
        choices: [
            { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-x-start-vertical' },
            { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-x-center-vertical' },
            { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-x-end-vertical' },
            {
                value: 'space-around',
                title: { en: 'Space around', fr: 'Space around' },
                icon: 'align-x-space-around-vertical',
            },
            {
                value: 'space-between',
                title: { en: 'Space between', fr: 'Space between' },
                icon: 'align-x-space-between-vertical',
            },
        ],
    },
};

const COLUMN_GAP = {
    label: { en: 'Column Gap', fr: 'Esp. Col.' },
    type: 'Length',
    options: {
        unitChoices: [{ value: 'px', label: 'px', min: 0, max: 50 }],
    },
};

const TYPE = {
    label: { en: 'Arrangement', fr: 'Arrangement' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'grid', label: { en: 'Columns', fr: 'Colonnes' } },
            { value: 'flex', label: { en: 'Row (flex)', fr: 'Row (flex)' } },
        ],
    },
};

const BEHAVIOR = {
    label: { en: 'Line breaks (wrap)', fr: 'Line breaks (wrap)' },
    type: 'TextSelect',
    options: {
        options: [
            { value: 'fit', label: { en: 'Fit onto one line', fr: 'Sur une ligne' } },
            { value: 'wrap', label: { en: 'Wrap onto multiple lines', fr: 'A la ligne' } },
            { value: 'scroll', label: { en: 'Scroll onto one line', fr: 'Scroll sur une ligne' } },
        ],
    },
};

const PUSH_LAST = {
    label: { en: 'Push last to the end', fr: 'Push last to the end' },
    type: 'TextRadioGroup',
    options: {
        choices: [
            { title: 'off', value: false, label: 'Off' },
            { title: 'on', value: true, label: 'On' },
        ],
    },
};

function getGridAndDisplay(disabled, content) {
    const gridAndDisplay = {
        lengthInUnitRadio: {
            path: 'lengthInUnit',
            label: { en: 'Grid system', fr: 'Grille' },
            type: 'TextRadioGroup',
            options: {
                choices: [
                    { title: 'Percentage', value: 100, label: '%' },
                    { title: 'Columns', value: 12, label: 'U', default: true },
                ],
                disabled,
            },
        },
        ...(content.lengthInUnit === 100
            ? null
            : {
                  lengthInUnit: {
                      label: { en: 'Number of units', fr: "Nb d'unité" },
                      type: 'Number',
                      options: {
                          disabled,
                      },
                  },
              }),
    };

    gridAndDisplay[`grid-display`] = {
        path: 'gridDisplay',
        isArray: true,
        label: { en: `Show Col. IDX`, fr: `Aff. Col. IDX` },
        type: 'TextRadioGroup',
        options: {
            choices: [
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
            ],
        },
    };

    return gridAndDisplay;
}

export function getRowConfiguration(content) {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            type: TYPE,
            ...(content.type === 'grid' ? { behavior: BEHAVIOR } : null),
            alignItems: VERTICAL_ALIGN_ROW,
            ...(content.type === 'flex' || content.behavior === 'wrap'
                ? { justifyContent: HORIZONTAL_ALIGN_ROW }
                : null),
            ...(content.type === 'flex' ? { pushLast: PUSH_LAST } : null),
            // ...(content.type === 'flex' ? { columnGap: COLUMN_GAP } : null),
        },
        settingsOptions: getGridAndDisplay(content.type === 'flex', content),
    };
}

export function getColumnConfiguration(content) {
    return {
        styleOptions: {
            ...COMMON_STYLE,
            justifyContent: {
                ...VERTICAL_ALIGNEMENT_COLUMN,
                label: { en: 'Vertical alignement', fr: 'Alignement vertical' },
            },
            pushLast: PUSH_LAST,
        },
        settingsOptions: getGridAndDisplay(true, content),
    };
}
