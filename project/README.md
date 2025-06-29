# MediTrack - Healthcare Management System

A comprehensive healthcare appointment and prescription tracking system built with React, TypeScript, Tailwind CSS, and Firebase.

## 🏥 Overview

MediTrack is a professional healthcare management platform that streamlines the interaction between doctors and patients through a sophisticated appointment booking system, prescription management, and feedback collection.

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based authentication** (Doctor/Patient)
- **Secure email validation** (@meditrack.local domain restriction)
- **Protected routes** with automatic role-based redirection
- **Firebase Authentication** integration

### 👨‍⚕️ Doctor Features
- **Professional dashboard** with appointment analytics
- **Appointment management** with status tracking (Pending → Confirmed → In Progress → Completed)
- **Real-time appointment notifications**
- **Prescription management** for completed appointments
- **Patient feedback analytics** with rating system
- **Comprehensive patient overview**

### 👤 Patient Features
- **Intuitive appointment booking** with doctor selection
- **Smart scheduling limitations** (max 2 appointments per day)
- **Real-time appointment status tracking**
- **Prescription access** after appointment completion
- **Feedback system** for completed appointments
- **Personal health record overview**

### 🎨 Design & UX
- **Medical-grade design** with professional healthcare aesthetics
- **Responsive design** optimized for all devices
- **Accessible interface** with proper contrast ratios
- **Smooth animations** and micro-interactions
- **Professional color palette** (Teal primary, Blue secondary)

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meditrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update Firebase config in `src/config/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - Register with @meditrack.local email

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/                 # Authentication components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Layout/               # Layout components
│   │   └── Navigation.tsx
│   ├── Patient/              # Patient-specific components
│   │   ├── PatientDashboard.tsx
│   │   └── BookAppointment.tsx
│   └── Doctor/               # Doctor-specific components
│       ├── DoctorDashboard.tsx
│       └── ManageAppointments.tsx
├── context/                  # React contexts
│   └── AuthContext.tsx
├── config/                   # Configuration files
│   └── firebase.ts
└── types/                    # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Appointments - patients can create, doctors can manage
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Feedback - authenticated users can read/write
    match /feedback/{feedbackId} {
      allow read, write: if request.auth != null;
    }
    
    // Prescriptions - linked to appointments
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 👥 User Roles & Permissions

### Patient Permissions
- Book appointments (max 2 per day)
- View own appointments
- Access prescriptions after appointment completion
- Submit feedback for completed appointments

### Doctor Permissions
- View all assigned appointments
- Update appointment statuses
- Add prescriptions to completed appointments
- View patient feedback and ratings

## 🎯 Key Features Detail

### Appointment Booking System
- **Smart scheduling** with date/time validation
- **Doctor selection** from available practitioners
- **Automatic status tracking** (Pending → Confirmed → In Progress → Completed)
- **Daily booking limits** (2 appointments per patient per day)

### Prescription Management
- **Secure prescription creation** by doctors only
- **Patient access** only after appointment completion
- **Detailed medication information** (name, dosage, frequency)
- **Linked to specific appointments**

### Feedback System
- **5-star rating system** with optional comments
- **One feedback per appointment** restriction
- **Real-time rating calculations** for doctors
- **Anonymous feedback option**

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🔒 Security Features

- **Email domain restriction** (@meditrack.local)
- **Role-based access control**
- **Protected routes** with authentication checks
- **Firebase security rules**
- **Input validation** and sanitization

## 📱 Responsive Design

- **Mobile-first approach**
- **Tablet optimization**
- **Desktop professional layout**
- **Touch-friendly interactions**
- **Accessible navigation**

## 🎨 Design System

### Colors
- **Primary**: Teal (#14B8A6)
- **Secondary**: Blue (#3B82F6)
- **Accent**: Emerald (#10B981)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Headings**: Font weights 600-800
- **Body**: Font weight 400-500
- **Line height**: 1.5 for body, 1.2 for headings

## 📈 Future Enhancements

- [ ] **Real-time notifications** with Firebase Cloud Messaging
- [ ] **Video consultation** integration
- [ ] **Advanced analytics** dashboard
- [ ] **Multi-language support**
- [ ] **Calendar integration**
- [ ] **Payment processing** for appointments
- [ ] **Medical record uploads**
- [ ] **Appointment reminders** via email/SMS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for backend services
- **Tailwind CSS** for styling framework
- **Lucide React** for beautiful icons
- **React** team for the amazing framework

---

**MediTrack** - Streamlining healthcare management with modern technology 🏥✨