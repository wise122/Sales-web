import React, { JSX } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, Spinner, Flex } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import ManagementPage from "./pages/ManagementPage"; 
import AdminPage from "./pages/AdminPage"; 
import ProductPage from "./pages/ProductPage";
import ProductStockPage from "./pages/ProductsStockPage";
import RetailOutletsPage from "./pages/RetailOutletsPage"; 
import AgentOutletsPage from "./pages/OutletsAgentPage";
import WholesaleOutletsPage from "./pages/OutletsWholesalePage";
import BranchesPage from "./pages/BranchesPage";
import Layout from "./components/Layout";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Flex w="100vw" h="100vh" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Route dashboard dengan Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route Product */}
            <Route
              path="/produk"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route Product Stol */}
            <Route
              path="/stok"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductStockPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route Sales */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SalesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route Management */}
            <Route
              path="/management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

             {/* Route Cabang */}
             <Route
              path="/cabang"
              element={
                <ProtectedRoute>
                  <Layout>
                    <BranchesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            

            {/* Route Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route RetailOutlet */}
            <Route
              path="/toko/retail"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RetailOutletsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route RetailAgent */}
            <Route
              path="/toko/agent"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AgentOutletsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Route RetailWholesale */}
            <Route
              path="/toko/wholesale"
              element={
                <ProtectedRoute>
                  <Layout>
                    <WholesaleOutletsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;
