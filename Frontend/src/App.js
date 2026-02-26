import {BrowserRouter,Routes,Route} from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProgramSetup from './pages/ProgramSetup';
import QuotaSetup from './pages/QuotaSetup';
import ApplicantForm from './pages/ApplicantForm';
import SeatAllocation from './pages/SeatAllocation';
import AdmissionConfirm from './pages/AdmissionConfirm';
import FeeUpdate from './pages/FeeUpdate';
import DocumentVerification from './pages/DocumentVerification';
import DocumentUpload from './pages/DocumentUpload';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

function App(){
  const [user, setUser] = useState(null);

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setUser={setUser}/>}/>
        <Route path="/register" element={<Register/>}/>
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<ProtectedRoute user={user} requiredRole={['ADMIN', 'OFFICER', 'MANAGEMENT']}><Dashboard/></ProtectedRoute>}/>
        <Route path="/program-setup" element={<ProtectedRoute user={user} requiredRole={['ADMIN']}><ProgramSetup/></ProtectedRoute>}/>
        <Route path="/quota-setup" element={<ProtectedRoute user={user} requiredRole={['ADMIN']}><QuotaSetup/></ProtectedRoute>}/>
        
        {/* Admission Officer Routes */}
        <Route path="/applicant-form" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><ApplicantForm/></ProtectedRoute>}/>
        <Route path="/seat-allocation" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><SeatAllocation/></ProtectedRoute>}/>
        <Route path="/admission-confirm" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><AdmissionConfirm/></ProtectedRoute>}/>
        <Route path="/fee-update" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><FeeUpdate/></ProtectedRoute>}/>
        <Route path="/document-upload" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><DocumentUpload/></ProtectedRoute>}/>
        <Route path="/document-verification" element={<ProtectedRoute user={user} requiredRole={['OFFICER', 'ADMIN']}><DocumentVerification/></ProtectedRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;