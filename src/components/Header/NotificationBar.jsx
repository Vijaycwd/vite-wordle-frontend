import React from 'react';
import { Toast } from 'react-bootstrap';

const NotificationBar = ({ message, showNotification }) => {
  return (
    <div className="notification-bar">
      <Toast show={showNotification} onClose={() => {}} delay={3000} autohide>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </div>
  );
};

export default NotificationBar;
