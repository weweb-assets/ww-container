export default {
    "editor": {
        "label": { "en": "Container - Legacy", "fr": "Container - Legacy" },
        icon: 'exclamation',
    },
    properties: {
        wwObjects: {
            bindable: "repeatable",
            type: 'Info',
            "label": {
                "en": "Data to repeat",
                "fr": "Données à répéter"
            },
            options: {
                text: 'Select'
            },
            defaultValue: []
        },
        grid: {
            hidden: true,
            defaultValue: []
        },
        gridDisplay: {
            hidden: true,
            defaultValue: []
        },
        direction: {
            label: { en: 'Direction', fr: 'Direction' },
            type: 'TextSelect',
            options: {
                options: [
                    { value: 'row', label: { en: 'Horizontal', fr: 'Horizontal' } },
                    { value: 'column', label: { en: 'Vertical', fr: 'Vertical' } },
                ],
            },
            responsive: true,
            defaultValue: 'row'
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
            responsive: true,
            defaultValue: false
        },
        type: {
            label: { en: 'Arrangement', fr: 'Arrangement' },
            type: 'TextSelect',
            hidden: content => content.direction !== 'row',
            options: {
                options: [
                    { value: 'grid', label: { en: 'Columns', fr: 'Colonnes' } },
                    { value: 'flex', label: { en: 'Row (flex)', fr: 'Row (flex)' } },
                ],
            },
            responsive: true,
            defaultValue: 'grid'
        },
        behavior: {
            hidden: content => content.direction !== 'row' || content.type !== 'grid',
            label: { en: 'Line breaks (wrap)', fr: 'Line breaks (wrap)' },
            type: 'TextSelect',
            options: (content, sidepanelContent, boundProps) => {
                const isBound = boundProps && boundProps.wwObjects;
                return {
                    options: [
                        ...(isBound ? [] : [{ value: 'fit', label: { en: 'Fit onto one line', fr: 'Sur une ligne' } }]),
                        { value: 'wrap', label: { en: 'Wrap onto multiple lines', fr: 'A la ligne' } },
                        { value: 'scroll', label: { en: 'Scroll onto one line', fr: 'Scroll sur une ligne' } },
                    ],
                }
            },
            responsive: true,
            defaultValue: 'fit'
        },
        alignItems: {
            label: { en: 'Vertical alignment', fr: 'Alignement vertical' },
            type: 'TextRadioGroup',
            hidden: content => content.direction !== 'row',
            options: {
                choices: [
                    { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-y-start' },
                    { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-y-center' },
                    { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-y-end' },
                    { value: 'stretch', title: { en: 'Stretch', fr: 'Stretch' }, icon: 'align-y-stretch' },
                    { value: 'baseline', title: { en: 'Baseline', fr: 'Baseline' }, icon: 'align-y-baseline' },
                ],
            },
            responsive: true,
            defaultValue: 'start'
        },
        justifyContent: {
            label: { en: 'Alignment', fr: 'Alignement' },
            type: 'TextRadioGroup',
            options: (content) =>  {
                return  {
                    choices: content.direction === 'row' ? [
                        { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-x-start' },
                        { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-x-center' },
                        { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-x-end' },
                        { value: 'space-around', title: { en: 'Space around', fr: 'Space around' }, icon: 'align-x-space-around' },
                        {
                            value: 'space-between',
                            title: { en: 'Space between', fr: 'Space between' },
                            icon: 'align-x-space-between',
                        },
                    ] : 
                    [
                        { value: 'flex-start', title: { en: 'Start', fr: 'Début' }, icon: 'align-y-start' },
                        { value: 'center', title: { en: 'Center', fr: 'Milieu' }, icon: 'align-y-center' },
                        { value: 'flex-end', title: { en: 'End', fr: 'Fin' }, icon: 'align-y-end' },
                        { value: 'stretch', title: { en: 'Stretch', fr: 'Stretch' }, icon: 'align-y-stretch' },
                        { value: 'baseline', title: { en: 'Baseline', fr: 'Baseline' }, icon: 'align-y-baseline' },
                    ],
                }
            },
            responsive: true,
            defaultValue: 'center'
        },
        pushLast: {
            hidden: content => content.direction === 'row' && content.type !== 'flex',
            label: { en: 'Push last to the end', fr: 'Push last to the end' },
            type: 'TextRadioGroup',
            options: {
                choices: [
                    { title: 'off', value: false, label: 'Off' },
                    { title: 'on', value: true, label: 'On' },
                ],
            },
            responsive: true,
            defaultValue: false
        },
        lengthInUnit: {
            label: { en: 'Number of units', fr: "Nb d'unité" },
            type: 'Number',
            options: content => ({
                disabled: content.type === 'flex' || content.direction === 'column',
            }),
            section: 'settings',
            responsive: true,
            defaultValue: 100
        },
    }
}
