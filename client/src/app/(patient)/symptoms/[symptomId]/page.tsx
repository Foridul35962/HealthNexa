"use client"

import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Activity, 
  User, 
  Clock, 
  Thermometer, 
  HeartPulse, 
  AlertTriangle, 
  ShieldAlert, 
  Stethoscope, 
  Home, 
  CornerDownRight,
  AlertCircle,
  Loader2,
  CalendarCheck,
  ChevronRight,
  ArrowRight,
  Trash2
} from 'lucide-react'
import { deleteSymptoms, getSymptomsById } from '@/store/slice/aiSlice'
import { toast } from 'react-toastify'

interface DepartmentItem {
  department: string;
  reason: string;
}

const Page = () => {
    const { symptomId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    
    const { aiLoading, aiResult, deleteLoading } = useSelector((state: RootState) => state.ai)

    const [showDepartmentSelection, setShowDepartmentSelection] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState("")

    useEffect(() => {
        const fetchResult = async () => {
            try {
                await dispatch(getSymptomsById({symptomId: symptomId as string}))
            } catch (error:any) {
                toast.error(error.message)
            }
        }
        if (symptomId && aiResult?._id !== symptomId) {
            fetchResult()
        }
    }, [symptomId, dispatch, aiResult?._id])
    console.log(aiResult)

    const handleDeleteSymptom = async () => {
        if (!symptomId) return
        
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this health assessment records analytics history?")
        if (!confirmDelete) return

        try {
            await dispatch(deleteSymptoms({symptomId:symptomId as string})).unwrap()
            router.push('/symptoms') 
        } catch (error) {
            console.error("Failed to delete health assessment report entity profile:", error)
        }
    }

    if (aiLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Generating your AI health analysis summary...</p>
            </div>
        )
    }

    if (!aiResult) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-2 px-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h3 className="text-lg font-semibold text-slate-800">No Analysis Found</h3>
                <p className="text-slate-500 text-sm text-center">We couldn&apos;t find any assessment related to this reference token key.</p>
            </div>
        )
    }

    // Response structural nesting shortcuts separation
    const patient = aiResult.patientInfo
    const inputData = aiResult.input
    const ai = aiResult.aiResult

    // Emergency Level badge styling logic wrapper
    const getEmergencyStyles = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'high':
            case 'severe':
                return 'bg-rose-50 border-rose-200 text-rose-800'
            case 'moderate':
                return 'bg-amber-50 border-amber-200 text-amber-800'
            default:
                return 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }
    }

    const handleProceedToDoctor = () => {
        if (selectedDepartment) {
            router.push(`/doctors?department=${encodeURIComponent(selectedDepartment)}`)
        } else if (ai?.recommendedDepartment && ai.recommendedDepartment.length > 0) {
            router.push(`/doctors?department=${encodeURIComponent(ai.recommendedDepartment[0].department)}`)
        } else {
            router.push("/doctors")
        }
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Meta Profile Summary Details */}
                <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Health Assessment Report</h1>
                            <div className="flex items-center gap-4 mt-0.5">
                                <p className="text-sm text-slate-500">ID: <span className="font-mono text-xs">{aiResult._id}</span></p>
                                
                                {/* Dynamic Interactive UI Button Trigger Segment Row Node */}
                                <button
                                    onClick={handleDeleteSymptom}
                                    disabled={deleteLoading}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:text-slate-400 flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    {deleteLoading ? "Deleting..." : "Delete Record"}
                                </button>
                            </div>
                        </div>
                    </div>
                    {ai?.emergencyLevel && (
                        <div className={`border rounded-xl px-4 py-2 text-sm font-semibold max-w-fit ${getEmergencyStyles(ai.emergencyLevel.level)}`}>
                            Emergency Level: {ai.emergencyLevel.level?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Patient Summary Section */}
                {ai?.summary && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" /> Clinical Presentation Summary
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">{ai.summary}</p>
                    </div>
                )}

                {/* Grid Container for Input Records vs Diagnostic Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Left Column: Input Information Form Data Tracking */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="border border-slate-100 rounded-2xl p-5 space-y-5 bg-white shadow-xs">
                            <h3 className="font-semibold text-slate-800 border-b border-slate-50 pb-2 text-sm tracking-wider uppercase">
                                Patient Vitals & Logs
                            </h3>
                            
                            {/* Age & Gender Demographics mapping */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-50 p-2.5 rounded-xl">
                                    <span className="text-slate-400 block mb-0.5">Age</span>
                                    <span className="font-semibold text-slate-800 text-sm">{patient?.age || 'N/A'} Yrs</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl capitalize">
                                    <span className="text-slate-400 block mb-0.5">Gender</span>
                                    <span className="font-semibold text-slate-800 text-sm">{patient?.gender || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Essential Measurements Metric Cards */}
                            <div className="space-y-3 text-sm">
                                {inputData?.temperature && (
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500 flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-slate-400" /> Temp</span>
                                        <span className="font-medium text-slate-800">{inputData.temperature} °F</span>
                                    </div>
                                )}
                                {inputData?.bloodPressure && (
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500 flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-slate-400" /> BP</span>
                                        <span className="font-medium text-slate-800">{inputData.bloodPressure}</span>
                                    </div>
                                )}
                                {inputData?.duration && (
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Duration</span>
                                        <span className="font-medium text-slate-800">{inputData.duration}</span>
                                    </div>
                                )}
                            </div>

                            {/* Custom Chips Array dynamic trace container */}
                            <div className="space-y-4 pt-2">
                                {inputData?.symptoms && inputData.symptoms.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 block mb-2">Reported Symptoms</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {inputData.symptoms.map((s, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium capitalize">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {inputData?.existingConditions && inputData.existingConditions.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 block mb-1.5">Co-morbidities</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {inputData.existingConditions.map((c, idx) => (
                                                <span key={idx} className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-lg font-medium capitalize">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {inputData?.allergies && inputData.allergies.length > 0 && (
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 block mb-1.5">Allergen Flags</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {inputData.allergies.map((a, idx) => (
                                                <span key={idx} className="bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-lg font-medium capitalize">{a}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Analysis Conditions Engine Outputs */}
                    <div className="md:col-span-2 space-y-6">
                        
                        {/* Possible Conditions Probabilities Cards Mapping Layout */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
                                <Stethoscope className="w-4 h-4 text-emerald-600" /> Evaluation Differential Diagnosis
                            </h3>

                            <div className="space-y-3">
                                {ai?.possibleConditions?.map((condition, idx) => (
                                    <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="font-semibold text-slate-900 text-base">{condition.name}</h4>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                                                condition.probability === 'high' ? 'bg-rose-50 text-rose-700' :
                                                condition.probability === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {condition.probability} Match
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed pl-1 border-l-2 border-slate-100">{condition.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation triage departments block layout */}
                        {ai?.recommendedDepartment && ai.recommendedDepartment.length > 0 && (
                            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-3">
                                <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Suggested Specialists Consultation</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {ai.recommendedDepartment.map((dept, idx) => (
                                        <div key={idx} className="flex gap-2.5 items-start bg-white p-3.5 rounded-xl border border-slate-100/80 shadow-xs">
                                            <CornerDownRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-sm text-slate-900 block">{dept.department} Unit</span>
                                                <span className="text-xs text-slate-500 block mt-0.5">{dept.reason}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Clinical Context Info & Notes block */}
                {inputData?.additionalNotes && (
                    <div className="border border-slate-100 rounded-xl p-4 text-sm bg-white">
                        <span className="text-xs text-slate-400 font-medium block mb-1">Patient Subjective Notes</span>
                        <p className="text-slate-600 italic">&ldquo;{inputData.additionalNotes}&rdquo;</p>
                    </div>
                )}

                {/* Patient-Doctor Interaction block */}
                <div className="bg-emerald-50 rounded-2xl p-6 space-y-4 border border-emerald-100">
                    <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2.5">
                        <CalendarCheck className="w-6 h-6 text-emerald-600"/>
                        Do you wish to connect with a recommended specialist for a detailed consultation?
                    </h2>
                    
                    {!showDepartmentSelection ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md flex-1 text-sm flex items-center justify-center gap-2 group cursor-pointer"
                                onClick={() => {
                                    setShowDepartmentSelection(true)
                                    if(ai?.recommendedDepartment?.length > 0) {
                                        setSelectedDepartment(ai.recommendedDepartment[0].department)
                                    }
                                }}
                            >
                                Yes, I want to see a doctor
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <button 
                                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2 px-6 rounded-xl flex-1 text-sm flex items-center justify-center gap-2 cursor-pointer"
                                onClick={() => {
                                    setShowDepartmentSelection(false)
                                    setSelectedDepartment("")
                                }}
                            >
                                No, I am satisfied for now
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-5 rounded-xl border border-emerald-100/70 space-y-4 shadow-xs">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                                    Select Recommended Department
                                </label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                >
                                    <option value="" disabled>-- Select a Department --</option>
                                    {ai?.recommendedDepartment?.map((dept: DepartmentItem, idx: number) => (
                                        <option key={`rec-${idx}`} value={dept.department}>
                                            {dept.department} Department
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-4">
                                <button 
                                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                    onClick={() => setShowDepartmentSelection(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                                    onClick={handleProceedToDoctor}
                                    disabled={!selectedDepartment}
                                >
                                    Find Doctors
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Care Guidelines Actions Mapping Matrix Containers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Home Care System Suggestions */}
                    {ai?.homeCareSuggestions && ai.homeCareSuggestions.length > 0 && (
                        <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <Home className="w-4 h-4 text-emerald-600" /> Home Recovery Support
                            </h3>
                            <ul className="space-y-2 text-xs text-slate-600 pl-4 list-disc marker:text-emerald-500">
                                {ai.homeCareSuggestions.map((item, i) => (
                                    <li key={i} className="leading-relaxed">{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Red Flags Extreme Warnings Panel block */}
                    {ai?.redFlags && ai.redFlags.length > 0 && (
                        <div className="border border-rose-100 rounded-2xl p-5 bg-rose-50/20 space-y-3">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-rose-800 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-600" /> High Critical Red Flags
                            </h3>
                            <ul className="space-y-2 text-xs text-rose-900 pl-4 list-disc marker:text-rose-400">
                                {ai.redFlags.map((flag, i) => (
                                    <li key={i} className="leading-relaxed font-medium">{flag}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Triage Decision Window Summary Banner Footer */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-xs uppercase font-medium text-slate-400 tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Clinical Action Guideline
                        </span>
                        <p className="text-sm font-medium text-slate-100 leading-relaxed">{ai?.whenToSeeDoctor}</p>
                    </div>
                </div>

                {/* General Legal Disclaimer Text Section Wrapper */}
                {ai?.disclaimer && (
                    <p className="text-center text-[11px] text-slate-400 italic">
                        *Disclaimer: {ai.disclaimer} Always perform formal lab testing analysis procedures before medications modification.
                    </p>
                )}
            </div>
        </div>
    )
}

export default Page