import { useState, useEffect } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import './ActiveCallWindow.css';

const ActiveCallWindow = ({
    myVideo,
    userVideo,
    callType,
    onEndCall,
    onToggleAudio,
    onToggleVideo
}) => {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
    const [isMinimized, setIsMinimized] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleAudio = () => {
        const enabled = onToggleAudio();
        setAudioEnabled(enabled);
    };

    const handleToggleVideo = () => {
        const enabled = onToggleVideo();
        setVideoEnabled(enabled);
    };

    return (
        <div className={`active-call-window ${isMinimized ? 'minimized' : ''}`}>
            <div className="call-video-container">
                {/* Remote Video */}
                <video
                    ref={userVideo}
                    autoPlay
                    playsInline
                    className="remote-video"
                />

                {/* Local Video */}
                <video
                    ref={myVideo}
                    autoPlay
                    muted
                    playsInline
                    className="local-video"
                />

                {/* Call Info */}
                <div className="call-info">
                    <div className="call-status">
                        <span className="status-dot"></span>
                        <span>{formatDuration(callDuration)}</span>
                    </div>
                </div>

                {/* Call Controls */}
                <div className="call-controls">
                    <button
                        className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
                        onClick={handleToggleAudio}
                        title={audioEnabled ? 'Mute' : 'Unmute'}
                    >
                        {audioEnabled ? <FiMic size={24} /> : <FiMicOff size={24} />}
                    </button>

                    {callType === 'video' && (
                        <button
                            className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
                            onClick={handleToggleVideo}
                            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {videoEnabled ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
                        </button>
                    )}

                    <button
                        className="control-btn end-call"
                        onClick={onEndCall}
                        title="End call"
                    >
                        <FiPhoneOff size={24} />
                    </button>

                    <button
                        className="control-btn"
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? 'Maximize' : 'Minimize'}
                    >
                        {isMinimized ? <FiMaximize2 size={24} /> : <FiMinimize2 size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallWindow;
