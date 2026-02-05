import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import Peer from 'simple-peer';

export const useWebRTC = (userId) => {
    const { socket } = useSocket();
    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState(null);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [callType, setCallType] = useState('video'); // 'audio' or 'video'

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        if (!socket) return;

        // Listen for incoming calls
        socket.on('call-user', (data) => {
            console.log('📞 Incoming call from:', data.from, 'Type:', data.callType);
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
            setCallType(data.callType);
        });

        socket.on('call-accepted', (signal) => {
            console.log('✅ Call accepted by remote user');
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        socket.on('call-ended', () => {
            console.log('📴 Call ended by remote user');
            endCall();
        });

        return () => {
            socket.off('call-user');
            socket.off('call-accepted');
            socket.off('call-ended');
        };
    }, [socket]);

    const startCall = async (userToCall, isVideo = true) => {
        try {
            console.log('🎥 Starting call to:', userToCall, 'Video:', isVideo);
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: true
            });

            console.log('✅ Got media stream:', currentStream);
            setStream(currentStream);
            setCallType(isVideo ? 'video' : 'audio');

            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: currentStream
            });

            peer.on('signal', (signal) => {
                console.log('📡 Sending call signal to:', userToCall);
                socket.emit('call-user', {
                    userToCall,
                    signalData: signal,
                    from: userId,
                    callType: isVideo ? 'video' : 'audio'
                });
            });

            peer.on('stream', (remoteStream) => {
                console.log('📺 Received remote stream');
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });

            connectionRef.current = peer;
        } catch (error) {
            console.error('Error accessing media devices:', error);

            let errorMessage = 'Could not access camera/microphone.\n\n';

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Permission denied. Please:\n';
                errorMessage += '1. Click the camera icon in your browser address bar\n';
                errorMessage += '2. Allow camera and microphone access\n';
                errorMessage += '3. Refresh the page and try again';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No camera or microphone found.\n';
                errorMessage += 'Please connect a camera/microphone and try again.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += 'Camera/microphone is already in use by another application.\n';
                errorMessage += 'Please close other apps using your camera/microphone.';
            } else {
                errorMessage += 'Error: ' + error.message;
            }

            alert(errorMessage);
        }
    };

    const answerCall = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: callType === 'video',
                audio: true
            });

            setStream(currentStream);
            setCallAccepted(true);

            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }

            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: currentStream
            });

            peer.on('signal', (signal) => {
                socket.emit('accept-call', {
                    signal,
                    to: caller
                });
            });

            peer.on('stream', (remoteStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });

            peer.signal(callerSignal);
            connectionRef.current = peer;
        } catch (error) {
            console.error('Error accessing media devices:', error);

            let errorMessage = 'Could not access camera/microphone.\n\n';

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage += 'Permission denied. Please:\n';
                errorMessage += '1. Click the camera icon in your browser address bar\n';
                errorMessage += '2. Allow camera and microphone access\n';
                errorMessage += '3. Try accepting the call again';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage += 'No camera or microphone found.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage += 'Camera/microphone is already in use.';
            } else {
                errorMessage += 'Error: ' + error.message;
            }

            alert(errorMessage);
            setReceivingCall(false);
        }
    };

    const endCall = () => {
        setCallEnded(true);
        setCallAccepted(false);
        setReceivingCall(false);

        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        setStream(null);

        socket.emit('end-call', { to: caller || userId });
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return audioTrack.enabled;
            }
        }
        return false;
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return videoTrack.enabled;
            }
        }
        return false;
    };

    return {
        stream,
        myVideo,
        userVideo,
        receivingCall,
        caller,
        callAccepted,
        callEnded,
        callType,
        startCall,
        answerCall,
        endCall,
        toggleAudio,
        toggleVideo
    };
};
