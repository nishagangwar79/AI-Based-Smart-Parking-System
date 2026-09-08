import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, Car, CreditCard } from 'lucide-react';
import { getParkingLotById, getParkingSlotById } from '../services/parkingService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { formatCurrency, toDateTimeLocal } from '../utils/formatters';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const lotId = searchParams.get('lot');
  const slotId = searchParams.get('slot');

  const [lot, setLot] = useState(null);
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    startTime: toDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
    endTime: toDateTimeLocal(new Date(Date.now() + 4 * 60 * 60 * 1000)),
    vehicleNumber: user?.vehicleNumber || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!lotId || !slotId) {
        setLoading(false);
        return;
      }
      try {
        const [lotData, slotData] = await Promise.all([
          getParkingLotById(lotId),
          getParkingSlotById(slotId),
        ]);
        setLot(lotData);
        setSlot(slotData);
      } catch {
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lotId, slotId]);

  const start = new Date(form.startTime);
  const end = new Date(form.endTime);
  const durationMs = end - start;
  const duration = durationMs > 0 ? Math.ceil(durationMs / (1000 * 60 * 60)) : 0;
  const pricePerHour = slot?.pricePerHour || lot?.pricePerHour || 0;
  const totalAmount = duration > 0 ? Math.round(pricePerHour * duration) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        parkingLot: lotId,
        parkingSlot: slotId,
        vehicleNumber: form.vehicleNumber,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      toast.success('Booking confirmed!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading fullScreen message="Loading booking form..." />;

  if (!lotId || !slotId || !lot || !slot) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Invalid booking request</h2>
        <p className="text-slate-500 mt-2">Please select a parking slot first.</p>
        <button onClick={() => navigate('/parking')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Browse Parking
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-900">{lot.name}</h3>
            <p className="text-sm text-slate-500">{lot.location} · Slot {slot.slotNumber} ({slot.slotType})</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" /> Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" /> End Time
            </label>
            <input
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Car className="w-4 h-4 inline mr-1" /> Vehicle Number
            </label>
            <input
              type="text"
              required
              value={form.vehicleNumber}
              onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="DL01AB1234"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || duration <= 0}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
              Booking Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Parking Lot</span>
                <span className="font-medium text-right">{lot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slot</span>
                <span className="font-medium">{slot.slotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rate</span>
                <span className="font-medium">{formatCurrency(pricePerHour)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">{duration > 0 ? `${duration} hour${duration > 1 ? 's' : ''}` : '—'}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-indigo-600 text-lg">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
