import { FiPhone, FiX } from 'react-icons/fi';
import { getChatName, getChatAvatar, generateAvatar } from '../utils/helpers';
import './IncomingCallModal.css';

const IncomingCallModal = ({ caller, callType, onAccept, onReject }) => {
    const callerName = caller?.username || 'Unknown';
    const callerAvatar = caller?.avatar;
    const avatar = generateAvatar(callerName);

    return (
        <div className="incoming-call-modal">
            <div className="incoming-call-content">
                <div className="caller-info">
                    {callerAvatar ? (
                        <img src={callerAvatar} alt={callerName} className="caller-avatar pulse" />
                    ) : (
                        <div className="caller-avatar-placeholder pulse" style={{ background: avatar.bg }}>
                            {avatar.text}
                        </div>
                    )}
                    <h2>{callerName}</h2>
                    <p className="call-type">
                        {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                    </p>
                    <p className="text-muted">Incoming call...</p>
                </div>

                <div className="call-actions">
                    <button className="btn btn-reject" onClick={onReject}>
                        <FiX size={24} />
                        <span>Decline</span>
                    </button>
                    <button className="btn btn-accept" onClick={onAccept}>
                        <FiPhone size={24} />
                        <span>Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;
