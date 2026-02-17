import { useState, useRef, useEffect } from 'react';
import { FiSmile } from 'react-icons/fi';
import './ReactionPicker.css';

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ReactionPicker = ({ onReactionSelect, onClose }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
                if (onClose) onClose();
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker, onClose]);

    const handleReactionClick = (emoji) => {
        onReactionSelect(emoji);
        setShowPicker(false);
        if (onClose) onClose();
    };

    return (
        <div className="reaction-picker-container" ref={pickerRef}>
            <button
                className="reaction-trigger-btn"
                onClick={() => setShowPicker(!showPicker)}
                title="React to message"
            >
                <FiSmile size={16} />
            </button>

            {showPicker && (
                <div className="reaction-picker-popup">
                    {COMMON_REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            className="reaction-emoji-btn"
                            onClick={() => handleReactionClick(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReactionPicker;
