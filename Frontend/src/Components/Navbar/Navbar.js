import React, { useContext } from 'react';
import '../../styles/Navbar.css';
import AppContext from '../../context/AppContext'
import { useNavigate } from 'react-router-dom';
function Navbar() {
    // const [user1, setUser1] = useState("");
    const { loggedinC, LoginC, loggedinF, LoginF, loggedinA, LoginA, user, setUser } = useContext(AppContext);
    // useEffect(() => {

    // }, [user])
    // useEffect(() => {
    //    setUser();
    // }, []);
    // useEffect(() => {
    //     const user2 = localStorage.getItem("user");
    //     setUser1(user2);
    // }, [loggedinA, loggedinC, loggedinF]);

    const Logout = () => {
        // localStorage.removeItem('loginA');
        // localStorage.removeItem('loginF');
        // localStorage.removeItem('loginC');
        // localStorage.removeItem('userLogin');
        setUser(null);
        // setUser1(null);
        LoginC('false');
        LoginA('false');
        LoginF('false');
        navigate('/')
    };


    const navigate = useNavigate();
    const handleSignup = () => {
        navigate('/OptionSignup');
    }
    const handleLogin = () => {
        navigate('/OptionLogin');
    }

    const ProfileFun = () => {
        navigate('/Profile');
    }


    return (
        <>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="../images/v914-ning-21a.jpg" className="company-logo" alt="" />
                    <strong className="Companyname">
                        GreenHarvest
                    </strong>
                </div>
                <div className="navbar-right">
                    <div className="navbar-options">
                        <span className="navbar-options-btn">
                            {loggedinF === 'true' && <a href='/FarmerHome'>Home</a>}
                            {loggedinC === 'true' && <a href='/CompanyHome'>Home</a>}
                            {loggedinA === 'true' && <a href='/AdminHome'>Home</a>}
                            {loggedinA === 'false' && loggedinF === 'false' && loggedinC === 'false' && <a href='/'>Home</a>}
                        </span>
                        <span className="navbar-options-btn">
                            <a href="#about">About</a>
                        </span>
                        <span className="navbar-options-btn">
                            <a href="#contact">Contact</a>
                        </span>
                    </div>
                    <div className="signin btn" id="log-btn">
                        {
                            user ?
                                <>
                                    <button role="button" className="button-name" onClick={ProfileFun}>{user.name}</button>
                                    <button role="button" className="button-name" onClick={Logout}>LogOut</button>
                                </>
                                :
                                <>

                                    <button role="button" className="button-name" onClick={handleSignup}>SignUp</button>
                                    <button role="button" className="button-name" onClick={handleLogin}>LogIn</button>
                                </>

                        }


                    </div>

                </div>
            </div>

        </>
    )
}

export default Navbar 