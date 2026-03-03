import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Linkedin, Mail, Globe, Code2, Sparkles, X, Phone, Facebook, Briefcase } from 'lucide-react';

const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/saidaliiev/', icon: Linkedin, color: 'from-blue-500 to-blue-700' },
  { name: 'GitHub', url: 'https://github.com/saidaliiev', icon: Github, color: 'from-gray-600 to-gray-800' },
  { name: 'Fiverr', url: 'https://www.fiverr.com/iskan_dev', icon: Globe, color: 'from-green-500 to-green-700' },
  { name: 'Upwork', url: 'https://www.upwork.com/freelancers/saidaliiev', icon: ExternalLink, color: 'from-emerald-500 to-teal-700' },
  { name: 'Facebook', url: 'https://www.facebook.com/share/1BqfXYwJLC/', icon: Facebook, color: 'from-blue-600 to-blue-800' },
  { name: 'WhatsApp', url: 'https://api.whatsapp.com/send?phone=15189545476', icon: Phone, color: 'from-green-400 to-green-600' },
  { name: 'Linktree', url: 'https://linktr.ee/saidaliiev', icon: Sparkles, color: 'from-purple-500 to-pink-600' },
];

const PROJECTS = [
  { name: 'SVP CRM', desc: 'Custom CRM for Society St. Vincent de Paul', tech: ['React', 'Base44', 'Tailwind'] },
  { name: 'AI-Powered Apps', desc: 'Full-stack web applications with AI integrations', tech: ['LLM', 'React', 'API'] },
  { name: 'Custom Dashboards', desc: 'Data visualization and management tools', tech: ['Recharts', 'PDF', 'Analytics'] },
];

export default function DevPortfolio({ isOpen, onClose }) {
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      scrollPosRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPosRef.current);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Blurred Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Animated Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute top-[10%] left-[20%] w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]" animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]" animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-white/10 shadow-2xl backdrop-blur-2xl custom-scrollbar"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-10">
              {/* Grid Layout (Bento Box) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
                
                {/* Profile Card (Span 8) */}
                <motion.div 
                  className="lg:col-span-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 p-8 border border-white/50 dark:border-white/5 shadow-sm relative overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                >
                  <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500">
                    <Code2 className="w-64 h-64 text-blue-500" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[3px] shadow-xl shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                         <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/4eb575439_IMG_7239.jpeg" 
                            alt="Iskander Saidaliiev" 
                            className="w-full h-full object-cover"
                         />
                      </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm border border-blue-200 dark:border-blue-500/30">
                        <Sparkles className="w-3.5 h-3.5" /> Open to new projects
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Iskander Saidaliiev</h1>
                      <p className="text-xl text-blue-600 dark:text-blue-400 mb-5 font-semibold">Full-Stack Software Engineer</p>
                      <p className="text-slate-600 dark:text-slate-300 text-base max-w-lg leading-relaxed font-medium">
                        Passionate about building beautiful, functional, and user-centric web applications. Specializing in React, complex workflows, and modern cloud architectures.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Card (Span 4) */}
                <motion.div 
                  className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 border border-white/20 shadow-xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 shadow-inner">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Let's work together!</h3>
                  <p className="text-blue-100 text-base mb-8 font-medium px-4">Have a project in mind? I'd love to help you build it.</p>
                  <a href="mailto:saidaliiev@hotmail.com" className="w-full py-4 px-6 bg-white text-blue-700 rounded-2xl font-bold text-base hover:bg-blue-50 hover:scale-[1.02] transition-all shadow-lg active:scale-95">
                    Send me an email
                  </a>
                </motion.div>

                {/* Social Links (Span 12) */}
                <motion.div 
                  className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                >
                  {SOCIAL_LINKS.map((link) => (
                    <a 
                      key={link.name} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700/90 border border-white/50 dark:border-white/5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl shadow-sm group"
                    >
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300`}>
                        <link.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{link.name}</span>
                    </a>
                  ))}
                </motion.div>

                {/* Projects Section (Span 12) */}
                <motion.div 
                  className="lg:col-span-12 rounded-3xl bg-white/80 dark:bg-slate-800/80 p-8 border border-white/50 dark:border-white/5 shadow-sm"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Featured Work</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {PROJECTS.map((project) => (
                      <div key={project.name} className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors shadow-sm hover:shadow-md group">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.name}</h4>
                        <p className="text-base text-slate-600 dark:text-slate-400 mb-6 min-h-[48px] font-medium">{project.desc}</p>
                        <div className="flex flex-wrap gap-2 mt-auto">
                          {project.tech.map(t => (
                            <span key={t} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-wide shadow-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>
              
              <div className="mt-10 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide">
                  Designed & Developed with ❤️ by Iskander Saidaliiev
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}