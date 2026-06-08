import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/auth-page/AuthPage';
import HomePage from './pages/home-page/HomePage';
import CartPage from './pages/cart-page/CartPage';
import BookPage from './pages/book-page/BookPage';
import BookDetailPage from './pages/detail-page/DetailPage';
import CheckoutPage from './pages/checkout-page/CheckoutPage';
import PaymentSuccessPage from './pages/verify-payment/PaymentSuccess';
import PaymentFailedPage from './pages/verify-payment/PaymentFailed';
import OrderPage from './pages/order-page/OrderPage';
import OrderDetailPage from './pages/order-page/OrderDetailPage';
import Layout from './components/common/Layout';
import WishlistPage from './pages/wishlist-page/WishlistPage';
import { useWishlistStore } from './redux/wishlistStore';
import { useAuthStore } from './redux/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

import AuthorPage from './pages/author-page/AuthorPage';
import GenrePage from './pages/genre-page/GenrePage';
import CategoryPage from './pages/category-page/CategoryPage';

function App() {
  const fetchWishlistIds = useWishlistStore((state) => state.fetchWishlistIds);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      fetchWishlistIds();
    }
  }, [fetchWishlistIds, accessToken]);

  return (
    <Routes>
      <Route path='/register' element={<AuthPage type="register" />} />
      <Route path='/login' element={<AuthPage type="login" />} />

      <Route element={<Layout />}>

        {/* Public Route */}
        <Route path='/' element={<HomePage />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/all-books' element={<BookPage />} />
        <Route path='/authors' element={<AuthorPage />} />
        <Route path='/genres' element={<GenrePage />} />
        <Route path='/categories' element={<CategoryPage />} />
        <Route path='/books/:id' element={<BookDetailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/wishlist' element={<WishlistPage />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path='/payment-success' element={<PaymentSuccessPage />} />
          <Route path='/payment-failed' element={<PaymentFailedPage />} />
          <Route path='/my-orders' element={<OrderPage />} />
          <Route path='/my-orders/:orderId' element={<OrderDetailPage />} />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;