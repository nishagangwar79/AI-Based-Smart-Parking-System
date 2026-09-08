import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { getParkingLots } from '../services/parkingService';
import ParkingCard from '../components/ParkingCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const ParkingLots = () => {
  const [searchParams] = useSearchParams();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchLots = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (locationFilter) params.location = locationFilter;
      const data = await getParkingLots(params);
      setLots(data);
    } catch {
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [locationFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLots();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Parking Lots</h1>
        <p className="text-slate-500 mt-1">Browse and book parking slots across Delhi NCR</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, location, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white min-w-[160px]"
            >
              <option value="">All Cities</option>
              <option value="Delhi">Delhi</option>
              <option value="Noida">Noida</option>
              <option value="Ghaziabad">Ghaziabad</option>
            </select>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loading message="Loading parking lots..." />
      ) : lots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <ParkingCard key={lot._id} lot={lot} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No parking lots found"
          message="Try adjusting your search or filter criteria."
        />
      )}
    </div>
  );
};

export default ParkingLots;
