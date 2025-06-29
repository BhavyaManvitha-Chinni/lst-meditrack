import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Pill, Clock, AlertCircle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Prescription {
  id: string;
  appointmentId: string;
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

const ViewPrescriptions: React.FC = () => {
  const { userData } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [userData]);

  const fetchPrescriptions = async () => {
    if (!userData) return;

    try {
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const prescriptionsList: Prescription[] = [];

      querySnapshot.forEach((doc) => {
        prescriptionsList.push({ id: doc.id, ...doc.data() } as Prescription);
      });

      setPrescriptions(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage your medical prescriptions
            </p>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your prescriptions will appear here after completed appointments.
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
                      All Prescriptions ({prescriptions.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {prescriptions.map((prescription) => (
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
                                <FileText className="w-4 h-4 text-emerald-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {prescription.diagnosis}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(prescription.createdAt.toDate()).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}
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
                            Prescription Details
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
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <p className="text-gray-800">{selectedPrescription.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Important Notice */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-800">Important Notice</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Please follow the prescribed dosage and frequency. Do not stop or modify 
                              the medication without consulting your doctor. If you experience any side 
                              effects, contact your healthcare provider immediately.
                            </p>
                          </div>
                        </div>
                      </div>
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

export default ViewPrescriptions;