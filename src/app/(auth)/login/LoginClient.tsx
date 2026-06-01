// src/app/(auth)/login/LoginClient.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Mail, Eye, EyeOff, Shield, LogIn,
  KeyRound, AlertCircle, CheckCircle2, User
} from 'lucide-react';

export default function LoginClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signIn('credentials', {
        identifier,
        password,
        rememberMe: rememberMe.toString(),
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(222, 47%, 7%) 0%, hsl(222, 47%, 11%) 50%, hsl(215, 47%, 14%) 100%)' }}>

      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 60%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 0 30px rgba(59,130,246,0.2)'
              }}
            >
              <Shield className="w-8 h-8 text-blue-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              SidLocker
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm mt-1"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Personal Digital Document Vault
            </motion.p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identifier */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or username"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'rgba(255,255,255,0.35)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500"
                      style={{ border: '1px solid rgba(255,255,255,0.25)', background: rememberMe ? '#3b82f6' : 'transparent' }}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Remember me</span>
                </label>

                <button type="button"
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(59,130,246,0.8)' }}
                  onClick={() => alert('Please check your .env file for credentials, or run: node scripts/hash-password.js')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                style={{
                  background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: 'white',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to SidLocker
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              🔒 Private & Secure — Single User Access Only
            </p>
          </div>
        </div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-center flex items-center justify-center gap-2"
          style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}
        >
          <KeyRound className="w-3 h-3" />
          <span>Protected by NextAuth • bcrypt password hashing</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
