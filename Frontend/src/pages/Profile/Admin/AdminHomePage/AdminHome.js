import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../../styles/AdminHome.css'
import axios from 'axios';
import AppContext from '../../../../context/AppContext'

const AdminHome = () => {
      const { FullfillRequest } = useContext(AppContext);
      const navigate = useNavigate();

      const [room, setRoom] = useState([]);
      const [service, setService] = useState([]); 

      const getData = async () => {
            try {
                  const { data } = await axios.post("http://localhost:8000/AdminHome");
                  if (data?.room && data?.Service) {
                        setRoom(data.room);
                        setService(data.Service);
                  } else {
                        alert(data?.message);
                  }
            } catch (error) {
                  console.error("Error fetching data:", error);
            }
      };

      useEffect(() => {
            getData();
      }, []);

      const handleRequest = (ele, path) => {
            FullfillRequest(ele);
            navigate(path);
      };

      return (
            <>
                  <div className="list-container">
                        <h2>Available Rooms:</h2>
                        <ul className="list d-flex flex-row cardReq">
                              {room.length > 0 ? (
                                    room.map((ele) => (
                                          <button key={ele.Name} onClick={() => handleRequest(ele, '/ShowAuction')}>
                                                <li>{ele.Name}</li>
                                          </button>
                                    ))
                              ) : (
                                    <li>No rooms available</li>
                              )}
                        </ul>
                  </div>
                  <div className="center">
                        <h2>Pending Services:</h2>
                        <ul className="list d-flex flex-row cardReq">
                              {service.length > 0 ? (
                                    service.map((ele) => (
                                          <button key={ele.email} onClick={() => handleRequest(ele, '/CompleteRequest')}>
                                                <li>{ele.email}</li>
                                          </button>
                                    ))
                              ) : (
                                    <li>No services pending</li>
                              )}
                        </ul>
                  </div>
                  <button className="CreateRoom" onClick={() => navigate('/CreateRoom')}>
                        Create Room
                  </button>
            </>
      );
};

export default AdminHome;
