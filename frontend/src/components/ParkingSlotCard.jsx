import { capitalize } from '../utils/formatters';

const ParkingSlotCard = ({ slot, selected, onSelect, selectable = true }) => {
  const statusClass = {
    available: 'slot-available',
    occupied: 'slot-occupied',
    reserved: 'slot-reserved',
    maintenance: 'slot-maintenance',
  }[slot.status] || 'slot-maintenance';

  const isSelectable = selectable && slot.status === 'available';

  return (
    <button
      type="button"
      onClick={() => isSelectable && onSelect?.(slot)}
      disabled={!isSelectable}
      className={`
        p-3 rounded-lg border-2 text-center transition-all
        ${statusClass}
        ${selected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105' : ''}
        ${isSelectable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-80'}
      `}
    >
      <div className="font-bold text-sm">{slot.slotNumber}</div>
      <div className="text-xs mt-1 capitalize">{slot.slotType}</div>
      <div className="text-xs mt-0.5 capitalize font-medium">{slot.status}</div>
      {slot.floor !== undefined && (
        <div className="text-xs opacity-75">Floor {slot.floor}</div>
      )}
    </button>
  );
};

export default ParkingSlotCard;
