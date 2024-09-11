import React, { useContext, useState } from "react";
import "../../../styles/LoginStyle.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppContext from "../../../context/AppContext";
const LoginFarmer = () => {
    const { showAlert, LoginF, user, setUser } = useContext(AppContext);
    const navigate = useNavigate();

    const [user1, setuser] = useState({
        email: "",
        password: "",
    });

    const userlogin = async (e) => {
        e.preventDefault();
        const response = await axios.post("http://localhost:8000/LoginFarmer", {
            email: user1.email,
            password: user1.password,
        });
        if (response.data.success) {
            showAlert(response.data.message, "success");
            setUser(response.data.data);
            //localStorage.setItem("userLogin", JSON.stringify(response.data.data));
            LoginF('true');
            navigate("/FarmerHome");
        } else {
            showAlert(response.data.message, "danger");
        }
    };
    const emailRegex = /^[0-9]{10}$/;

    // Regular expression for password validation (at least 8 characters long)
    const passwordRegex = /^.{8,}$/;
    let name, value;
    const handleInput = (e) => {
        name = e.target.name;
        value = e.target.value;
        setuser({ ...user1, [name]: value });

        if (name === "email" && !emailRegex.test(value)) {
            showAlert("Please enter a valid mobile number ", "danger");
        }

        if (name === "password" && !passwordRegex.test(value)) {
            showAlert("Password must be at least 8 characters long", "danger");
        }
        e.preventDefault();
    };

    return (
        <>
            {/* <Navbar/> */}
            <div className="centerL">
                <h1>Login for Farmer</h1>
                <form onSubmit={userlogin} method="post">
                    <div className="txt_field">
                        <input
                            type="text"
                            required
                            name="email"
                            value={user1.email}
                            onChange={handleInput}
                        />
                        <label>Email</label>
                    </div>
                    <div className="txt_field">
                        <input
                            type="password"
                            required
                            name="password"
                            value={user1.password}
                            onChange={handleInput}
                        />
                        <label>Password</label>
                    </div>
                    <div className="pass">
                        <a href="Forget">Forget Password?</a>
                    </div>

                    <input type="submit" value="Login" className="Login" />
                    <div className="signup_link">
                        Not a member? <a href="SignUpFarmer">Signup</a>
                    </div>
                </form>
            </div>
        </>
    );
};

export default LoginFarmer;
