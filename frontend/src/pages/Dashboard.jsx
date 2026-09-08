import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, Sparkles, TrendingUp, ArrowRight, MapPin } from 'lucide-react';
import { getParkingLots } from '../services/parkingService';
import { getMyBookings } from '../services/bookingService';
import { getRecommendation, getPrediction } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import BookingCard from '../components/BookingCard';
import { formatCurrency, capitalize } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotsData, bookingsData, recData, predData] = await Promise.all([
          getParkingLots(),
          getMyBookings(),
          getRecommendation({
            userLocation: 'Delhi',
            vehicleType: user?.vehicleType || 'car',
            desiredDuration: 2,
            preferredParkingType: 'any',
          }).catch(() => null),
          getPrediction().catch(() => null),
        ]);
        setLots(lotsData);
        setBookings(bookingsData);
        setRecommendation(recData);
        setPrediction(predData);
      } catch {
        /* handled by empty states */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Loading fullScreen message="Loading dashboard..." />;

  const activeBooking = bookings.find(
    (b) => b.status === 'confirmed' && new Date(b.endTime) > new Date()
  );
  const recentBookings = bookings.slice(0, 3);
  const totalAvailable = lots.reduce((sum, l) => sum + l.availableSlots, 0);

  const demandColors = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here's your parking overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Slots', value: totalAvailable, icon: Car, color: 'text-emerald-600' },
          { label: 'Parking Lots', value: lots.length, icon: MapPin, color: 'text-indigo-600' },
          { label: 'My Bookings', value: bookings.length, icon: Calendar, color: 'text-blue-600' },
          { label: 'Demand Level', value: capitalize(prediction?.demandLevel || 'N/A'), icon: TrendingUp, color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <Icon className={`w-8 h-8 ${color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Booking */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Booking</h2>
          {activeBooking ? (
            <BookingCard booking={activeBooking} />
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No active bookings</p>
              <Link to="/parking" className="inline-flex items-center mt-3 text-indigo-600 text-sm font-medium">
                Find Parking <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
          <div className="flex items-center mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-slate-900">AI Recommendation</h2>
          </div>
          {recommendation?.recommendedLot ? (
            <div>
              <h3 className="font-medium text-indigo-900">{recommendation.recommendedLot.name}</h3>
              <p className="text-sm text-slate-600 mt-2">{recommendation.reason}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-indigo-700">
                  Est. {formatCurrency(recommendation.estimatedPrice)} for {recommendation.duration}hr
                </span>
                <Link to="/ai-recommendation" className="text-sm text-indigo-600 font-medium hover:underline">
                  Customize
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">Get personalized parking recommendations based on your preferences.</p>
          )}
        </div>
      </div>

      {/* Demand Prediction */}
      {prediction && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Parking Demand Prediction</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${demandColors[prediction.demandLevel]}`}>
              {capitalize(prediction.demandLevel)} Demand
            </span>
          </div>
          <p className="text-sm text-slate-600">{prediction.explanation}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <span className="text-slate-500">Best time: <strong className="text-slate-800">{prediction.suggestedBestTime}</strong></span>
            <span className="text-slate-500">Availability: <strong className="text-slate-800">{prediction.expectedAvailability}</strong></span>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
          <Link to="/my-bookings" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
        </div>
        {recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-6">No bookings yet. Start by finding a parking lot!</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {[
          { to: '/parking', label: 'Find Parking', icon: Car },
          { to: '/ai-recommendation', label: 'AI Recommend', icon: Sparkles },
          { to: '/ai-assistant', label: 'AI Chat', icon: Sparkles },
          { to: '/my-bookings', label: 'My Bookings', icon: Calendar },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all">
            <Icon className="w-6 h-6 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
