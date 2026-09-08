import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Clock, Car, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRecommendation, getPrediction } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { formatCurrency, capitalize } from '../utils/formatters';

const AIRecommendation = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    userLocation: 'Delhi',
    vehicleType: user?.vehicleType || 'car',
    desiredDuration: 2,
    preferredParkingType: 'any',
  });

  const [recommendation, setRecommendation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchAdvice = async (searchParams) => {
    setLoading(true);
    try {
      const [recData, predData] = await Promise.all([
        getRecommendation(searchParams),
        getPrediction(),
      ]);
      setRecommendation(recData);
      setPrediction(predData);
    } catch (err) {
      toast.error(err.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice(form);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAdvice(form);
  };

  const demandColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    high: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI Parking Recommendation</h1>
            <p className="text-slate-500 text-sm">Powered by Gemini AI to find your optimal spot</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Preferences</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location / City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.userLocation}
                  onChange={(e) => setForm({ ...form, userLocation: e.target.value })}
                  placeholder="e.g. Delhi, Connaught Place"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="car">Car / Sedan</option>
                <option value="suv">SUV</option>
                <option value="bike">Two-Wheeler / Bike</option>
                <option value="ev">Electric Vehicle (EV)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={form.desiredDuration}
                onChange={(e) => setForm({ ...form, desiredDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slot Preference</label>
              <select
                value={form.preferredParkingType}
                onChange={(e) => setForm({ ...form, preferredParkingType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="any">Any Slot</option>
                <option value="covered">Covered / Indoor</option>
                <option value="open">Open Air</option>
                <option value="ev">EV Charging Slot</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Get AI Recommendation'}</span>
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {initialLoading ? (
            <Loading message="Consulting AI recommendation engine..." />
          ) : (
            <>
              {recommendation?.recommendedLot ? (
                <div className="bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
                    <span className="flex items-center space-x-2 font-medium">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>Best Matched Parking Spot</span>
                    </span>
                    <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                      AI Selected
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{recommendation.recommendedLot.name}</h2>
                        <p className="text-slate-500 flex items-center text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                          {recommendation.recommendedLot.location} — {recommendation.recommendedLot.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(recommendation.estimatedPrice || (recommendation.recommendedLot.pricePerHour * (form.desiredDuration || 2)))}
                        </span>
                        <p className="text-xs text-slate-400">Total est. for {form.desiredDuration} hr(s)</p>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-lg text-slate-700 text-sm mb-6 leading-relaxed">
                      <strong className="text-indigo-900 font-semibold block mb-1">Why this was chosen:</strong>
                      {recommendation.reason}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-center text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <Car className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <span className="text-slate-500 text-xs">Available Slots</span>
                        <p className="font-bold text-slate-900 mt-0.5">{recommendation.recommendedLot.availableSlots}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <span className="text-slate-500 text-xs">Operating Hours</span>
                        <p className="font-bold text-slate-900 mt-0.5">{recommendation.recommendedLot.openingTime} - {recommendation.recommendedLot.closingTime}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <span className="text-slate-500 text-xs">Hourly Rate</span>
                        <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(recommendation.recommendedLot.pricePerHour)}/hr</p>
                      </div>
                    </div>

                    <Link
                      to={`/parking/${recommendation.recommendedLot._id}`}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>View Available Slots & Book</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-600">No specific parking lot matched all criteria. Try searching with a broader location like "Delhi".</p>
                </div>
              )}

              {/* Demand Prediction Box */}
              {prediction && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                      Parking Demand Prediction
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${demandColors[prediction.demandLevel] || 'bg-slate-100 text-slate-700'}`}>
                      {capitalize(prediction.demandLevel || 'Normal')} Demand
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{prediction.explanation}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-lg">
                    <div>
                      <span className="text-slate-500">Best Recommended Time:</span>
                      <p className="font-semibold text-slate-800">{prediction.suggestedBestTime || 'Off-peak morning/afternoon'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Expected Availability:</span>
                      <p className="font-semibold text-slate-800">{prediction.expectedAvailability || 'Moderate'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendation;
