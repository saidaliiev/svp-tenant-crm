import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowDown, Github, Linkedin, Mail, Globe, Code2, Sparkles, X, Phone, Facebook } from 'lucide-react';

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

function FloatingParticle({ delay, x }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-white/15"
      style={{ left: x }}
      initial={{ bottom: '-2%', opacity: 0 }}
      animate={{ bottom: '102%', opacity: [0, 0.5, 0] }}
      transition={{ duration: 8 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function DevPortfolio({ isOpen, onClose }) {
  const scrollRef = useRef(null);
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

  // Swipe down to close (mobile)
  const touchStartY = useRef(null);
  const handleTouchStart = useCallback((e) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);
  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 100) onClose();
    touchStartY.current = null;
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <FloatingParticle key={i} delay={i * 0.5} x={`${6 + (i * 7.5) % 88}%`} />
            ))}
            <motion.div
              className="absolute top-16 left-8 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl"
              animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-32 right-4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl"
              animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto overscroll-contain"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close bar */}
            <div className="sticky top-0 z-20 pt-3 pb-2 flex flex-col items-center bg-gradient-to-b from-slate-900/95 via-slate-900/60 to-transparent backdrop-blur-sm">
              {/* Drag handle — mobile only */}
              <motion.div
                className="w-10 h-1 rounded-full bg-white/25 mb-2 cursor-pointer md:hidden"
                onClick={onClose}
                whileHover={{ scaleX: 1.5 }}
              />
              <button
                onClick={onClose}
                className="md:hidden flex items-center gap-1.5 text-white/40 hover:text-white/70 text-[11px] transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
                <span>Swipe down to close</span>
              </button>
            </div>

            {/* Desktop close — fixed bottom */}
            <button
              onClick={onClose}
              className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-30 items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
              aria-label="Close portfolio"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/30 font-mono">Esc</kbd>
            </button>

            <div className="px-6 pb-24 max-w-lg mx-auto">
              {/* Hero */}
              <motion.div
                className="text-center pt-2 pb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[2px]"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 15 }}
                >
                  <motion.div
                    className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Code2 className="w-10 h-10 text-blue-400" />
                  </motion.div>
                </motion.div>

                <motion.h1
                  className="text-2xl font-bold text-white mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Iskander Saidaliiev
                </motion.h1>
                <motion.p
                  className="text-blue-300/60 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  Full-Stack Developer
                </motion.p>

                <motion.p
                  className="text-white/35 text-xs mt-3 max-w-xs mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  Building modern web applications with passion and precision.
                  <br />
                  Developed with ❤️
                </motion.p>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3 text-center">Connect</h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {SOCIAL_LINKS.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 min-h-[44px]"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.07 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">{link.name}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Projects */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3 text-center">Projects</h2>
                <div className="space-y-2.5">
                  {PROJECTS.map((project, i) => (
                    <motion.div
                      key={project.name}
                      className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.08 }}
                    >
                      <h3 className="text-white text-sm font-semibold">{project.name}</h3>
                      <p className="text-white/35 text-xs mt-0.5">{project.desc}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {project.tech.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/70 text-[10px] font-medium">{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div
                className="text-center pb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >
                <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Get in Touch</h2>
                <a
                  href="mailto:saidaliiev@hotmail.com"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20 min-h-[44px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  saidaliiev@hotmail.com
                </a>
              </motion.div>

              {/* Back */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                <button
                  onClick={onClose}
                  className="text-white/25 hover:text-white/50 text-xs underline underline-offset-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  ← Back to App
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}