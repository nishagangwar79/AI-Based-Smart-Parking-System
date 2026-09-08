import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import BookingCard from '../components/BookingCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (filter === 'upcoming') return b.status === 'confirmed' && new Date(b.startTime) > now;
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">View and manage your parking bookings</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading message="Loading bookings..." />
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              showCancel
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No bookings found"
          message="You haven't made any bookings yet."
          action={
            <Link to="/parking" className="inline-flex px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
              Find Parking
            </Link>
          }
        />
      )}
    </div>
  );
};

export default MyBookings;
