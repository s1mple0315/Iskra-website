import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainPage from "../../pages/Main/MainPage";
import Company from "../../pages/AboutPage/Company";
import DeliveryPage from "../../pages/Delivery/DeliveryPage";
import Contacts from "../../pages/Contacts/Contacts";
import RegularCustomersPage from "../../pages/RegularCustomers/RegularCustomersPage";
import BlogPage from "../../pages/Blog/BlogPage";
import Layout from "../../app/Layout";
import GuaranteePage from "../../pages/Guarantee/GuaranteePage";

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/company" element={<Company />} />
          <Route path="/guarantee" element={<GuaranteePage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/regular" element={<RegularCustomersPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRouter;
