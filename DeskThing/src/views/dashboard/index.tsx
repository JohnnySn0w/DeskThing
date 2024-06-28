import { IconDevice } from '../../components/todothingUIcomponents';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import socket from '../../helpers/WebSocketService';
const Default: React.FC = (): JSX.Element => {
  const [time, setTime] = useState('00:00');
  const requestPreferences = () => {
    if (socket.is_ready()) {
      const data = {
        app: 'utility',
        type: 'get',
      };
      socket.post(data);
    }
  }
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (msg: any) => {
      if (msg.type === 'time') {
        setTime(msg.data);
        console.log(msg)
      }
    };

    socket.addSocketEventListener(listener);

    requestPreferences()
    return () => {
      socket.removeSocketEventListener(listener);
    };
  }, []);

  return (
    <div className="view_default">
      <IconDevice iconSize={445} text={time} fontSize={150}/>
    </div>
  );
};

export default Default;