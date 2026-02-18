import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ArrowUp, Github, Linkedin, Mail, Globe, Code2, Sparkles } from 'lucide-react';

const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/saidaliiev/', icon: Linkedin, color: 'from-blue-500 to-blue-700' },
  { name: 'GitHub', url: 'https://github.com/saidaliiev', icon: Github, color: 'from-gray-700 to-gray-900' },
  { name: 'Fiverr', url: 'https://www.fiverr.com/iskan_dev', icon: Globe, color: 'from-green-500 to-green-700' },
  { name: 'Upwork', url: 'https://www.upwork.com/freelancers/saidaliiev', icon: ExternalLink, color: 'from-emerald-500 to-teal-700' },
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
      className="absolute w-1 h-1 rounded-full bg-white/20"
      initial={{ y: '100%', x, opacity: 0 }}
      animate={{ y: '-100%', opacity: [0, 0.6, 0] }}
      transition={{ duration: 6 + Math.random() * 4, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export default function DevPortfolio({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          exit={{ clipPath: 'inset(100% 0 0 0)' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950">
            {/* Floating particles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <FloatingParticle key={i} delay={i * 0.4} x={`${5 + (i * 6.5) % 90}%`} />
            ))}
            {/* Gradient orbs */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          {/* Scrollable content */}
          <div className="relative z-10 flex-1 overflow-y-auto">
            {/* Close / Swipe indicator */}
            <div className="sticky top-0 z-20 pt-3 pb-2 flex flex-col items-center bg-gradient-to-b from-slate-900/90 to-transparent">
              <motion.div
                className="w-10 h-1 rounded-full bg-white/30 mb-2"
                animate={{ scaleX: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Swipe up or tap to close</span>
              </button>
            </div>

            <div className="px-6 pb-20 max-w-lg mx-auto">
              {/* Hero section */}
              <motion.div
                className="text-center pt-4 pb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Avatar */}
                <motion.div
                  className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-[2px]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Code2 className="w-10 h-10 text-blue-400" />
                  </div>
                </motion.div>

                <h1 className="text-2xl font-bold text-white mb-1">Iskan</h1>
                <p className="text-blue-300/70 text-sm">Full-Stack Developer</p>

                <motion.p
                  className="text-white/40 text-xs mt-3 max-w-xs mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Building modern web applications with passion and precision.
                  <br />
                  Developed with ❤️
                </motion.p>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 text-center">Connect</h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {SOCIAL_LINKS.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white/80 text-xs font-medium group-hover:text-white transition-colors">{link.name}</span>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Projects */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3 text-center">Projects</h2>
                <div className="space-y-2.5">
                  {PROJECTS.map((project, i) => (
                    <motion.div
                      key={project.name}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      <h3 className="text-white text-sm font-semibold">{project.name}</h3>
                      <p className="text-white/40 text-xs mt-0.5">{project.desc}</p>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {project.tech.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300/80 text-[10px] font-medium">{t}</span>
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
                transition={{ delay: 0.9 }}
              >
                <h2 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Get in Touch</h2>
                <a
                  href="mailto:saidaliiev.iskandar@gmail.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  saidaliiev.iskandar@gmail.com
                </a>
              </motion.div>

              {/* Back button */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white/60 text-xs underline underline-offset-4 transition-colors"
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