import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle, XCircle, Play, FileText } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import PrescriptionForm from './PrescriptionForm';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  note: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: any;
}

const ManageAppointments: React.FC = () => {
  const { userData } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [userData]);

  const fetchAppointments = async () => {
    if (!userData) return;

    try {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const appointmentsList: Appointment[] = [];

      querySnapshot.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment);
      });

      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    setUpdating(appointmentId);
    
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });

      setAppointments(prev =>
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleCreatePrescription = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPrescriptionForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'pending':
        return [
          { action: 'confirmed', label: 'Confirm', color: 'bg-blue-600 hover:bg-blue-700' },
          { action: 'cancelled', label: 'Cancel', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'confirmed':
        return [
          { action: 'in_progress', label: 'Start', color: 'bg-purple-600 hover:bg-purple-700' },
          { action: 'cancelled', label: 'Cancel', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'in_progress':
        return [
          { action: 'completed', label: 'Complete', color: 'bg-green-600 hover:bg-green-700' }
        ];
      default:
        return [];
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Appointments</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review and update the status of your patient appointments
            </p>
          </div>

          {/* Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    filter === option.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white shadow rounded-lg">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all' 
                    ? 'You have no appointments yet.' 
                    : `No ${filter} appointments found.`
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-teal-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.patientName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          {appointment.note && (
                            <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Note:</strong> {appointment.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </span>

                        <div className="flex space-x-2">
                          {getAvailableActions(appointment.status).map((action) => (
                            <button
                              key={action.action}
                              onClick={() => updateAppointmentStatus(appointment.id, action.action)}
                              disabled={updating === appointment.id}
                              className={`px-3 py-1 text-sm font-medium text-white rounded-md transition-colors duration-200 ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {updating === appointment.id ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>...</span>
                                </div>
                              ) : (
                                action.label
                              )}
                            </button>
                          ))}
                          
                          {appointment.status === 'completed' && (
                            <button
                              onClick={() => handleCreatePrescription(appointment)}
                              className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors duration-200"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Prescription</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <PrescriptionForm
          appointmentId={selectedAppointment.id}
          patientId={selectedAppointment.patientId}
          patientName={selectedAppointment.patientName}
          onClose={() => {
            setShowPrescriptionForm(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            // Refresh appointments or show success message
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default ManageAppointments;