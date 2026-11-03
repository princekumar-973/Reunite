import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  Sparkles,
  Loader2,
  Camera,
  RefreshCw,
  LocateFixed,
  Navigation,
  ExternalLink,
  RotateCw,
  Trash2,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { ItemType, ItemCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: ItemType;
}

const CATEGORIES: { code: ItemCategory; label: string; icon: string }[] = [
  { code: 'ELECTRONICS', label: 'Electronics & Gadgets', icon: '💻' },
  { code: 'WALLETS_CARDS', label: 'Wallets, Purses & IDs', icon: '💳' },
  { code: 'KEYS', label: 'Keys & Keychains', icon: '🔑' },
  { code: 'BAGS_BACKPACKS', label: 'Bags & Backpacks', icon: '🎒' },
  { code: 'CLOTHING_ACCESSORIES', label: 'Clothing & Jackets', icon: '🧥' },
  { code: 'BOOKS_STATIONERY', label: 'Books & Documents', icon: '📚' },
  { code: 'JEWELRY_WATCHES', label: 'Jewelry & Watches', icon: '⌚' },
  { code: 'OTHER', label: 'Other / Miscellaneous', icon: '📦' },
];

const PRESET_IMAGES = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
  { label: 'Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80' },
];

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'LOST',
}) => {
  const { user } = useAuth();
  const [itemType, setItemType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('ELECTRONICS');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [campusArea, setCampusArea] = useState('Main Campus');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [dateLostOrFound, setDateLostOrFound] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  
  // Photo states
  const [photoSourceMode, setPhotoSourceMode] = useState<'camera' | 'upload' | 'url'>('camera');
  const [imageUrl, setImageUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlashing, setShutterFlashing] = useState(false);

  const [contactEmail, setContactEmail] = useState(user?.email || 'contact@campus.edu');
  const [contactPhone, setContactPhone] = useState(user?.profile?.phone || '');
  const [secretQuestion, setSecretQuestion] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video and Canvas refs for live photo capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start live webcam / mobile camera
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCameraStream();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setCameraFacing(facing);
    } catch (err: any) {
      console.warn('Unable to access live camera stream:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : 'Unable to start camera. You can upload an image or enter a URL.'
      );
      setIsCameraActive(false);
    }
  };

  // Switch between front and rear cameras
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  // Click / Capture photo from video feed
  const captureLivePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Visual shutter flash effect
    setShutterFlashing(true);
    setTimeout(() => setShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setImageUrl(dataUrl);
      stopCameraStream();
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Stop camera on unmount or when modal is closed
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
  }, [isOpen]);

  // LIVE LOCATION DETECTION
  const handleDetectLiveLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lon);
        setLocationAccuracy(acc);

        // Perform reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const place =
              data.name ||
              addr.building ||
              addr.amenity ||
              addr.university ||
              addr.road ||
              addr.neighbourhood ||
              '';
            const area =
              addr.suburb ||
              addr.city_district ||
              addr.university ||
              addr.city ||
              'Campus Location';

            const formatted = [place, addr.suburb, addr.city].filter(Boolean).join(', ');
            setLocation(formatted || `GPS: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
            if (area) setCampusArea(area);
          } else {
            setLocation(`GPS: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          }
        } catch (e) {
          console.warn('Reverse geocoding network error, using coordinates directly:', e);
          setLocation(`GPS: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location in your browser.');
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.');
        } else {
          setLocationError('Unable to retrieve your current location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleClearLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);
    setLocation('');
    setCampusArea('Main Campus');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/v1/items/', {
        title,
        item_type: itemType,
        category,
        description,
        location,
        campus_area: campusArea,
        latitude: latitude !== null ? latitude : undefined,
        longitude: longitude !== null ? longitude : undefined,
        date_lost_or_found: dateLostOrFound,
        brand,
        primary_color: primaryColor,
        image_url: imageUrl,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        secret_verification_question: secretQuestion,
        status: 'OPEN',
      });

      stopCameraStream();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error reporting item:', err);
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : 'Failed to report item. Please check fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Canvas for Live Photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Report An Item</h3>
              <p className="text-[11px] text-slate-400">
                Post details with live photo and GPS coordinates
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: LOST vs FOUND */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Item Status Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setItemType('LOST')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  itemType === 'LOST'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/25'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                I Lost An Item
              </button>

              <button
                type="button"
                onClick={() => setItemType('FOUND')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  itemType === 'FOUND'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                I Found An Item
              </button>
            </div>
          </div>

          {/* PHOTO SECTION WITH LIVE CAMERA */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <label className="text-xs font-bold text-white">Item Photo / Live Camera</label>
              </div>

              {/* Source Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoSourceMode('camera');
                    if (!imageUrl) startCamera();
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    photoSourceMode === 'camera'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setPhotoSourceMode('upload');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    photoSourceMode === 'upload'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setPhotoSourceMode('url');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    photoSourceMode === 'url'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  URL / Presets
                </button>
              </div>
            </div>

            {/* Camera Viewfinder View */}
            {photoSourceMode === 'camera' && (
              <div className="space-y-3">
                {imageUrl ? (
                  // Preview of clicked photo
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 group">
                    <img
                      src={imageUrl}
                      alt="Captured item"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white shadow-md flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Live Photo Clicked
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          startCamera();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-xs shadow-md cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Live Camera Shutter View
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black">
                    {/* Visual Shutter Flash */}
                    {shutterFlashing && (
                      <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150"></div>
                    )}

                    {isCameraActive ? (
                      <div className="relative w-full h-60 bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />

                        {/* Viewfinder Overlay Crosshairs */}
                        <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
                          <div className="w-8 h-8 border-t-2 border-l-2 border-indigo-400 absolute top-2 left-2"></div>
                          <div className="w-8 h-8 border-t-2 border-r-2 border-indigo-400 absolute top-2 right-2"></div>
                          <div className="w-8 h-8 border-b-2 border-l-2 border-indigo-400 absolute bottom-2 left-2"></div>
                          <div className="w-8 h-8 border-b-2 border-r-2 border-indigo-400 absolute bottom-2 right-2"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-white/40"></div>
                        </div>

                        {/* Live indicator top left */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600/90 text-white flex items-center gap-1.5 shadow">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                          LIVE CAMERA
                        </div>

                        {/* Flip Camera button top right */}
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs border border-white/20 transition-all cursor-pointer shadow"
                          title="Switch Camera (Front/Back)"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Bottom Shutter Controls */}
                        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-20">
                          <button
                            type="button"
                            onClick={captureLivePhoto}
                            className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-indigo-400"
                          >
                            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></div>
                            Click Photo Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Camera not started prompt
                      <div className="h-48 flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                          <Camera className="w-6 h-6" />
                        </div>
                        {cameraError ? (
                          <div className="space-y-1">
                            <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                            <p className="text-[11px] text-slate-400">
                              You can also select "Upload" to choose a photo directly from your device.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              Capture a live photo using your phone or webcam
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Real photos help community members recognize their items faster.
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Open Live Camera
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File Upload Mode */}
            {photoSourceMode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img src={imageUrl} alt="Uploaded" className="w-full h-48 object-cover" />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 rounded-xl bg-rose-500/80 text-white text-xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-36 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-950/60 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-200">
                      Click to browse or take photo from device
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, HEIC up to 10MB</p>
                  </div>
                )}
              </div>
            )}

            {/* URL / Preset Mode */}
            {photoSourceMode === 'url' && (
              <div className="space-y-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {PRESET_IMAGES.map((img) => (
                    <button
                      type="button"
                      key={img.label}
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors cursor-pointer"
                    >
                      +{img.label}
                    </button>
                  ))}
                </div>
                {imageUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-36 bg-slate-950">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Space Gray 14-inch MacBook Pro, Black leather Bellroy wallet..."
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-900 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date {itemType === 'LOST' ? 'Lost' : 'Found'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dateLostOrFound}
                onChange={(e) => setDateLostOrFound(e.target.value)}
                className="w-full bg-slate-900 text-white text-sm px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* LIVE LOCATION SECTION */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {itemType === 'FOUND' ? 'Location Where You Found It' : 'Location Where You Lost It'}
                </span>
              </div>

              {/* LIVE GPS BUTTON */}
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={detectingLocation}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Detecting GPS Coordinates...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>📍 Detect Live Location / GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* GPS Verified Status Badge */}
            {latitude !== null && longitude !== null && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <div>
                    <p className="font-semibold text-emerald-300">
                      Live GPS Acquired: {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
                    </p>
                    {locationAccuracy && (
                      <p className="text-[10px] text-slate-400">
                        Accuracy: ±{locationAccuracy}m • Position verified from device sensor
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Maps <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-slate-400 hover:text-rose-400 p-1"
                    title="Clear coordinates"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {locationError && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Location & Campus Area inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specific Place / Room / Landmark <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Library 2nd Floor, Room 204"
                  className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campus Area / Zone
                </label>
                <input
                  type="text"
                  value={campusArea}
                  onChange={(e) => setCampusArea(e.target.value)}
                  placeholder="e.g. Science Quad, North Campus"
                  className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Brand & Primary Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand / Manufacturer</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Sony, Herschel, Nike..."
                className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Color</label>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. Matte Black, Space Gray, Navy..."
                className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe distinguishing marks, condition, stickers, contents, or circumstances..."
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Secret Verification Question */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-bold text-indigo-300">
                Secret Ownership Challenge Question (Recommended)
              </label>
            </div>
            <p className="text-[11px] text-indigo-200/80 mb-2">
              Write a question only the true owner can answer to prove ownership (e.g. "What sticker is on the back?", "What is the phone lockscreen?").
            </p>
            <input
              type="text"
              value={secretQuestion}
              onChange={(e) => setSecretQuestion(e.target.value)}
              placeholder="e.g. What is engraved or stickered on the item?"
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contact Email <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-900 text-white placeholder-slate-500 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Item Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
