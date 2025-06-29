import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Pill, Search, Filter } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  notes: string;
  createdAt: any;
}

const DoctorPrescriptions: React.FC = () => {
  const { userData } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchPrescriptions();
  }, [userData]);

  const fetchPrescriptions = async () => {
    if (!userData) return;

    try {
      // Get all appointments for this doctor first
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', userData.uid),
        where('status', '==', 'completed')
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentIds: string[] = [];

      appointmentsSnapshot.forEach((doc) => {
        appointmentIds.push(doc.id);
      });

      if (appointmentIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get prescriptions for these appointments
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        orderBy('createdAt', 'desc')
      );

      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsList: Prescription[] = [];

      prescriptionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (appointmentIds.includes(data.appointmentId)) {
          prescriptionsList.push({ id: doc.id, ...data } as Prescription);
        }
      });

      setPrescriptions(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (dateFilter === 'all') return true;
    
    const prescriptionDate = new Date(prescription.createdAt.toDate());
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return prescriptionDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return prescriptionDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return prescriptionDate >= monthAgo;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading prescriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage prescriptions you've issued to patients
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Search by patient name or diagnosis..."
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Prescriptions you create will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prescriptions List */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Prescriptions ({filteredPrescriptions.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredPrescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          onClick={() => setSelectedPrescription(prescription)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                            selectedPrescription?.id === prescription.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {prescription.patientName}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {prescription.diagnosis}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(prescription.createdAt.toDate()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Details */}
              <div className="lg:col-span-2">
                {selectedPrescription ? (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            Prescription for {selectedPrescription.patientName}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Issued on {new Date(selectedPrescription.createdAt.toDate()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6 space-y-6">
                      {/* Diagnosis */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Diagnosis</h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-gray-800">{selectedPrescription.diagnosis}</p>
                        </div>
                      </div>

                      {/* Medications */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Prescribed Medications ({selectedPrescription.medications.length})
                        </h3>
                        <div className="space-y-4">
                          {selectedPrescription.medications.map((medication, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                    <Pill className="w-4 h-4 text-teal-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    {medication.name}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Dosage</p>
                                      <p className="text-sm text-gray-600">{medication.dosage}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Frequency</p>
                                      <p className="text-sm text-gray-600">{medication.frequency}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Duration</p>
                                      <p className="text-sm text-gray-600">{medication.duration}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Instructions</p>
                                      <p className="text-sm text-gray-600">
                                        {medication.instructions || 'No specific instructions'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Additional Notes */}
                      {selectedPrescription.notes && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Notes</h3>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-gray-800">{selectedPrescription.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg">
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Select a prescription to view details
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Click on any prescription from the list to see the full details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;