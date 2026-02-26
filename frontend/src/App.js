// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import ProtectedRoute from "./components/ProtectedRoute";
// import Layout from "./components/Layout";
// import Register from "./pages/Register";

// import Login from "./pages/Login";
// import Events from "./pages/Events";
// import MyTickets from "./pages/MyTickets";
// import Admin from "./pages/Admin";

// function App() {
//   return (
//     <Router>
//       <Routes>

//         {/* Public Route */}
//         <Route path="/" element={<Login />} />

//         {/* Events */}
//         <Route
//           path="/events"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <Events />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />

//         {/* My Tickets */}
//         <Route
//           path="/my-tickets"
//           element={
//             <ProtectedRoute>
//               <Layout>
//                 <MyTickets />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />

//         {/* Admin */}
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute adminOnly={true}>
//               <Layout>
//                 <Admin />
//               </Layout>
//             </ProtectedRoute>
//           }
//         />

//       </Routes>

//       <ToastContainer position="top-right" autoClose={3000} />
//     </Router>
//   );
// }

// export default App;
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Events from "./pages/Events";
import MyTickets from "./pages/MyTickets";
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <MyTickets />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
