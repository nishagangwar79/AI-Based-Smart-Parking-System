import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, DollarSign, Car, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loading from '../components/Loading';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, bookingsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/bookings'),
      ]);
      setDashboardData(dashRes.data.data);
      setUsers(usersRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) return <Loading fullScreen message="Loading admin panel..." />;

  const stats = dashboardData?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 text-sm">System management and analytics overview</p>
        </div>

        {/* Tab navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'bookings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({users.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.revenue || 0)}</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBookings || 0}</p>
                </div>
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Available Slots</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.availableSlots || 0} / {stats.totalSlots || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <Car className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Registered Users</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Parking Lot</th>
                    <th className="px-4 py-3">Slot</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(dashboardData?.recentBookings || []).map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{b.user?.name || 'Guest'}</td>
                      <td className="px-4 py-3">{b.parkingLot?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{b.parkingSlot?.slotNumber || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">All System Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Parking Lot</th>
                  <th className="px-4 py-3">Slot</th>
                  <th className="px-4 py-3">Start Time</th>
                  <th className="px-4 py-3">End Time</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{b.user?.name}</td>
                    <td className="px-4 py-3">{b.vehicleNumber || '—'}</td>
                    <td className="px-4 py-3">{b.parkingLot?.name}</td>
                    <td className="px-4 py-3">Slot {b.parkingSlot?.slotNumber}</td>
                    <td className="px-4 py-3">{formatDateTime(b.startTime)}</td>
                    <td className="px-4 py-3">{formatDateTime(b.endTime)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.vehicleNumber || '—'}</td>
                    <td className="px-4 py-3 uppercase text-xs">{u.vehicleType || 'car'}</td>
                    <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
