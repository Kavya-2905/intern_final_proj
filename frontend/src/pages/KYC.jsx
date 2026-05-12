import { useState, useEffect, useRef } from 'react';
import { kycService } from '../services';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { FiUpload, FiX, FiFile, FiCheckCircle } from 'react-icons/fi';

const KYC = () => {
  const [kycStatus, setKycStatus] = useState('pending');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('aadhaar');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await kycService.getKYCStatus();
      setKycStatus(response.data.data.kycStatus);
      setDocuments(response.data.data.documents || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load KYC status' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setAlert({ type: 'error', message: 'Only JPEG, JPG, PNG, and PDF files are allowed' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'File size must be less than 5MB' });
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return setAlert({ type: 'error', message: 'Please select a file' });
    }
    if (!documentType) {
      return setAlert({ type: 'error', message: 'Please select a document type' });
    }

    setIsUploading(true);
    setUploadProgress(0);

    console.log('Uploading file:', selectedFile.name, 'Type:', documentType);
    console.log('File details:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await kycService.submitKYC(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Upload response:', response);
      setAlert({ type: 'success', message: response.data.message || 'Document uploaded successfully!' });
      
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchKYCStatus();
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      const isDuplicate = error.response?.data?.isDuplicate;
      
      console.log('Showing error:', errorMessage, 'Is duplicate:', isDuplicate);
      
      setAlert({ 
        type: isDuplicate ? 'warning' : 'error', 
        message: errorMessage 
      });
      
      // If duplicate, show the existing document info
      if (isDuplicate && error.response?.data?.existingDocument) {
        const existingDoc = error.response.data.existingDocument;
        console.log('Existing document:', existingDoc);
      }
      
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = () => {
    switch(kycStatus) {
      case 'verified': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = () => {
    switch(kycStatus) {
      case 'verified': return '✓ Verified';
      case 'rejected': return '✗ Rejected';
      default: return '⏳ Pending Review';
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* KYC Status Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">KYC Status</h2>
        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-2xl" />
            <div>
              <p className="text-lg font-semibold capitalize">{kycStatus}</p>
              <p className="text-sm opacity-75">{getStatusIcon()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Upload Document</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type Selector */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Document Type</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)} 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="passport">Passport</option>
              <option value="signature">Signature</option>
              <option value="address">Address Proof</option>
            </select>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : selectedFile 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              disabled={isUploading}
            />

            {!selectedFile ? (
              <div className="space-y-3">
                <FiUpload className="mx-auto text-4xl text-gray-400" />
                <div>
                  <p className="text-gray-700 font-medium">
                    {isDragging ? 'Drop file here' : 'Drag & drop file here'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-gray-400">
                  Supported: JPEG, JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-lg shadow-md"
                  />
                ) : (
                  <FiFile className="mx-auto text-4xl text-primary" />
                )}
                <div>
                  <p className="text-gray-900 font-medium">{selectedFile.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                  disabled={isUploading}
                >
                  <FiX /> Remove File
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Uploading...</span>
                <span className="text-primary font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Uploaded Documents</h2>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FiFile className="text-2xl text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 capitalize">{doc.type || 'Document'}</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          Uploaded
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{doc.filename || 'Document'}</p>
                      {doc.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(doc.size / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Already exists badge */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>️</span>
                    <span>Already exists</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;
