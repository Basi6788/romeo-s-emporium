import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Upload, Send, MessageCircle, HelpCircle, FileText, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Layout from '@/components/Layout';
// 👇 YAHAN FIX KIYA HAI (Sahi path laga diya)
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';

const HelpCenter = () => {
  const formRef = useRef(null);
  const faqRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Order Issue',
    message: ''
  });

  // Animations on Load
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo('.header-text', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    )
    .fromTo(formRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(faqRef.current?.children || [],
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Select
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5000000) { // 5MB limit
        toast.error('Jani file size 5MB se kam rakho!');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      // 1. Upload Image to Supabase Storage
      if (file) {
        // Unique file name banaya taake overwrite na ho
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: urlData } = supabase.storage
          .from('complaint-proofs')
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }

      // 2. Insert Data into Database
      const { error: dbError } = await supabase
        .from('complaints')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            image_url: imageUrl,
            status: 'pending' // Admin ke liye status
          }
        ]);

      if (dbError) throw dbError;

      toast.success('Complaint received! Hum jaldi contact karenge.');
      
      // Reset Form
      setFormData({ name: '', email: '', subject: 'Order Issue', message: '' });
      removeFile();

    } catch (error) {
      console.error('Error:', error);
      toast.error('Oye hoye! Kuch garbar ho gayi. Dubara try karo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-background">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 py-12 min-h-screen">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="header-text inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" /> 24/7 Support
          </div>
          <h1 className="header-text text-4xl md:text-5xl font-black text-foreground">
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">help you?</span>
          </h1>
          <p className="header-text text-muted-foreground max-w-2xl mx-auto text-lg">
            Koi masla aa raha hai? Form fill karo, screenshot lagao, aur chill karo. Romeo sambhal lega!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* FORM SECTION */}
          <div ref={formRef} className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Your Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                    placeholder="Basit Romeo"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="romeo@example.com"
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-foreground focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Subject</label>
                <select 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-foreground focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer"
                >
                  <option>Order Not Received</option>
                  <option>Damaged Product</option>
                  <option>Payment Issue</option>
                  <option>Bug Report</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Message</label>
                <textarea 
                  name="message" 
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Details batao jani, kya masla hua..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-foreground focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* IMAGE UPLOAD AREA */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground ml-1">Attach Screenshot (Optional)</label>
                
                {!previewUrl ? (
                  <label className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-muted-foreground group-hover:text-amber-500" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      <span className="text-amber-500 font-bold">Click to upload</span> or drag and drop
                      <br /> SVG, PNG, JPG (Max 5MB)
                    </p>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-amber-500/50 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={removeFile}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <X className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>Submit Complaint <Send className="w-5 h-5" /></>
                )}
              </button>

            </form>
          </div>

          {/* FAQ / SIDE INFO */}
          <div ref={faqRef} className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Common Questions</h3>
            
            {[
              { q: "Order kab tak milega?", a: "Jani usually 3-4 working days lagte hain. Tracking ID check kar lo." },
              { q: "Return policy kya hai?", a: "Agar cheez tooti hui nikli, tu 7 din ke andar wapas bhej do. No tension." },
              { q: "Payment methods?", a: "Cash on Delivery (COD), JazzCash, aur EasyPaisa available hain." }
            ].map((item, index) => (
              <div key={index} className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-amber-500/50 transition-colors cursor-default">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-500/10 shrink-0">
                    <MessageCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg mb-1">{item.q}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-8 text-white relative overflow-hidden mt-8 shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">Direct Contact?</h3>
                <p className="opacity-90 mb-6">Agar bohot urgent hai tu seedha WhatsApp kar lo.</p>
                <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors w-full sm:w-auto">
                  WhatsApp Us
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;
