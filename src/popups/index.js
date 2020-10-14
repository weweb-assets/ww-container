import './stories';

export default async function openPopup(options) {
    try {
        const updatedOptions = await wwLib.wwPopups.open({ firstPage: 'WWCONTAINER_LAYOUT', data: { options } });
        return { options: updatedOptions };
    } catch (err) {
        return null;
    }
}
