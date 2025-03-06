import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../../app/Layout";
import Loading from "../../entities/components/Loading/Loading";

const MainPage = lazy(() => import("../../pages/Main/MainPage"));
const Company = lazy(() => import("../../pages/AboutPage/Company"));
const DeliveryPage = lazy(() => import("../../pages/Delivery/DeliveryPage"));
const Contacts = lazy(() => import("../../pages/Contacts/Contacts"));
const RegularCustomersPage = lazy(() => import("../../pages/RegularCustomers/RegularCustomersPage"));
const GuaranteePage = lazy(() => import("../../pages/Guarantee/GuaranteePage"));
const BasketPage = lazy(() => import("../../pages/Basket/BasketPage"));
const BlogListingPage = lazy(() => import("../../pages/Blog/BlogListingPage/BlogListingPage"));
const BlogDetailsPage = lazy(() => import("../../pages/Blog/BlogDetailsPage/BlogDetailsPage"));
const CatalogPage = lazy(() => import("../../pages/Catalog/CatalogPage/CatalogPage"));
const ProductListingPage = lazy(() => import("../../pages/Catalog/ProductListingPage/ProductListingPage"));
const ProductDetailsPage = lazy(() => import("../../pages/Catalog/ProductDetailsPage/ProductDetailsPage"));
const ParentCategoryPage = lazy(() => import("../../pages/Catalog/ParentCategoryPage/ParentCategoryPage"));
const ProfilePage = lazy(() => import("../../pages/Profile/ProfilePage"));

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
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/blog" element={<BlogListingPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            
            {/* Updated Catalog Routes */}
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:parentId" element={<ParentCategoryPage />} />
            <Route path="/catalog/:parentId/:subcategoryId" element={<ParentCategoryPage />} /> {/* Now shows subcategories */}
            <Route path="/catalog/:parentId/:subcategoryId/:subSubcategoryId" element={<ProductListingPage />} />
            <Route path="/catalog/:parentId/:subcategoryId/:subSubcategoryId/:productId" element={<ProductDetailsPage />} />
            
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default AppRouter;