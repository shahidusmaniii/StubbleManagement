import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import AppContext from '../../../../context/AppContext';
import '../../../../styles/ShowAuction.css'
const ShowAuction = () => {
      const { showAlert, EndObject } = useContext(AppContext);
      const data = EndObject;
      const navigate = useNavigate()
      const handleBack = () => {
            navigate('/AdminHome')
      }

      return (
            <div className="">
                  <div class="cardforlist1">
                        <div class="tools1">
                              <div class="circle1">
                                    <button onClick={handleBack}><span class="red1 box1">Back</span></button>
                              </div>
                        </div>
                        <div class="header1">{data.Name}</div>
                        <div class="body1">
                              <div class="req1">
                                    <div class="req-name1"><p>Description: {data.description}</p></div>

                              </div>
                              <div class="req1">
                                    <div class="req-name1"><p>Unique Code: {data.Code}</p></div>

                              </div>
                              <div class="req1">
                                    <div class="req-name1"><p>Starting Bid: {data.StartBid}</p></div>

                              </div>
                              <div class="req1">
                                    <div class="req-name1"><p>Start Date: {data.startDate}</p></div>

                              </div>
                              <div class="req1">
                                    <div class="req-name1"><p>End Date: {data.endDate}</p></div>

                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default ShowAuction;
