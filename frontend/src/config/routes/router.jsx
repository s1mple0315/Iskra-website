import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../../app/Layout";
import Loading from "../../entities/components/Loading/Loading";

const MainPage = lazy(() => import("../../pages/Main/MainPage"));
const Company = lazy(() => import("../../pages/AboutPage/Company"));
const DeliveryPage = lazy(() => import("../../pages/Delivery/DeliveryPage"));
const Contacts = lazy(() => import("../../pages/Contacts/Contacts"));
const RegularCustomersPage = lazy(() => import("../../pages/RegularCustomers/RegularCustomersPage"));
const BlogPage = lazy(() => import("../../pages/Blog/BlogPage"));
const GuaranteePage = lazy(() => import("../../pages/Guarantee/GuaranteePage"));

const CatalogPage = lazy(() => import("../../pages/Catalog/CatalogPage/CatalogPage"));
const ProductListingPage = lazy(() => import("../../pages/Catalog/ProductListingPage/ProductListingPage"));
const ProductDetailsPage = lazy(() => import("../../pages/Catalog/ProductDetailsPage/ProductDetailsPage"));
const ParentCategoryPage = lazy(() => import("../../pages/Catalog/ParentCategoryPage/ParentCategoryPage"));

const AppRouter = () => {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/company" element={<Company />} />
            <Route path="/guarantee" element={<GuaranteePage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/regular" element={<RegularCustomersPage />} />
            <Route path="/blog" element={<BlogPage />} />

            {/* Catalog Routes */}
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ParentCategoryPage />} />
            <Route path="/catalog/:parentId/:subcategoryId" element={<ProductListingPage />} />
            <Route path="/catalog/:parentId/:childId/:productId" element={<ProductDetailsPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default AppRouter;
