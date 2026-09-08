import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Shield, Clock, Bot, ArrowRight, Car, TrendingUp } from 'lucide-react';
import { getParkingLots } from '../services/parkingService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const Home = () => {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const data = await getParkingLots();
        setLots(data);
      } catch {
        setLots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLots();
  }, []);

  const totalSlots = lots.reduce((sum, l) => sum + l.totalSlots, 0);
  const availableSlots = lots.reduce((sum, l) => sum + l.availableSlots, 0);

  const features = [
    { icon: Sparkles, title: 'AI Recommendations', desc: 'Get personalized parking suggestions based on your location and preferences.' },
    { icon: TrendingUp, title: 'Demand Prediction', desc: 'Know when parking demand is low, medium, or high before you leave.' },
    { icon: Bot, title: 'AI Assistant', desc: 'Chat with our AI to find slots, check prices, and get parking advice.' },
    { icon: Shield, title: 'Secure Booking', desc: 'JWT-secured bookings with overlap prevention and instant confirmation.' },
  ];

  const steps = [
    { step: '1', title: 'Search & Browse', desc: 'Find parking lots near Delhi, Noida, or Ghaziabad.' },
    { step: '2', title: 'Select a Slot', desc: 'Pick an available slot by type — normal, EV, or disabled.' },
    { step: '3', title: 'Book & Pay', desc: 'Choose date/time, confirm booking, and park hassle-free.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Smart Parking Near You
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-8">
              AI-powered parking management for Delhi NCR. Book slots, get recommendations, and never worry about finding parking again.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/parking?search=${encodeURIComponent(search)}`;
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by city — Delhi, Noida, Ghaziabad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button type="submit" className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20 transition-colors font-medium">
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/ai-assistant" className="inline-flex items-center px-6 py-3 border border-white/30 rounded-xl hover:bg-white/10 transition-colors font-medium">
                <Bot className="w-4 h-4 mr-2" />
                Try AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <Loading message="Loading statistics..." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Parking Lots', value: lots.length, icon: MapPin },
                { label: 'Total Slots', value: totalSlots, icon: Car },
                { label: 'Available Now', value: availableSlots, icon: Clock },
                { label: 'Cities Covered', value: 3, icon: TrendingUp },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center p-6 bg-slate-50 rounded-xl">
                  <Icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-slate-900">{value}</div>
                  <div className="text-sm text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Smart Parking?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Powered by AI and built with modern MERN stack technology for a seamless parking experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">AI-Powered Parking Intelligence</h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
            Our Google Gemini-powered AI analyzes parking data to recommend the best spots, predict demand, and answer your parking questions in real time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/ai-recommendation" className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              Get AI Recommendation
            </Link>
            <Link to="/ai-assistant" className="px-6 py-3 border border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Chat with AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Park Smarter?</h2>
          <p className="text-slate-400 mb-8">Join thousands of drivers using AI-based smart parking across Delhi NCR.</p>
          <Link to={user ? '/parking' : '/register'} className="inline-flex items-center px-8 py-3.5 bg-indigo-600 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            {user ? 'Browse Parking Lots' : 'Create Free Account'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
