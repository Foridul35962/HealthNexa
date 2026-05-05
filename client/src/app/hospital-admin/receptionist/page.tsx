"use client";

import { AppDispatch, RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, User,
  Mail, Phone, Lock, Loader2, Check, Camera
} from 'lucide-react';
import {
  addReceptionists,
  deleteReceptionists,
  editReceptionists,
  getAllReceptionists
} from '@/store/slice/hospitalAdminSlice';

const ReceptionistPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hosAdminLoading, allReceptionist, fetchLoading } = useSelector((state: RootState) => state.hosAdmin);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
    }
  });

  useEffect(() => {
    dispatch(getAllReceptionists(null));
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedId(null);
    setSelectedFile(null);
    setPreviewImage(null);
    reset({ fullName: '', email: '', phoneNumber: '', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (data: any) => {
    setEditMode(true);
    setSelectedId(data._id);
    setSelectedFile(null);
    setPreviewImage(data.image?.url || null);
    reset({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: any) => {
    const formData = new FormData();
    formData.append('fullName', values.fullName);
    formData.append('phoneNumber', values.phoneNumber);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      if (editMode && selectedId) {
        await dispatch(editReceptionists({ data: formData, receptionistId: selectedId })).unwrap();
        toast.success("Receptionist Updated!");
      } else {
        if (!selectedFile) return toast.error('Profile image is required');
        formData.append('email', values.email);
        formData.append('password', values.password);
        await dispatch(addReceptionists(formData)).unwrap();
        toast.success("Receptionist Added Successfully!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-700">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your clinic receptionists and their access levels.</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)]"
        >
          <Plus size={20} strokeWidth={3} /> Add Receptionist
        </motion.button>
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Profile</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Contact Details</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Date Joined</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode='popLayout'>
                {fetchLoading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Data...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : allReceptionist.map((item: any, index: number) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="relative w-14 h-14">
                        <img src={item.image?.url || '/default-avatar.png'} alt="" className="w-full h-full rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-blue-100 transition-all" />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 text-lg leading-tight">{item.fullName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Receptionist</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
                          <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-white transition-colors"><Mail size={14} className="text-slate-400" /></div>
                          {item.email}
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
                          <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-white transition-colors"><Phone size={14} className="text-slate-400" /></div>
                          {item.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="p-3 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm bg-blue-50">
                          <Edit size={18} />
                        </button>
                        <button
                          disabled={deletingId === item._id}
                          onClick={() => {
                            if (window.confirm("Delete this staff member?")) {
                              setDeletingId(item._id);
                              dispatch(deleteReceptionists({ receptionistId: item._id }))
                                .unwrap()
                                .then(() => toast.success("Staff Deleted"))
                                .finally(() => setDeletingId(null));
                            }
                          }}
                          className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm bg-red-50"
                        >
                          {deletingId === item._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal / Sidebar Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-100 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-101 w-full max-w-lg bg-white h-full shadow-[-20px_0_50px_rgba(0,0,0,0.1)] overflow-y-auto"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{editMode ? "Update Profile" : "Register New Staff"}</h2>
                    <p className="text-slate-400 text-sm font-medium mt-1">Fill in the information below.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Premium Image Upload */}
                  <div className="flex justify-center">
                    <label className="relative group cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100 relative">
                        {previewImage ? (
                          <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <User size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                      <motion.div
                        animate={previewImage ? { scale: [1, 1.2, 1] } : {}}
                        className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg ${previewImage ? 'bg-green-500' : 'bg-blue-600'}`}
                      >
                        {previewImage ? <Check size={18} className="text-white" strokeWidth={3} /> : <Plus size={20} className="text-white" strokeWidth={3} />}
                      </motion.div>
                    </label>
                  </div>

                  <div className="space-y-5">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          {...register("fullName", {
                            required: "FullName is required",
                          })}
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none text-slate-900 font-bold rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                      </div>
                      {errors.fullName && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.fullName.message}</p>}
                    </div>

                    {/* Email Field (Add Mode only) */}
                    {!editMode && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                          <input
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Enter a valid Email"
                              }
                            })}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none text-slate-900 font-bold rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/10 focus:bg-white transition-all"
                            placeholder="staff@hospital.com"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.email.message}</p>}
                      </div>
                    )}

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (BD)</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          {...register("phoneNumber", {
                            required: "phoneNumber is required",
                            pattern: {
                              value: /^(\+8801|8801|01)[3-9]\d{8}$/,
                              message: "phoneNumber is invalid"
                            }
                          })}
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none text-slate-900 font-bold rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {/* Password Field (Add Mode only) */}
                    {!editMode && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                          <input
                            type="password"
                            {...register("password", {
                              required: "password is required",
                              minLength: { value: 8, message: "password must be at least 8 characters" },
                              validate: {
                                hasLetter: (v) => /[a-zA-Z]/.test(v) || "password must contain a letter",
                                hasNumber: (v) => /[0-9]/.test(v) || "password must contain a number",
                              }
                            })}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none text-slate-900 font-bold rounded-2xl outline-none ring-2 ring-transparent focus:ring-blue-500/10 focus:bg-white transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] font-black uppercase mt-1 ml-1">{errors.password.message}</p>}
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={hosAdminLoading}
                    className="w-full bg-slate-900 cursor-pointer disabled:cursor-not-allowed hover:bg-black text-white font-black py-5 rounded-[1.25rem] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all mt-10"
                  >
                    {hosAdminLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{editMode ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{editMode ? "Update Changes" : "Confirm & Create"}</span>
                        <Check size={20} strokeWidth={3} />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceptionistPage;