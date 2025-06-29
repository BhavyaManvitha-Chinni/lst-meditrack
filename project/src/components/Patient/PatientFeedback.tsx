import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  createdAt: any;
}

interface Feedback {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

const PatientFeedback: React.FC = () => {
  const { userData } = useAuth();
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [existingFeedback, setExistingFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    if (!userData) return;

    try {
      // Fetch completed appointments
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', userData.uid),
        where('status', '==', 'completed')
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsList: Appointment[] = [];

      appointmentsSnapshot.forEach((doc) => {
        appointmentsList.push({ id: doc.id, ...doc.data() } as Appointment);
      });

      // Sort by date descending
      appointmentsList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setCompletedAppointments(appointmentsList);

      // Fetch existing feedback
      const feedbackQuery = query(
        collection(db, 'feedback'),
        where('patientId', '==', userData.uid)
      );

      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackList: Feedback[] = [];

      feedbackSnapshot.forEach((doc) => {
        feedbackList.push({ id: doc.id, ...doc.data() } as Feedback);
      });

      setExistingFeedback(feedbackList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAppointment || rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'feedback'), {
        appointmentId: selectedAppointment.id,
        patientId: userData?.uid,
        patientName: userData?.name,
        doctorId: selectedAppointment.doctorId,
        doctorName: selectedAppointment.doctorName,
        rating,
        comment: comment.trim(),
        createdAt: Timestamp.now()
      });

      // Add to existing feedback list
      const newFeedback: Feedback = {
        id: Date.now().toString(), // Temporary ID
        appointmentId: selectedAppointment.id,
        doctorId: selectedAppointment.doctorId,
        doctorName: selectedAppointment.doctorName,
        rating,
        comment: comment.trim(),
        createdAt: Timestamp.now()
      };

      setExistingFeedback([...existingFeedback, newFeedback]);
      
      // Reset form
      setSelectedAppointment(null);
      setRating(0);
      setComment('');
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasFeedback = (appointmentId: string) => {
    return existingFeedback.some(feedback => feedback.appointmentId === appointmentId);
  };

  const getFeedbackForAppointment = (appointmentId: string) => {
    return existingFeedback.find(feedback => feedback.appointmentId === appointmentId);
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
          i < (interactive ? (hoverRating || rating) : currentRating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      />
    ));
  };

  const getAppointmentsWithoutFeedback = () => {
    return completedAppointments.filter(apt => !hasFeedback(apt.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading feedback...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Feedback</h1>
            <p className="mt-2 text-sm text-gray-600">
              Share your experience and help improve healthcare services
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-green-700">
                Thank you for your feedback! Your review has been submitted successfully.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Leave Feedback</h2>
                <p className="text-sm text-gray-600">Rate your experience with completed appointments</p>
              </div>

              <div className="p-6">
                {getAppointmentsWithoutFeedback().length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments to review</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You have already provided feedback for all completed appointments.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    {/* Select Appointment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Appointment to Review
                      </label>
                      <div className="space-y-2">
                        {getAppointmentsWithoutFeedback().map((appointment) => (
                          <div
                            key={appointment.id}
                            onClick={() => setSelectedAppointment(appointment)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                              selectedAppointment?.id === appointment.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  Dr. {appointment.doctorName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedAppointment && (
                      <>
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Rate Your Experience
                          </label>
                          <div className="flex items-center space-x-1">
                            {renderStars(rating, true)}
                            <span className="ml-3 text-sm text-gray-600">
                              {rating > 0 && (
                                <>
                                  {rating} star{rating !== 1 ? 's' : ''} - 
                                  {rating === 1 && ' Poor'}
                                  {rating === 2 && ' Fair'}
                                  {rating === 3 && ' Good'}
                                  {rating === 4 && ' Very Good'}
                                  {rating === 5 && ' Excellent'}
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments (Optional)
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Share your experience, what went well, or areas for improvement..."
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submitting || rating === 0}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {submitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Feedback</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Previous Feedback */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Previous Feedback</h2>
                <p className="text-sm text-gray-600">Reviews you've submitted for past appointments</p>
              </div>

              <div className="p-6">
                {existingFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your submitted reviews will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {existingFeedback
                      .sort((a, b) => {
                        const aTime = a.createdAt?.toDate?.() || new Date(0);
                        const bTime = b.createdAt?.toDate?.() || new Date(0);
                        return bTime.getTime() - aTime.getTime();
                      })
                      .map((feedback) => (
                        <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Star className="w-5 h-5 text-yellow-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  Dr. {feedback.doctorName}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {renderStars(feedback.rating)}
                                </div>
                              </div>
                              {feedback.comment && (
                                <p className="text-sm text-gray-600 mb-2">
                                  "{feedback.comment}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Submitted on {new Date(feedback.createdAt.toDate()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {existingFeedback.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Feedback Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">
                      {existingFeedback.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {(existingFeedback.reduce((sum, f) => sum + f.rating, 0) / existingFeedback.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {existingFeedback.filter(f => f.comment.trim()).length}
                    </div>
                    <div className="text-sm text-gray-600">With Comments</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientFeedback;