import './stories';

export default async function openPopup({ direction }) {
    try {
        return await wwLib.wwPopups.open({ firstPage: 'WWCONTAINER_LAYOUT', data: { direction } });
    } catch (err) {
        return null;
    }
}
