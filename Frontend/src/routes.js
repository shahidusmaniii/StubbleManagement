import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './pages/Home/Home';
import Navbar from './components/Navbar/Navbar';
import Reasearch from './pages/Research/Research';
import OptionSignup from './pages/Option/OptionSignup';
import OptionLogin from './pages/Option/OptionLogin';
import LoginFarmer from './pages/Auth/Login/LoginFarmer';
import LoginCompany from './pages/Auth/Login/LoginCompany';
import LoginAdmin from './pages/Auth/Login/LoginAdmin';
import Forget from './pages/Auth/Forgot/Forgot';
import Profile from './pages/Profile/Profiles/Profile';
import SignUpFarmer from './pages/Auth/Signup/SignUpFarmer';
import SignUpCompany from './pages/Auth/Signup/SignUpCompany';
import SignUpAdmin from './pages/Auth/Signup/SignUpAdmin';
import FarmerHome from './pages/Profile/Farmer/FarmerHomePage/FarmerHome';
import CompanyHome from './pages/Profile/Company/ComapanyHomePage/CompanyHome';
import AdminHome from './pages/Profile/Admin/AdminHomePage/AdminHome';
import Service from './pages/Profile/Farmer/Service/Service';
import Auction from './components/Auction/Auction';
import ShowAuction from './pages/Profile/Admin/ShowAuctionDetails/ShowAuction';
import AuctionList from './components/Auction/AuctionList';
import CompleteRequest from './pages/Profile/Admin/FulfillRequest/CompleteRequest';
import ClearReqForm from './pages/Profile/Admin/FulfillRequest/ClearRequest';
import Roomform from './pages/Profile/Admin/Room/Roomform';
import SuccessPage from './pages/Profile/Farmer/Service/SuccessPage';
import Alert from './components/shared/Alert';
import AppContextProvider from './context/AppContextProvider';

const MyRoutes = () => {
    return (
        <>
            <Router>
                <AppContextProvider>
                    <Navbar />
                    <Alert />
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/OptionSignup' element={<OptionSignup />} />
                        <Route path='/OptionLogin' element={<OptionLogin />} />

                        <Route path='/LoginFarmer' element={<LoginFarmer />} />
                        <Route path='/LoginCompany' element={<LoginCompany />} />
                        <Route path='/LoginAdmin' element={<LoginAdmin />} />

                        <Route path='/SignUpFarmer' element={<SignUpFarmer />} />
                        <Route path='/SignUpCompany' element={<SignUpCompany />} />
                        <Route path='/SignUpAdmin' element={<SignUpAdmin />} />

                        <Route path='/CompanyHome' element={<CompanyHome />} />
                        <Route path='/FarmerHome' element={<FarmerHome />} />


                        <Route path='/AdminHome' element={<AdminHome />} />


                        <Route path='/CompleteRequest' element={<CompleteRequest />} />
                        <Route path='/ClearReqForm' element={<ClearReqForm />} />

                        <Route path='/ShowAuction' element={<ShowAuction />} />

                        <Route path='/Auction' element={<Auction />} />
                        <Route path='/AuctionList' element={<AuctionList />} />
                        <Route path='/CreateRoom' element={<Roomform />} />

                        <Route path='/Profile' element={<Profile />} />

                        <Route path='/Service' element={<Service />} />
                        <Route path='/SuccessPage' element={<SuccessPage />} />

                        <Route path='/Forget' element={<Forget />} />

                        <Route path='/Research' element={<Reasearch />} />
                    </Routes>
                </AppContextProvider>
            </Router >

        </>
    )
}

export default MyRoutes;