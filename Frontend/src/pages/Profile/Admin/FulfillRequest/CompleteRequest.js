import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import AppContext from '../../../../context/AppContext';
import '../../../../styles/CompleteRequest.css';


const CompleteRequest = () => {

      const { EndObject, FullfillRequest } = useContext(AppContext);
      const data = EndObject;
      const navigate = useNavigate()
      const handleBack = () => {
            navigate('/AdminHome')
      }
      const handleRequest = () => {
            FullfillRequest(data);
            navigate('/ClearReqForm');
      }
      return (
            <>
                  <div class="cardforlist">
                        <div class="tools">
                              <div class="circle">
                                    <button onClick={handleBack}><span class="red box">Back</span></button>
                              </div>
                        </div>
                        <div class="header2">{data.email}</div>
                        <div class="body2">
                              <div class="req">
                                    <div class="req-name"><p>Mobile No: {data.mobileno}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>Size of Farm (in Acre): {data.acre}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>Type of Grains: {data.ptype}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>Planting Date: {data.date1}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>Start Date: {data.du1}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>End Date: {data.du2}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>service Type: {data.type}</p></div>

                              </div>
                              <div class="req">
                                    <div class="req-name"><p>Machines Required: {data.mtype}</p></div>

                              </div>
                              <div className="req">
                                    <button className='Fulfill' onClick={handleRequest}> Fullfill Request
                                    </button>
                              </div>
                        </div>
                  </div>
            </>
      );
};

export default CompleteRequest;
