import React, { useContext } from 'react'
import AppContext from '../../context/AppContext.js';
const Alert = () => {
      const { alert } = useContext(AppContext);
      const capitalize = (word) => {
            const lower = word.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      console.log("alert component", alert);
      return (
            <>
                  {alert &&
                        <div class={`alert alert-${alert.type}`} role="alert" style={{ height: '50px' }}>
                              <strong>{capitalize(alert.type)}</strong> {alert.msg}
                        </div>
                  }
            </>


      )
}

export default Alert