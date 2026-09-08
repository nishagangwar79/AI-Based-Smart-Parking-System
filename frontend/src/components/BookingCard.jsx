import { MapPin, Clock, Calendar, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusColor, capitalize } from '../utils/formatters';

const BookingCard = ({ booking, onCancel, showCancel = false }) => {
  const canCancel = showCancel && booking.status === 'confirmed' && new Date(booking.startTime) > new Date();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900">{booking.parkingLot?.name}</h3>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {booking.parkingLot?.location} · Slot {booking.parkingSlot?.slotNumber}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {capitalize(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
          {formatDateTime(booking.startTime)}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-indigo-500" />
          {booking.duration} hr · {formatCurrency(booking.totalAmount)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">Vehicle: {booking.vehicleNumber}</span>
        {canCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
