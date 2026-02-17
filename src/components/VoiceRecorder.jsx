import { useState, useRef, useEffect } from 'react';
import { FiMic, FiSquare, FiSend, FiX } from 'react-icons/fi';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onSend, onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) {
                await startRecording(isMountedRef);
            }
        };

        const isMountedRef = { current: true }; // Use object ref for passing to async function

        init();

        return () => {
            isMounted = false;
            isMountedRef.current = false;
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async (mountedRef) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Check if component is still mounted before proceeding
            if (mountedRef && !mountedRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Ensure we handle stop even if unmounted to release stream
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                // Only update state if mounted
                if (!mountedRef || mountedRef.current) {
                    setAudioBlob(blob);
                    setAudioURL(URL.createObjectURL(blob));
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            if (!mountedRef || mountedRef.current) {
                setIsRecording(true);

                // Start timer
                if (timerRef.current) clearInterval(timerRef.current); // Clear any existing
                timerRef.current = setInterval(() => {
                    setRecordingTime((prev) => {
                        if (prev >= 300) { // 5 minutes max
                            stopRecording();
                            return prev;
                        }
                        return prev + 1;
                    });
                }, 1000);
            } else {
                // If unmounted immediately after start (rare), stop it
                mediaRecorder.stop();
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
            if (!mountedRef || mountedRef.current) {
                alert('Could not access microphone. Please grant permission and try again.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 300) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
            onSend(file, recordingTime);
            onClose();
        }
    };

    const handleCancel = () => {
        if (isRecording) {
            stopRecording();
        }
        onClose();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        startRecording();
    }, []);

    return (
        <div className="voice-recorder-modal">
            <div className="voice-recorder-content">
                <div className="voice-recorder-header">
                    <h3>Voice Message</h3>
                    <button className="close-btn" onClick={handleCancel}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="voice-recorder-body">
                    <div className="recording-indicator">
                        {isRecording && !isPaused && (
                            <div className="pulse-dot"></div>
                        )}
                        <FiMic size={48} className={isRecording && !isPaused ? 'recording' : ''} />
                    </div>

                    <div className="recording-time">{formatTime(recordingTime)}</div>

                    {audioURL && !isRecording && (
                        <audio src={audioURL} controls className="audio-preview" />
                    )}

                    <div className="recording-controls">
                        {!audioBlob ? (
                            <>
                                {isRecording && !isPaused && (
                                    <button className="control-btn pause-btn" onClick={pauseRecording}>
                                        Pause
                                    </button>
                                )}
                                {isPaused && (
                                    <button className="control-btn resume-btn" onClick={resumeRecording}>
                                        Resume
                                    </button>
                                )}
                                <button className="control-btn stop-btn" onClick={stopRecording}>
                                    <FiSquare size={20} /> Stop
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="control-btn cancel-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button className="control-btn send-btn" onClick={handleSend}>
                                    <FiSend size={18} /> Send
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecorder;
