
import React, { useState, useRef } from 'react';
import { ImageIcon, Sparkles, Download, RefreshCw, X, Camera } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const transformImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: image.split(',')[1] } },
            { text: "Transform this photo into a vibrant, high-quality cartoon 3D animation style. Use bold outlines, bright colors, and clean surfaces like in a Pixar or Disney movie. The characters should look cute and friendly. Keep the facial features recognizable." }
          ]
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setProcessedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      setError("Fehler: API Key nicht gesetzt oder Limit erreicht.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'alice-cartoon.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Header / Logo */}
      <div className="mt-8 mb-12 flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-black border-2 border-white/20 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <span className="text-6xl font-black text-white">A</span>
        </div>
        <h1 className="text-xl font-bold tracking-[0.3em] opacity-80">ALICE</h1>
      </div>

      <main className="w-full max-w-md flex-1 flex flex-col gap-6">
        {!image ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold">Cartoon Maker</h2>
              <p className="text-gray-500">Wähle ein Foto aus deiner Galerie</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <ImageIcon size={28} /> FOTO WÄHLEN
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10">
              <img src={processedImage || image} className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold animate-pulse">Alice zaubert...</p>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            {!processedImage ? (
              <button 
                onClick={transformImage}
                disabled={loading}
                className="w-full bg-blue-600 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Sparkles size={24} /> CARTOON ERSTELLEN
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={download}
                  className="bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <Download size={20} /> SPEICHERN
                </button>
                <button 
                  onClick={() => {setImage(null); setProcessedImage(null);}}
                  className="bg-zinc-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} /> NEU
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setImage(null)}
              className="w-full text-zinc-500 font-medium py-2"
            >
              Abbrechen
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
