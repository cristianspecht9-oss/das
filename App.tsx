
import React, { useState, useRef } from 'react';
import { ImageIcon, Sparkles, Download, RefreshCw, Smartphone, AlertCircle, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const transformImage = async () => {
    if (!image) return;
    
    // API KEY CHECK
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      setError("API-Key fehlt in den Vercel-Einstellungen.");
      setShowHelp(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create new instance per request as per best practice
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: image.split(',')[1] 
              } 
            },
            { 
              text: "Transform this image into a vibrant, high-quality 3D Disney/Pixar style cartoon. Use magical lighting, smooth textures, and bold cinematic colors. If it's a person, make them a hero character. If it's a house or object, make it look like a magical location from a movie. Keep the original structure recognizable but stylize everything to look premium and cute." 
            }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      
      if (part?.inlineData) {
        setProcessedImage(`data:image/png;base64,${part.inlineData.data}`);
      } else {
        const textPart = response.candidates?.[0]?.content?.parts.find(p => p.text);
        throw new Error(textPart?.text || "Die KI konnte das Bild nicht umwandeln.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("429")) {
        setError("Zu viele Anfragen. Bitte kurz warten.");
      } else if (err.message?.includes("API key")) {
        setError("API-Schlüssel ungültig oder nicht gefunden.");
        setShowHelp(true);
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte versuch es nochmal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center selection:bg-zinc-800 font-sans">
      {/* Elegantes Logo Design */}
      <header className="mt-10 mb-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-black border-[3px] border-zinc-800 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
          <span className="text-6xl font-black text-white z-10">A</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-[0.4em] uppercase text-white mb-1">Alice</h1>
          <p className="text-[9px] tracking-[0.3em] text-zinc-500 font-bold uppercase">Pixar Magic Style</p>
        </div>
      </header>

      <main className="w-full max-w-sm flex-1 flex flex-col gap-6">
        {!image ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-zinc-800/50 text-center space-y-4 backdrop-blur-sm">
              <div className="w-20 h-20 bg-zinc-800/80 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-inner">
                 <ImageIcon size={38} />
              </div>
              <h2 className="text-xl font-bold">Foto wählen</h2>
              <p className="text-zinc-500 text-sm">Wähle ein Haus, eine Person oder ein Spielzeug.</p>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.1)]"
            >
              GALERIE ÖFFNEN
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-900 border-2 border-zinc-800 shadow-2xl group">
              <img src={processedImage || image} className="w-full h-full object-cover" alt="Vorschau" />
              {loading && (
                <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center backdrop-blur-md">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-8 font-black tracking-[0.2em] text-white text-sm animate-pulse">ALICE ZAUBERT...</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.5rem] text-sm font-medium flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
                {showHelp && (
                  <div className="mt-2 p-3 bg-black/50 rounded-xl text-xs text-zinc-400 leading-relaxed border border-zinc-800">
                    <p className="font-bold text-zinc-300 mb-1">Lösung:</p>
                    1. Geh auf Vercel.com <br/>
                    2. Settings -> Environment Variables <br/>
                    3. Key: <b>API_KEY</b> eintragen <br/>
                    4. <b>WICHTIG:</b> Danach unter "Deployments" auf <b>Redeploy</b> klicken!
                  </div>
                )}
              </div>
            )}

            {!processedImage ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={transformImage}
                  disabled={loading}
                  className="w-full bg-blue-600 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-900/30 disabled:opacity-30"
                >
                  <Sparkles size={24} /> ZAUBERN
                </button>
                <button 
                  onClick={() => setImage(null)}
                  disabled={loading}
                  className="text-zinc-600 font-bold text-xs uppercase tracking-widest py-3 hover:text-zinc-400 transition-colors"
                >
                  Anderes Foto
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = processedImage;
                    link.download = 'alice-magie.png';
                    link.click();
                  }}
                  className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-white/5"
                >
                  <Download size={24} /> SPEICHERN
                </button>
                <button 
                  onClick={() => {setImage(null); setProcessedImage(null);}}
                  className="w-full bg-zinc-900 text-zinc-400 py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors border border-zinc-800"
                >
                  <RefreshCw size={18} /> NEUER ZAUBER
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-auto pt-10 pb-6 text-zinc-800 text-[10px] font-black tracking-[0.3em] uppercase flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Smartphone size={12} />
          <span>Zum Homescreen hinzufügen</span>
        </div>
        <button onClick={() => setShowHelp(!showHelp)} className="text-zinc-700 flex items-center gap-1 hover:text-zinc-500 transition-colors">
          <HelpCircle size={10} /> Hilfe
        </button>
      </footer>
    </div>
  );
};

export default App;
