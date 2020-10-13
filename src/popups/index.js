import './stories';

export default async function openPopup(content) {
    try {
        return await wwLib.wwPopups.open({ firstPage: 'WWCONTAINER_LAYOUT', data: { content } });
    } catch (err) {
        return null;
    }
}
