/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  Star, 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  CheckCircle,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  reviews: number;
  bio: string;
  skills: string[];
  sessionTypes: ('Mock Interviews' | 'Resume Reviews' | 'Career Guidance')[];
  imagePlaceholderColor: string;
}

interface Booking {
  id?: string;
  mentorName: string;
  mentorId: string;
  topic: 'Mock Interviews' | 'Resume Reviews' | 'Career Guidance';
  date: string;
  time: string;
  status: 'Booked' | 'Completed';
  createdAt: string;
}

interface PremiumMentorshipProps {
  isDark: boolean;
  t: (key: string) => string;
}

export default function PremiumMentorship({ isDark, t }: PremiumMentorshipProps) {
  const { user } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sessionTopic, setSessionTopic] = useState<'Mock Interviews' | 'Resume Reviews' | 'Career Guidance'>('Mock Interviews');
  const [bookingDate, setBookingDate] = useState<string>('2026-06-15');
  const [bookingTime, setBookingTime] = useState<string>('15:00');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  const mentors: Mentor[] = [
    {
      id: 'mentor-1',
      name: 'Dr. Aris Thorne',
      role: 'Principal Giga Systems Architect',
      company: 'Neural Labs Global',
      rating: 4.9,
      reviews: 142,
      bio: 'Leading machine intelligence scalability models for complex logistics. Specializes in multi-turn behavioral simulations and rigorous architecture drills.',
      skills: ['Distributed Systems', 'Go/C++', 'Generative Architecture'],
      sessionTypes: ['Mock Interviews', 'Career Guidance'],
      imagePlaceholderColor: 'from-cyan-500 to-indigo-500'
    },
    {
      id: 'mentor-2',
      name: 'Elena Rostova',
      role: 'Global Talent Acquisition Director',
      company: 'Aether Cryptography',
      rating: 5.0,
      reviews: 204,
      bio: 'Executive coach with 15+ years filtering talent for hyper-growth frameworks. Expert in optimizing CV/Resume presentation layout, impact verbs and leadership profiles.',
      skills: ['Resume Polish', 'Behavioral Alignment', 'Grooming Standards'],
      sessionTypes: ['Resume Reviews', 'Mock Interviews'],
      imagePlaceholderColor: 'from-pink-500 to-rose-500'
    },
    {
      id: 'mentor-3',
      name: 'Soren McCaul',
      role: 'Staff ML Infrastructure Engineer',
      company: 'Nebula Dynamics Group',
      rating: 4.8,
      reviews: 98,
      bio: 'Deep technical veteran in LLM alignment and prompt evaluation pipelines. Soren offers surgical technical mock reviews and highly precise career progression maps.',
      skills: ['Python/PyTorch', 'Prompt Auditing', 'Career Acceleration'],
      sessionTypes: ['Mock Interviews', 'Resume Reviews', 'Career Guidance'],
      imagePlaceholderColor: 'from-amber-500 to-orange-500'
    }
  ];

  // Load existing bookings from Firestore
  useEffect(() => {
    async function loadBookings() {
      if (!user) return;
      setLoadingBookings(true);
      try {
        const bookingsColRef = collection(db, 'mentorshipBookings');
        const q = query(bookingsColRef, where('userId', '==', user.uid));
        const querySnap = await getDocs(q);
        const list: Booking[] = [];
        querySnap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Booking);
        });
        setBookings(list);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    }
    loadBookings();
  }, [user]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMentor) return;
    setSubmitting(true);
    setSuccess(false);

    try {
      const bookingsColRef = collection(db, 'mentorshipBookings');
      const payload: Booking = {
        mentorName: selectedMentor.name,
        mentorId: selectedMentor.id,
        topic: sessionTopic,
        date: bookingDate,
        time: bookingTime,
        status: 'Booked',
        createdAt: new Date().toISOString()
      };

      await addDoc(bookingsColRef, {
        ...payload,
        userId: user.uid
      });

      // Update reactive UI bookings list
      setBookings(prev => [payload, ...prev]);
      setSuccess(true);
      
      // Close booking modal/drawer after delay
      setTimeout(() => {
        setSelectedMentor(null);
        setSuccess(false);
      }, 1500);

    } catch (err) {
      console.error("Failed to store mentorship booking:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-400 py-1 px-2 rounded bg-emerald-500/5 border border-emerald-500/10">
            PREMIUM COACHING ACCESS
          </span>
          <h2 className="text-2xl font-heading font-bold text-white mt-2 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" />
            {t('premiumMentorship')}
          </h2>
          <p className="text-xs text-slate-400">Schedule custom face-to-face consultation modules with seasoned FAANG leads, hiring officers and body language experts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MENTORS CATALOG */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Star className="h-4 w-4 text-emerald-400" />
            {t('mentorProfiles')}
          </h3>

          <div className="space-y-6">
            {mentors.map((mentor) => (
              <GlassCard 
                key={mentor.id} 
                isDark={isDark} 
                className="border border-slate-800/60 p-6 flex flex-col sm:flex-row gap-5 items-start relative hover:border-emerald-500/15 duration-300 transition-all group"
              >
                {/* Visual Avatar Placeholder */}
                <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr ${mentor.imagePlaceholderColor} p-0.5 shadow duration-300 group-hover:rotate-3 flex-shrink-0 flex items-center justify-center`}>
                  <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-heading">
                    {mentor.name.split(' ').pop()?.charAt(0)}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 flex-grow">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold text-white">{mentor.name}</h4>
                      <span className="flex items-center text-[10px] text-yellow-400 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10 font-bold font-mono">
                        <Star className="h-3 w-3 fill-yellow-400 inline mr-0.5" />
                        {mentor.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                      {mentor.role} • <strong className="text-emerald-400">{mentor.company}</strong>
                    </p>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed max-w-xl">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mentor.skills.map((skill, i) => (
                      <span key={i} className="text-[9px] font-mono whitespace-nowrap bg-slate-900 text-slate-450 border border-slate-800 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {mentor.sessionTypes.map((type, i) => {
                      let icon = <BookOpen className="h-3.5 w-3.5" />;
                      if (type === 'Resume Reviews') icon = <FileText className="h-3.5 w-3.5" />;
                      if (type === 'Mock Interviews') icon = <Video className="h-3.5 w-3.5" />;
                      return (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] text-slate-350 font-semibold bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-800">
                          {icon}
                          {type}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:self-center">
                  <button
                    id={`book-mentor-${mentor.id}`}
                    onClick={() => setSelectedMentor(mentor)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Slots
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* BOOKED MODULES MONITOR */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock className="h-4 w-4 text-emerald-400 animate-pulse" />
            My Booked Modules
          </h3>

          <GlassCard isDark={isDark} className="border border-slate-800/60 p-5">
            {loadingBookings ? (
              <div className="text-center py-6 text-slate-500 font-mono text-[10px] uppercase">
                Loading appointments...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs text-balance">
                You have no upcoming booked mentorship events. Choose a slot on the left to schedule Dr. Aris or Elena.
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                {bookings.map((booking, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                        {booking.topic}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-350 px-1.5 py-0.5 rounded font-mono">
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-xs">
                      <p className="font-semibold text-white">Mentor: {booking.mentorName}</p>
                      <p className="text-slate-450 mt-1 flex items-center gap-1 font-mono text-[10px]">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {booking.date} @ {booking.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* COMPACT MODAL FOR BOOKING */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0b0a16] border border-slate-800/80 rounded-2xl p-6 relative shadow-2xl"
            >
              <h4 className="text-lg font-bold font-heading text-white mb-2 flex items-center gap-1.5">
                <Calendar className="h-5 w-5 text-emerald-400" />
                Reserve Mentorship Slot
              </h4>
              <p className="text-xs text-slate-400 mb-6">
                You are scheduling an immersive professional feedback module with <strong>{selectedMentor.name}</strong>.
              </p>

              {success ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
                  <p className="text-sm font-semibold text-white">Slot Registered Sync Completed!</p>
                  <p className="text-xs text-slate-500">Writing details to premium bookings log...</p>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Select Consultation Focus</label>
                    <select
                      value={sessionTopic}
                      onChange={(e: any) => setSessionTopic(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-900 border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {selectedMentor.sessionTypes.map((type, id) => (
                        <option key={id} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Consultation Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-900 border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Time Slot (GMT+5:30)</label>
                      <input
                        type="time"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border bg-slate-900 border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedMentor(null)}
                      className="w-1/2 py-2.5 rounded-lg text-xs font-semibold text-slate-400 border border-slate-800 hover:bg-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-1/2 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 cursor-pointer text-center"
                    >
                      {submitting ? 'Booking...' : 'Confirm Reservation'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
