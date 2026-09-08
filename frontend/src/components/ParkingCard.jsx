import { Link } from 'react-router-dom';
import { MapPin, Clock, Car, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const ParkingCard = ({ lot }) => {
  const availabilityPercent = lot.totalSlots > 0
    ? Math.round((lot.availableSlots / lot.totalSlots) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{lot.name}</h3>
            <div className="flex items-center text-slate-500 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{lot.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            availabilityPercent > 50 ? 'bg-emerald-100 text-emerald-700' :
            availabilityPercent > 20 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {lot.availableSlots}/{lot.totalSlots} free
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{lot.address}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-slate-600">
            <Car className="w-4 h-4 mr-2 text-indigo-500" />
            {formatCurrency(lot.pricePerHour)}/hr
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-2 text-indigo-500" />
            {lot.openingTime} - {lot.closingTime}
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full ${
              availabilityPercent > 50 ? 'bg-emerald-500' :
              availabilityPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${availabilityPercent}%` }}
          />
        </div>

        <Link
          to={`/parking/${lot._id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default ParkingCard;
