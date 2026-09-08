import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Car, ArrowLeft } from 'lucide-react';
import { getParkingLotById, getParkingSlots } from '../services/parkingService';
import ParkingSlotCard from '../components/ParkingSlotCard';
import Loading from '../components/Loading';
import { formatCurrency } from '../utils/formatters';

const ParkingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotData, slotsData] = await Promise.all([
          getParkingLotById(id),
          getParkingSlots({ parkingLot: id }),
        ]);
        setLot(lotData);
        setSlots(slotsData);
      } catch {
        setLot(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loading fullScreen message="Loading parking details..." />;
  if (!lot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Parking lot not found</h2>
        <Link to="/parking" className="text-indigo-600 mt-4 inline-block">Back to Parking Lots</Link>
      </div>
    );
  }

  const filteredSlots = statusFilter === 'all' ? slots : slots.filter((s) => s.status === statusFilter);
  const statusCounts = {
    available: slots.filter((s) => s.status === 'available').length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    reserved: slots.filter((s) => s.status === 'reserved').length,
    maintenance: slots.filter((s) => s.status === 'maintenance').length,
  };

  const handleBook = () => {
    if (selectedSlot) {
      navigate(`/booking?lot=${lot._id}&slot=${selectedSlot._id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/parking" className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Parking Lots
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{lot.name}</h1>
        <div className="flex items-center text-slate-500 mt-2">
          <MapPin className="w-4 h-4 mr-1" /> {lot.location} — {lot.address}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-slate-50 rounded-lg">
            <Car className="w-5 h-5 text-indigo-600 mb-1" />
            <div className="text-sm text-slate-500">Price</div>
            <div className="font-semibold">{formatCurrency(lot.pricePerHour)}/hr</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <Clock className="w-5 h-5 text-indigo-600 mb-1" />
            <div className="text-sm text-slate-500">Hours</div>
            <div className="font-semibold">{lot.openingTime} - {lot.closingTime}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <div className="text-sm text-emerald-600">Available</div>
            <div className="font-semibold text-emerald-800">{statusCounts.available} slots</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-500">Total</div>
            <div className="font-semibold">{lot.totalSlots} slots</div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { status: 'all', label: 'All', count: slots.length },
          { status: 'available', label: 'Available', count: statusCounts.available },
          { status: 'occupied', label: 'Occupied', count: statusCounts.occupied },
          { status: 'reserved', label: 'Reserved', count: statusCounts.reserved },
          { status: 'maintenance', label: 'Maintenance', count: statusCounts.maintenance },
        ].map(({ status, label, count }) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Slot Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Select a Parking Slot</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredSlots.map((slot) => (
            <ParkingSlotCard
              key={slot._id}
              slot={slot}
              selected={selectedSlot?._id === slot._id}
              onSelect={setSelectedSlot}
            />
          ))}
        </div>

        {selectedSlot && (
          <div className="mt-6 flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
            <div>
              <span className="font-medium text-indigo-900">Selected: Slot {selectedSlot.slotNumber}</span>
              <span className="text-sm text-indigo-600 ml-2">({formatCurrency(selectedSlot.pricePerHour)}/hr)</span>
            </div>
            <button
              onClick={handleBook}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Book This Slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingDetails;
