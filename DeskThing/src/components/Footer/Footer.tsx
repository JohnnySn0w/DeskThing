import './Footer.css';
import React, { useEffect, useState, useRef } from 'react';
import CountUpTimer from '../CountUpTimer'; // Ensure you have CountUpTimer defined in another file
import socket, { device_data, song_data } from '../../helpers/WebSocketService';
import {
  IconPlay,
  IconPause,
  IconSkipForward,
  IconSkipBack,
  IconShuffle,
  IconRepeat,
  IconRepeatOne,
} from '../todothingUIcomponents';
import { IconAlbum } from '../todothingUIcomponents';

const Footer: React.FC = () => {
  const [local, setLocal] = useState(true);
  const [songData, setSongData] = useState<song_data>();
  const [imageData, setImageData] = useState<string>();
  const [play, setPlay] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [visible, setVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const playerIslandRef = useRef<HTMLDivElement>(null);

  const handleDeviceData = (data: device_data) => {
    //setLocal(!data.device.is_active);
    setLocal(false);
    setPlay(data.is_playing);
    setShuffle(data.shuffle_state);
    setRepeat(data.repeat_state);
    console.log(data);
  };

  const handleSongData = (data: song_data) => {
    setSongData(data);
  };

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === 'device_data') {
        handleDeviceData(msg.data);
      }
      if (msg.type === 'song_data') {
        handleSongData(msg.data);
      }
      if (msg.type === 'img_data') {
        setImageData(msg.data);
      }
    };

    socket.addSocketEventListener(listener);

    return () => {
      socket.removeSocketEventListener(listener);
    };
  }, []);

  const handleSendCommand = (request: string) => {
    if (socket.is_ready()) {
      const data = {
        app: 'spotify',
        type: 'set',
        request: request,
        data: songData?.uri || null,
      };
      socket.post(data);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendSet = (request: string, payload: any) => {
    if (socket.is_ready()) {
      const data = {
        app: 'spotify',
        type: 'set',
        request: request,
        data: payload,
      };
      socket.post(data);
    }
  };
  const handleRepeat = () => {

    let newRepeat;

    switch (repeat) {
      case 'off':
        newRepeat = 'context';
        break;
      case 'context':
        newRepeat = 'track';
        break;
      case 'track':
        newRepeat = 'off';
        break;
      default:
        newRepeat = 'context';
        break;
    }
    setRepeat(newRepeat);

    handleSendSet('set_repeat', newRepeat)

  };
  const handleShuffleToggle = () => {
    setShuffle((old) => !old);
    handleSendSet('set_shuffle', !shuffle)
  };

  const handleGetSongData = () => {
    if (socket.is_ready()) {
      const data = { app: 'spotify', type: 'get', request: 'song_info' };
      socket.post(data);
      const data2 = { app: 'spotify', type: 'get', request: 'device_info' };
      socket.post(data2);
    }
  };
  const setSpecificDuration = (ms: number) => {
    if (socket.is_ready()) {
      const data = {
        app: 'spotify',
        type: 'set',
        request: 'seek_track',
        position_ms: ms,
      };
      socket.post(data);
    }
  };

  const handleTouchOutside = (event: TouchEvent) => {
    if (playerIslandRef.current && !playerIslandRef.current.contains(event.target as Node)) {
      setVisible(false)
    }
  };

  const handleTouchInside = () => {
    if (playerIslandRef.current) {
      setVisible(true)
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchOutside);
    return () => {
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, []);

  const handlePlayPause = () => {
    setPlay(!play);
    play ? handleSendCommand('pause_track') : handleSendCommand('play_track');
  };

  return (
    <div className={`audioPlayer ${visible ? 'visible' : ''}`}
    ref={playerIslandRef}
    onTouchStart={handleTouchInside}>
      <button className={visible ? 'getSongInfo lg' : 'getSongInfo'} onClick={handleGetSongData}>
          {imageData && (
            <img
              src={imageData}
              alt="Image"
              className='albumArt'
              onLoad={() => {setImageLoaded(true)}}
              onError={() => {setImageLoaded(false)}}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          )}
          {!imageLoaded && <IconAlbum className='albumArt' iconSize={128} />}
      </button>
      <div className="audioPlayer_controls">
        {local ? (
          <div className="songInformation">
            <div className="songTitle">{' ' + ' - ' + ' '}</div>
            <div className="progressBar_container">
              <div className="progressBar_progress" style={{ width: `0%` }} />
              <p className="progressBar_timer">--:--</p>
            </div>
          </div>
        ) : (
          <div className="songInformation">

            <div>
              <CountUpTimer
                onSongEnd={handleGetSongData}
                start={songData?.progress_ms || 0}
                end={songData?.duration_ms || 0}
                play={play}
                onTouchEnd={setSpecificDuration}
                handleSendCommand={handleSendCommand}
              >
                <div className="songTitle">
                  {songData?.name || 'Track Name'}
                </div>
              </CountUpTimer>
            </div>
          </div>
        )}
        <div className="buttonContainer">
          <button className="mediaButton" onClick={handleShuffleToggle}>
            {shuffle ? <IconShuffle iconSize={48} className={'active'} /> : <IconShuffle iconSize={48} />}
          </button>
          <button
            className="mediaButton active"
            onClick={() => handleSendCommand('previous_track')}
          >
            <IconSkipBack />
          </button>
          <button className="mediaButton active" onClick={handlePlayPause}>
            {!play ? <IconPlay /> : <IconPause />}
          </button>
          <button className="mediaButton active" onClick={() => handleSendCommand('next_track')}>
            <IconSkipForward />
          </button>
          <button
            className="mediaButton"
            onClick={handleRepeat}
          >
            {repeat == 'off' ? <IconRepeat iconSize={48} /> : repeat == 'context' ? <IconRepeat className={'active'} iconSize={48} /> : <IconRepeatOne className={'active'} iconSize={48} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;