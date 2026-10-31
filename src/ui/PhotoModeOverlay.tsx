import React, { useState } from 'react';
import {
  Camera, X, Download, Share2, Sparkles, Sliders, Check, RefreshCw, ZoomIn, ZoomOut
} from 'lucide-react';
import { LocationInfo } from '../types';
import { sound } from '../audio/soundSystem';

export type PhotoFilter = 'natural' | 'golden' | 'monsoon' | 'vintage' | 'vivid';

interface PhotoModeOverlayProps {
  isActive: boolean;
  onClose: () => void;
  currentDistrict: LocationInfo | null;
  onCaptureScreenshot: () => string;
  onShareToChat: (photoUrl: string, caption: string, locationName: string) => void;
  onSetCameraFov: (fov: number) => void;
  currentFov: number;
}

export const PhotoModeOverlay: React.FC<PhotoModeOverlayProps> = ({
  isActive,
  onClose,
  currentDistrict,
  onCaptureScreenshot,
  onShareToChat,
  onSetCameraFov,
  currentFov,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('golden');
  const [hasWatermark, setHasWatermark] = useState<boolean>(true);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  if (!isActive) return null;

  // Filter CSS classes for live viewfinder preview
  const getFilterStyle = (filter: PhotoFilter) => {
    switch (filter) {
      case 'golden':
        return 'sepia(0.25) saturate(1.35) contrast(1.08) brightness(1.04)';
      case 'monsoon':
        return 'contrast(1.12) saturate(1.15) hue-rotate(185deg) brightness(0.96)';
      case 'vintage':
        return 'sepia(0.45) contrast(1.15) brightness(0.92) saturate(0.85)';
      case 'vivid':
        return 'saturate(1.55) contrast(1.18) brightness(1.06)';
      case 'natural':
      default:
        return 'none';
    }
  };

  // Capture screenshot and apply filter + watermark
  const handleSnap = async () => {
    sound.playCameraShutter();
    setIsFlashing(true);
    setIsProcessing(true);

    setTimeout(() => {
      setIsFlashing(false);
    }, 120);

    try {
      const rawDataUrl = onCaptureScreenshot();
      const img = new Image();
      img.src = rawDataUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setCapturedPhotoUrl(rawDataUrl);
          setIsProcessing(false);
          return;
        }

        // Apply filter to 2D canvas
        ctx.filter = getFilterStyle(selectedFilter);
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none'; // reset filter for watermark

        // Stamp Authentic Pathein Gold Watermark
        if (hasWatermark) {
          const w = canvas.width;
          const h = canvas.height;
          const padding = 28;

          // Watermark container box
          const boxW = Math.min(360, w * 0.45);
          const boxH = 68;
          const boxX = w - boxW - padding;
          const boxY = h - boxH - padding;

          ctx.fillStyle = 'rgba(10, 15, 29, 0.72)';
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 14);
          ctx.fill();

          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Gold crest circle
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(boxX + 32, boxY + 34, 18, 0, Math.PI * 2);
          ctx.fill();

          // Pagoda peak icon in crest
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.moveTo(boxX + 32, boxY + 22);
          ctx.lineTo(boxX + 41, boxY + 44);
          ctx.lineTo(boxX + 23, boxY + 44);
          ctx.closePath();
          ctx.fill();

          // Text lines
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText('MYANMAR SOCIAL CITY', boxX + 60, boxY + 28);

          ctx.fillStyle = '#fed7aa';
          ctx.font = '500 13px sans-serif';
          const locText = currentDistrict
            ? `${currentDistrict.burmeseName} – ပုသိမ်`
            : 'ပုသိမ်မြို့တော် – Pathein';
          ctx.fillText(locText, boxX + 60, boxY + 48);

          // Timestamp
          const nowStr = new Date().toLocaleDateString('en-GB');
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.fillText(nowStr, boxX + boxW - 65, boxY + 60);
        }

        const finalUrl = canvas.toDataURL('image/png', 0.95);
        setCapturedPhotoUrl(finalUrl);
        setIsProcessing(false);
      };
    } catch {
      setIsProcessing(false);
    }
  };

  // Download photo to local device storage
  const handleDownload = () => {
    if (!capturedPhotoUrl) return;
    const link = document.createElement('a');
    link.download = `Pathein-${currentDistrict?.id || 'City'}-${Date.now()}.png`;
    link.href = capturedPhotoUrl;
    link.click();
    sound.playCoinReward();
  };

  // Share photo directly into City Public Chat
  const handleShareToCityChat = () => {
    if (!capturedPhotoUrl) return;
    const locName = currentDistrict ? currentDistrict.burmeseName : 'ပုသိမ်မြို့';
    const caption = `📸 ${locName} ၏ လှပသော အမှတ်တရ ရှုခင်း ဓာတ်ပုံကို မျှဝေလိုက်ပါတယ်!`;
    onShareToChat(capturedPhotoUrl, caption, locName);
    setShareSuccess(true);
    sound.playQuestComplete();
    setTimeout(() => {
      setShareSuccess(false);
      setCapturedPhotoUrl(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-auto select-none overflow-hidden flex flex-col justify-between">
      {/* Camera White Flash Effect */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-150" />
      )}

      {/* Live Viewfinder Filter Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{ backdropFilter: getFilterStyle(selectedFilter) }}
      />

      {/* 1. Camera Viewfinder Reticle / Framing Brackets */}
      <div className="absolute inset-4 sm:inset-10 pointer-events-none border border-yellow-400/20 rounded-3xl">
        {/* Four Golden Corner Brackets */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-3 border-l-3 border-yellow-400 rounded-tl-xl" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-3 border-r-3 border-yellow-400 rounded-tr-xl" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-3 border-l-3 border-yellow-400 rounded-bl-xl" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-3 border-r-3 border-yellow-400 rounded-br-xl" />

        {/* Center Golden Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-400 -translate-x-1/2" />
        </div>
      </div>

      {/* 2. Top Photography Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between gap-3 z-10">
        <div className="px-4 py-2 rounded-2xl bg-slate-950/85 border border-amber-500/40 shadow-xl flex items-center gap-2.5">
          <Camera className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-200">
              ပုသိမ် အမှတ်တရ ဓာတ်ပုံရိုက်ကူးခြင်း (Photo Mode)
            </h3>
            <p className="text-[10px] text-amber-300/80">
              {currentDistrict ? `📍 ${currentDistrict.burmeseName} (${currentDistrict.englishName})` : '📍 ပုသိမ်မြို့တော်'}
            </p>
          </div>
        </div>

        {/* Exit Photo Mode Button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-amber-500/40 text-amber-300 shadow-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Exit Photo Mode"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold pr-1">ထွက်မည် (Exit)</span>
        </button>
      </div>

      {/* 3. Bottom Photography Controls Bar */}
      <div className="p-4 sm:p-6 flex flex-col items-center gap-3 z-10">
        {/* Control Sub-row: Filter selector & Zoom & Watermark */}
        <div className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-2xl flex flex-wrap items-center justify-center gap-2 text-xs">
          {/* Filter presets */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-amber-400 ml-1 shrink-0" />
            <button
              onClick={() => setSelectedFilter('natural')}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedFilter === 'natural'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              မူလ (Natural)
            </button>
            <button
              onClick={() => setSelectedFilter('golden')}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedFilter === 'golden'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ရွှေဆည်းဆာ (Sunset)
            </button>
            <button
              onClick={() => setSelectedFilter('monsoon')}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedFilter === 'monsoon'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              မိုးဖွဲ (Monsoon)
            </button>
            <button
              onClick={() => setSelectedFilter('vintage')}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedFilter === 'vintage'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ရှေးဟောင်း (Vintage)
            </button>
            <button
              onClick={() => setSelectedFilter('vivid')}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedFilter === 'vivid'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              တောက်ပ (Vivid)
            </button>
          </div>

          {/* Zoom / FOV Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSetCameraFov(70)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-0.5 ${
                currentFov >= 68
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Wide Angle"
            >
              <ZoomOut className="w-3 h-3" />
              <span>0.8x Wide</span>
            </button>
            <button
              onClick={() => onSetCameraFov(55)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                currentFov > 45 && currentFov < 68
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard View"
            >
              <span>1.0x</span>
            </button>
            <button
              onClick={() => onSetCameraFov(38)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all flex items-center gap-0.5 ${
                currentFov <= 45
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Telephoto Zoom"
            >
              <ZoomIn className="w-3 h-3" />
              <span>1.5x Zoom</span>
            </button>
          </div>

          {/* Watermark toggle */}
          <button
            onClick={() => setHasWatermark(!hasWatermark)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-semibold active:scale-95 transition-all ${
              hasWatermark
                ? 'bg-amber-500/20 border-yellow-400 text-yellow-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ပုသိမ် တံဆိပ် (Watermark)</span>
            {hasWatermark && <Check className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>

        {/* Big Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleSnap}
            disabled={isProcessing}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1.5 shadow-2xl active:scale-90 transition-all border-4 border-slate-900 flex items-center justify-center group cursor-pointer"
            title="Take Photo"
          >
            <div className="w-full h-full rounded-full border-2 border-slate-950 bg-amber-400 group-hover:bg-yellow-300 flex items-center justify-center shadow-inner">
              <Camera className="w-8 h-8 text-slate-950" />
            </div>
          </button>
        </div>
      </div>

      {/* 4. Photo Preview & Sharing Modal */}
      {capturedPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-yellow-400/70 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-yellow-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-200">
                    ဓာတ်ပုံ ရိုက်ကူးပြီးပါပြီ! (Photo Captured)
                  </h3>
                  <p className="text-[10px] text-amber-300/80">
                    {currentDistrict ? currentDistrict.burmeseName : 'ပုသိမ်မြို့တော်'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCapturedPhotoUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Render Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-inner bg-black">
              <img
                src={capturedPhotoUrl}
                alt="Pathein Moment"
                className="w-full max-h-[48vh] object-contain rounded-xl mx-auto"
              />
            </div>

            {/* Sharing Feedback Message */}
            {shareSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-200 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-bounce">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>ပုသိမ်မြို့တော် စကားဝိုင်းသို့ ဓာတ်ပုံကို အောင်မြင်စွာ မျှဝေလိုက်ပါပြီ!</span>
              </div>
            )}

            {/* Action Buttons: Save to Device, Share to Chat, Retake */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              {/* Save / Download */}
              <button
                onClick={handleDownload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow"
              >
                <Download className="w-4 h-4 text-yellow-400" />
                <span>စက်ထဲသိမ်းမည် (Save / Download)</span>
              </button>

              {/* Share in City Chat */}
              <button
                onClick={handleShareToCityChat}
                disabled={shareSuccess}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
              >
                <Share2 className="w-4 h-4 fill-slate-950" />
                <span>စကားဝိုင်းတွင် မျှဝေမည် (Share)</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <button
                onClick={() => setCapturedPhotoUrl(null)}
                className="text-slate-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>နောက်တစ်ပုံရိုက်မည် (Retake)</span>
              </button>
              <button
                onClick={() => {
                  setCapturedPhotoUrl(null);
                  onClose();
                }}
                className="text-amber-400 hover:text-amber-300 font-bold"
              >
                ဂိမ်းသို့ပြန်သွားမည် (Back to Game)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
