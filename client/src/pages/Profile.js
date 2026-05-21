import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage ? `http://localhost:5000${user.profileImage}` : null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setIsEditing(true);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Name is required');

    setIsLoading(true);
    try {
      const data = new FormData();
      if (formData.name !== user.name) data.append('name', formData.name);
      if (file) data.append('profileImage', file);

      const response = await authService.updateProfile(data);
      updateUser(response.data.data.user);
      setIsEditing(false);
      setFile(null);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords do not match');

    setIsPasswordLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="grid-2 gap-xl">
        {/* Profile Info */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
            Profile Information
          </h2>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 700, color: 'white',
                  overflow: 'hidden', boxShadow: 'var(--shadow-md)'
                }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <label style={{
                  position: 'absolute', bottom: -4, right: -4,
                  background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--color-text-secondary)',
                  transition: 'all var(--transition-fast)'
                }} className="hover:text-primary hover:border-primary">
                  <Camera size={14} />
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{user?.name}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>{user?.email}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-primary">Free Plan</span>
                  {user?.role === 'admin' && <span className="badge badge-active">Admin</span>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => { setFormData({ name: e.target.value }); setIsEditing(true); }}
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Cannot be changed)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input type="email" value={user?.email || ''} disabled className="form-input" style={{ paddingLeft: 42, opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="submit" className="btn btn-primary" disabled={!isEditing || isLoading}>
                {isLoading ? <><div className="spinner"/> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>

        {/* Password Reset & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} className="text-accent" /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="form-input"
                  required
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn btn-secondary" disabled={isPasswordLoading || !passwordData.currentPassword || !passwordData.newPassword}>
                  {isPasswordLoading ? <div className="spinner"/> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '1.1rem' }}>
              <AlertCircle size={18} /> Danger Zone
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Once you delete your account, there is no going back. All your links and analytics will be permanently deleted.
            </p>
            <button className="btn btn-danger btn-sm" onClick={() => toast.error('This action is disabled in the demo')}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
