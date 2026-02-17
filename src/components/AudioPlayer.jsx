import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import './AudioPlayer.css';

const AudioPlayer = ({ audioUrl, duration }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration || 0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setAudioDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        const seekTime = (e.target.value / 100) * audioDuration;
        audio.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

    return (
        <div className="audio-player">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>

            <div className="audio-progress-container">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="audio-progress"
                    style={{
                        background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${progress}%, var(--bg-tertiary) ${progress}%, var(--bg-tertiary) 100%)`
                    }}
                />
                <div className="audio-time">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
