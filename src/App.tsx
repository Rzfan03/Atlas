import { ArrowUp, ChevronDown, User, Bot, Image as ImageIcon, X, Settings, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);

  const scrollRef = useRef(null);

  const [selectedModel, setSelectedModel] = useState({
    id: 5,
    models: "Step 3.5 Flash",
    slug: "stepfun/step-3.5-flash:free",
    icon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stepfun.ai&size=256"
  });

  const models = [
    { id: 1, models: "gpt-oss-120b", slug: "openai/gpt-oss-120b:free", icon: "https://openrouter.ai/images/icons/OpenAI.svg" },
    { id: 2, models: "Gemma 3 27B", slug: "google/gemma-3-27b-it:free", icon: "https://openrouter.ai/images/icons/GoogleGemini.svg" },
    { id: 3, models: "Nemotron 3 Super", slug: "nvidia/nemotron-3-super-120b-a12b:free", icon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://nvidia.com/&size=256" },
    { id: 4, models: "Trinity Mini", slug: "arcee-ai/trinity-mini:free", icon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.arcee.ai&size=256" },
    { id: 5, models: "Step 3.5 Flash", slug: "stepfun/step-3.5-flash:free", icon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stepfun.ai&size=256" },
    { id: 5, models: "Venice", slug: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", icon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://huggingface.co/&size=256" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key");
    const savedModel = localStorage.getItem("custom_model");
    const savedUseCustom = localStorage.getItem("use_custom_model");
    if (savedKey) setCustomApiKey(savedKey);
    if (savedModel) setCustomModel(savedModel);
    if (savedUseCustom) setUseCustomModel(savedUseCustom === "true");
  }, []);

  const saveSettings = () => {
    localStorage.setItem("openrouter_api_key", customApiKey);
    localStorage.setItem("custom_model", customModel);
    localStorage.setItem("use_custom_model", useCustomModel);
    setShowSettings(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang boleh diupload");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setSelectedImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userContent = [];
    if (input.trim()) {
      userContent.push({ type: "text", text: input.trim() });
    }
    if (selectedImage) {
      userContent.push({
        type: "image_url",
        image_url: { url: selectedImage }
      });
    }

    const userMessage = {
      role: "user",
      content: userContent.length === 1 && userContent[0].type === "text"
        ? input.trim()
        : userContent
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    const apiKey = customApiKey || import.meta.env.VITE_API_KEY;
    const modelSlug = useCustomModel && customModel ? customModel : selectedModel.slug;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rzfanai.com",
          "X-Title": "RzfanAI - Atlas"
        },
        body: JSON.stringify({
          model: modelSlug,
          messages: [
            {
              role: "system",
              content: `Kamu adalah Atlas, seorang teman belajar yang ramah, sabar, suportif, dan sedikit humoris. Kamu berusia 24 tahun, kuliah jurusan Teknik Informatika, tapi kamu suka berbagai bidang ilmu.
         
            Gaya bicaramu:
            - Santai, seperti teman sebaya (pakai bahasa Indonesia sehari-hari, boleh pakai "whopp (kalau ada ide atau kepikiran ide)", "icibos", "waakk", "kek gini bray", "gini ", dll)
            - Ramah, suportif, dan positif
            - Kadang bercanda ringan atau ngegas kalau user lagi males belajar
            - Jangan terlalu formal, jangan kaku
         
            Peranmu:
            Kamu adalah teman belajar serba bisa yang siap membantu user kapan saja dalam hal:
            1. Belajar coding (Python, JavaScript, Java, C++, HTML/CSS, React, Laravel, dll)
            2. Pelajaran umum sekolah/kuliah (Matematika, Fisika, Kimia, Bahasa Inggris, Sejarah, dll)
            3. Persiapan ujian, tugas, atau proyek
            4. Curhat tentang masalah belajar, motivasi, stress, kehidupan kampus/kuliah, dll
            5. Memberi saran belajar yang efektif
            6. Ngobrol santai sehari-hari
         
            Cara menjawab:
            - Selalu tanya dulu kalau belum paham apa yang user mau
            - Kalau user lagi belajar, jelaskan dengan cara yang mudah dipahami, pakai analogi sehari-hari kalau perlu.
            - Untuk coding: berikan penjelasan + kode yang rapi + contoh output + kenapa kode itu ditulis seperti itu.
            - Kalau user curhat: dengarkan dulu, kasih empati, lalu beri perspektif atau solusi yang masuk akal.
            - Motivasi user dengan cara yang tidak norak.
            - Kalau user stuck atau males, boleh ngegas sedikit dengan humor.
         
            Persona tambahan:
            - Kamu optimis tapi realistis
            - Kamu pernah ngerasain susah belajar, jadi paham perasaan user
            - Kamu suka bilang Kita kerjain bareng yuk atau Gue nemenin sampe paham
            - Kalau user bilang "capek", "males", atau "gak ngerti", respon dengan empati dulu baru bantu.
         
            Ingat:
            - Jawab dalam bahasa Indonesia (kecuali user minta bahasa Inggris)
            - Gunakan emoji secukupnya biar lebih hidup (👍, 🔥, 💪, 😂, dll)
            - Jangan terlalu panjang kalau tidak perlu. Jawab natural seperti obrolan teman.
            - Selalu ingat konteks percakapan sebelumnya.
         
            Mulai setiap respons dengan nada ramah dan energik seperti teman.`
            },
            ...messages,
            userMessage
          ],
          temperature: 0.8,
          max_tokens: 2048
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }
      
      const aiMessage = {
        role: "assistant",
        content: data.choices[0].message.content
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Gagal Connect Ke Server, Silahkan Cek Bagian API KEY"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-screen w-full bg-zinc-50 transition-all flex flex-col items-center overflow-hidden font-sans relative">
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-4 left-4 p-2.5 transition-colors cursor-pointer z-50"
      >
        <Settings size={20} className="text-zinc-500 transition-all hover:text-zinc-700" />
      </button>

      {showSettings && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-800">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-zinc-100 rounded-md transition-colors">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">OpenRouter API Key</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-200 text-sm"
                />
                <p className="text-xs text-zinc-400 mt-1">Opsional. Kosongkan untuk pakai default.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useCustom"
                  checked={useCustomModel}
                  onChange={(e) => setUseCustomModel(e.target.checked)}
                  className="w-4 h-4 text-zinc-800 rounded border-zinc-300"
                />
                <label htmlFor="useCustom" className="text-sm text-zinc-700">Gunakan model custom</label>
              </div>
              
              {useCustomModel && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Model Slug</label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="provider/model-name:variant"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-zinc-200 text-sm"
                  />
                  <p className="text-xs text-zinc-400 mt-1">Contoh: openai/gpt-4o:free</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-lg cursor-pointer text-zinc-600 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-white rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors text-sm font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl overflow-y-auto px-6 py-8 space-y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <h1 className="text-2xl font-bold text-zinc-500">Ask Atlas</h1>
            <p className="text-zinc-400 max-w-xs">Start a conversation with Atlas</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-none' : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-200'}`}>
                {typeof msg.content === "string" ? msg.content :
                  msg.content.map((part, i) =>
                    part.type === "text" ? <p key={i}>{part.text}</p> :
                    part.type === "image_url" ? (
                      <img 
                        key={i} 
                        src={part.image_url.url} 
                        alt="uploaded" 
                        className="max-w-full w-full max-h-[420px] object-contain rounded-lg mt-2 border border-zinc-100"
                      />
                    ) : null
                  )
                }
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center animate-pulse shadow-sm">
                <Bot size={16} className="text-zinc-400" />
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl p-4 md:pb-8">
        <div className="bg-white flex flex-col gap-2 p-3 shadow-2xl rounded-2xl border border-zinc-200 w-full transition-all focus-within:ring-2 focus-within:ring-zinc-200">
          {imagePreview && (
            <div className="relative inline-block mb-2">
              <img 
                src={imagePreview} 
                alt="preview" 
                className="max-h-52 w-full object-contain rounded-xl border border-zinc-200"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-zinc-800 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <input
            autoFocus
            className="w-full px-3 py-2 outline-0 bg-transparent text-zinc-800 text-lg placeholder:text-zinc-400"
            placeholder="Tanya Atlas!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
                <ImageIcon size={18} />
                <span>Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {!useCustomModel && (
                <div className="relative inline-flex">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors outline-0"
                  >
                    <img src={selectedModel.icon} className="w-4 h-4 object-contain" alt="" />
                    <span>{selectedModel.models}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 bottom-full mb-3 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl z-50 p-1">
                      {models.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(item);
                            setIsOpen(false);
                          }}
                          className="flex cursor-pointer w-full items-center gap-3 px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                        >
                          <img src={item.icon} className="w-4 h-4 object-contain" alt="" />
                          <span className="flex-1 text-left">{item.models}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {useCustomModel && customModel && (
                <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <Plus size={14} />
                  <span className="truncate max-w-[150px]">{customModel}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="p-2.5 bg-zinc-800 text-white cursor-pointer rounded-xl hover:bg-zinc-800 transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-md"
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-400 mt-3">
          Atlas can make mistakes. Check important info.
        </p>
      </div>
    </section>
  );
};

export default App;