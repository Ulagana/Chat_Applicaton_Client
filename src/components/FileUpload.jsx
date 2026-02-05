import { useState, useRef } from 'react';
import { FiPaperclip, FiX, FiFile, FiImage } from 'react-icons/fi';
import './FileUpload.css';

const FileUpload = ({ onFileSelect, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            alert('File size must be less than 50MB');
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSend = () => {
        if (selectedFile) {
            onFileSelect(selectedFile, preview);
            handleClear();
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return <FiImage size={48} />;
        return <FiFile size={48} />;
    };

    return (
        <div className="file-upload-modal">
            <div className="file-upload-content">
                <div className="file-upload-header">
                    <h3>Send File</h3>
                    <button className="btn btn-ghost" onClick={onClose}>
                        <FiX size={24} />
                    </button>
                </div>

                <div className="file-upload-body">
                    {!selectedFile ? (
                        <div
                            className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiPaperclip size={48} />
                            <p>Drag & drop a file here</p>
                            <p className="text-muted">or click to browse</p>
                            <p className="text-muted text-sm">Max file size: 50MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div className="file-preview-container">
                            {preview ? (
                                <div className="image-preview">
                                    <img src={preview} alt="Preview" />
                                </div>
                            ) : (
                                <div className="file-icon-preview">
                                    {getFileIcon(selectedFile.type)}
                                </div>
                            )}
                            <div className="file-info">
                                <h4>{selectedFile.name}</h4>
                                <p className="text-muted">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={handleClear}>
                                <FiX size={20} /> Remove
                            </button>
                        </div>
                    )}
                </div>

                <div className="file-upload-footer">
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={!selectedFile}
                    >
                        Send File
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
