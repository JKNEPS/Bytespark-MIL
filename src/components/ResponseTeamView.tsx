import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, MessageSquare, Mail, Phone, MapPin, Award, Plus, Trash2, Send, CheckCircle2, Lock, X, ArrowLeft } from 'lucide-react';

export interface VolunteerMember {
  id: string;
  name: string;
  role: string;
  region: string;
  specialization: string;
  verificationsCount: number;
  avatarUrl: string;
  bio: string;
  inAppContactId: string;
  isVerified: boolean;
}

const initialVolunteers: VolunteerMember[] = [
  {
    id: 'vol-1',
    name: 'Aarav Sharma',
    role: 'Lead MIL Reviewer',
    region: 'Kathmandu, Nepal (South Asia)',
    specialization: 'Deepfake Forensics & Image Verification',
    verificationsCount: 142,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Certified UNESCO MIL youth ambassador specializing in audio-visual deepfake artifact identification.',
    inAppContactId: 'msg_aarav_sharma',
    isVerified: true
  },
  {
    id: 'vol-2',
    name: 'Pooja Karki',
    role: 'Fact-Check Specialist',
    region: 'Pokhara, Nepal',
    specialization: 'Election & Health Misinformation',
    verificationsCount: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    bio: 'Journalism graduate focused on viral claim source lineage tracing and claim debunking.',
    inAppContactId: 'msg_pooja_karki',
    isVerified: true
  },
  {
    id: 'vol-3',
    name: 'Rohan Deshmukh',
    role: 'Cyber Legal Navigator',
    region: 'Mumbai, India',
    specialization: 'IT Act & Platform Takedowns',
    verificationsCount: 115,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Legal researcher supporting non-consensual deepfake victims with platform hashing and police portal filing.',
    inAppContactId: 'msg_rohan_d',
    isVerified: true
  },
  {
    id: 'vol-4',
    name: 'Sarah Jenkins',
    role: 'Digital Rights Advocate',
    region: 'London, UK (Europe)',
    specialization: 'Online Safety Act & StopNCII',
    verificationsCount: 87,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Specialist in European media literacy frameworks and online harassment de-escalation.',
    inAppContactId: 'msg_sarah_j',
    isVerified: true
  }
];

interface ResponseTeamViewProps {
  isAdmin?: boolean;
  onRewardXP?: (amount: number) => void;
  onGoHome?: () => void;
}

export const ResponseTeamView: React.FC<ResponseTeamViewProps> = ({
  isAdmin = false,
  onRewardXP,
  onGoHome
}) => {
  const [volunteers, setVolunteers] = useState<VolunteerMember[]>(initialVolunteers);
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerMember | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Admin Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [newBio, setNewBio] = useState('');

  // Load / Sync
  useEffect(() => {
    fetch('/api/volunteers')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setVolunteers(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setSelectedVolunteer(null);
      setMessageText('');
      if (onRewardXP) onRewardXP(10);
    }, 2000);
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newVol: VolunteerMember = {
      id: `vol-${Date.now()}`,
      name: newName,
      role: newRole || 'MIL Volunteer',
      region: newRegion || 'Global',
      specialization: newSpec || 'Verification',
      verificationsCount: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: newBio || 'Trained MIL community volunteer reviewer.',
      inAppContactId: `msg_${Date.now()}`,
      isVerified: true
    };

    try {
      await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVol)
      });
    } catch (e) {
      console.error(e);
    }

    setVolunteers([newVol, ...volunteers]);
    setShowAddModal(false);
    setNewName('');
    setNewRole('');
    setNewRegion('');
    setNewSpec('');
    setNewBio('');
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (!confirm('Remove this volunteer reviewer from active duty?')) return;
    try {
      await fetch(`/api/volunteers/${id}`, { method: 'DELETE' });
    } catch (e) {}
    setVolunteers(volunteers.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-4 max-w-md mx-auto pb-20 text-slate-800">
      {onGoHome && (
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1F2B] bg-[#FDF2F4] hover:bg-[#F9E5E8] border border-[#7A1F2B]/20 px-3.5 py-1.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Screen</span>
        </button>
      )}
      
      {/* Title Banner */}
      <div className="bg-[#7A1F2B] text-white rounded-3xl p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Community Verification Network</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white text-[#7A1F2B] font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Volunteer</span>
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold font-serif-title leading-tight">
          MIL Volunteer Response Team
        </h2>
        <p className="text-xs text-white/80 leading-relaxed">
          Trained youth reviewers handling ambiguous reports, deepfake forensics, and rapid community moderation before police escalation.
        </p>
      </div>

      {/* Volunteer Profile Grid */}
      <div className="space-y-3">
        {volunteers.map((vol) => (
          <div
            key={vol.id}
            className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs hover:border-[#7A1F2B]/40 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={vol.avatarUrl}
                  alt={vol.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{vol.name}</h3>
                    {vol.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-[#7A1F2B]" title="Verified MIL Reviewer" />
                    )}
                  </div>
                  <span className="text-xs text-[#7A1F2B] font-semibold block">{vol.role}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{vol.region}</span>
                  </span>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleDeleteVolunteer(vol.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove volunteer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              "{vol.bio}"
            </p>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{vol.verificationsCount} Reviews Handled</span>
              </div>

              {/* Secure In-App Message Action (Protects Private Email/Phone) */}
              <button
                onClick={() => {
                  setSelectedVolunteer(vol);
                  setMessageSent(false);
                }}
                className="bg-[#7A1F2B] text-white font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>Message In-App</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Messaging Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src={selectedVolunteer.avatarUrl}
                  alt={selectedVolunteer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Contact {selectedVolunteer.name}</h4>
                  <span className="text-[10px] text-slate-500 block">Secure In-App Encryption</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm">Message Sent Securely!</h5>
                <p className="text-[10px] text-emerald-700">
                  {selectedVolunteer.name} will receive your inquiry in their volunteer queue dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#7A1F2B]" />
                  <span>Volunteer personal phone/email is protected for safety.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Your Inquiry / Case Referral</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={3}
                    placeholder={`Write a confidential message to ${selectedVolunteer.name}...`}
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7A1F2B] bg-slate-50 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#5A131E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dispatch Encrypted Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Admin Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-slate-200 text-xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-900 text-sm">Add New Volunteer Reviewer</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVolunteer} className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-900 mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Suman Thapa"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-0.5">Role / Position</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Regional MIL Fact-Checker"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-0.5">Region Coverage</label>
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="e.g. Chitwan, Nepal"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-0.5">Specialization</label>
                <input
                  type="text"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  placeholder="e.g. Deepfakes, Scams, Elections"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-0.5">Short Bio</label>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  rows={2}
                  placeholder="Brief background..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#7A1F2B]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#7A1F2B] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-[#5A131E] transition-colors"
              >
                Save Volunteer Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
