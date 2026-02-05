import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import { FiSmile } from 'react-icons/fi';
import './EmojiPickerComponent.css';

const EmojiPickerComponent = ({ onEmojiClick }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = (emojiObject) => {
        onEmojiClick(emojiObject.emoji);
        setShowPicker(false);
    };

    return (
        <div className="emoji-picker-wrapper" ref={pickerRef}>
            <button
                type="button"
                className="btn btn-ghost emoji-button"
                onClick={() => setShowPicker(!showPicker)}
            >
                <FiSmile size={20} />
            </button>

            {showPicker && (
                <div className="emoji-picker-container">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme="dark"
                        searchPlaceHolder="Search emoji..."
                        width="100%"
                        height="400px"
                    />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerComponent;
