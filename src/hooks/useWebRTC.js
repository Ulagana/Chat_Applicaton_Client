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
            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
            setCallType(data.callType);
        });

        socket.on('call-accepted', (signal) => {
            setCallAccepted(true);
            connectionRef.current.signal(signal);
        });

        socket.on('call-ended', () => {
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
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: true
            });

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
                socket.emit('call-user', {
                    userToCall,
                    signalData: signal,
                    from: userId,
                    callType: isVideo ? 'video' : 'audio'
                });
            });

            peer.on('stream', (remoteStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });

            connectionRef.current = peer;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Could not access camera/microphone. Please check permissions.');
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
            alert('Could not access camera/microphone. Please check permissions.');
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
