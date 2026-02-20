import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import LogIn from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import Home from './pages/Home';
import Contact from "./pages/Contact";
import Rooms from "./pages/Rooms";
import RoomDetailsClient from "./pages/RoomDetailsClient";
import About from "./pages/About";
import Header from './components/Header';
import Footer from "./components/Footer";
import RoomsList from "./pages/admin/RoomsList";
import ReceptionBookingPage from "./pages/reception/ReceptionBookingPage";
import TodayCheckins from "./pages/reception/TodayCheckins";
import PendingReservations from "./pages/reception/PendingReservations";
import TodayCheckouts from "./pages/reception/TodayCheckouts";
import AddRoom from "./pages/admin/AddRoom";
import FactureList from "./pages/reception/FactureList";
import RoomDetails from "./pages/admin/RoomDetails";
import BookingRequest from "./pages/BookingRequest";
import AdminClientsList from "./pages/admin/AdminClientsList";
import FactureDetails from "./pages/reception/FactureDetails";
import ReservationsList from "./pages/reception/ReservationsList";
import ReservationDetails from "./pages/reception/ReservationDetails";
function App() {

  return (
    <BrowserRouter>
    <div className="app-container">
      <Header />
      <div className="thecontent">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/rooms" element={<Rooms/>}/>
          <Route path="/rooms/:type" element={<RoomDetailsClient/>}/>
          <Route path="/login" element={<LogIn />}/>
          <Route path="/booking-request" element={<BookingRequest />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          <Route path="/admin/roomslist" element={<RoomsList />}/>
          <Route path="/admin/addroom" element={<AddRoom />}/>
          <Route path="/factures" element={<FactureList />}/>
          <Route path="/admin/clients" element={<AdminClientsList />}/>
          <Route path="/admin/rooms/:id" element={<RoomDetails />} />
          <Route path="/reception/dashboard" element={<ReceptionDashboard />}/>
          <Route path="/reception/booking" element={<ReceptionBookingPage />}/>
          <Route path="/reception/factureDetails/:id" element={<FactureDetails />}/>
          <Route path="/reservations" element={<ReservationsList />}/>
          <Route path="/reservationDetails/:id" element={<ReservationDetails />} />
          <Route path="/checkins-today" element={<TodayCheckins />} />
          <Route path="/checkouts-today" element={<TodayCheckouts />} />
          <Route path="/reception/pending" element={<PendingReservations />} />

          

        </Routes>
      </div>
      <Footer />
    </div>
    </BrowserRouter>
  )
}

export default App
