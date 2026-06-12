'use client';

import { housekeepingService } from '@/lib/services/housekeeping.service';

import { useState, useEffect } from 'react';
import { HousekeepingTask } from '@/lib/types';
import { Loader2, AlertCircle, Sparkles, User, RefreshCw, Clipboard, CheckSquare } from 'lucide-react';

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Complete task modal
  const [completeModal, setCompleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [notes, setNotes] = useState('');
  const [submittingComplete, setSubmittingComplete] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await housekeepingService.getHousekeepingTasks();
      setTasks(data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch housekeeping tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (taskId: number) => {
    setErrorMsg('');
    try {
      await housekeepingService.claimHousekeepingTask(taskId);
      fetchTasks();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to claim task.');
    }
  };

  const openCompleteModal = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setNotes('');
    setCompleteModal(true);
    setErrorMsg('');
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setSubmittingComplete(true);
    setErrorMsg('');

    try {
      await housekeepingService.completeHousekeepingTask(selectedTask.id, notes);
      setCompleteModal(false);
      fetchTasks();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete task.');
    } finally {
      setSubmittingComplete(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ALL') return true;
    return t.taskStatus === activeTab;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy">Housekeeping Board</h1>
          <p className="text-sm text-stone-500">
            Track room maintenance, claim pending cleanups, and mark rooms ready for guest reception.
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors bg-white shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Filter Links */}
      <div className="flex bg-stone-200/50 p-1 rounded-xl items-center text-xs font-semibold uppercase tracking-wider text-stone-500 w-fit">
        {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab
                ? 'bg-white text-navy shadow-sm'
                : 'hover:text-navy'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-3" />
          <span className="text-sm font-semibold text-stone-500">Loading active tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
          <Sparkles className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-semibold text-navy mb-1">All Clear!</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            There are no room cleaning tasks matching this filter. Good job keeping the resort spotless!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-3xl bg-white border border-stone-100 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Physical Room</span>
                  <span className="text-2xl font-black text-navy">Room {task.room.roomNumber}</span>
                  <span className="text-xs text-stone-500 block mt-0.5">Floor {task.room.floor} | {task.room.category.name}</span>
                </div>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    task.taskStatus === 'PENDING'
                      ? 'bg-amber-50 text-amber-800 ring-amber-600/20 animate-pulse'
                      : task.taskStatus === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 ring-blue-700/10'
                      : 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                  }`}
                >
                  {task.taskStatus}
                </span>
              </div>

              {/* Staff Assigned Details */}
              <div className="text-xs text-stone-500 border-t border-stone-50 pt-3 flex items-center gap-1.5">
                <User className="h-4 w-4 text-stone-400" />
                {task.assignedTo ? (
                  <span>Assigned: <strong>{task.assignedTo.firstName} {task.assignedTo.lastName}</strong></span>
                ) : (
                  <span className="text-stone-400 italic">Unassigned (Click claim)</span>
                )}
              </div>

              {task.notes && (
                <div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-600 border border-stone-100 italic">
                  &ldquo;{task.notes}&rdquo;
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-50 flex justify-end gap-2">
                {task.taskStatus === 'PENDING' && (
                  <button
                    onClick={() => handleClaim(task.id)}
                    className="w-full rounded-xl bg-gold hover:bg-gold-hover text-white py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Clipboard className="h-3.5 w-3.5" /> Claim Cleanup
                  </button>
                )}
                {task.taskStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={() => openCompleteModal(task)}
                    className="w-full rounded-xl bg-navy hover:bg-navy-light text-white py-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" /> Mark Completed
                  </button>
                )}
                {task.taskStatus === 'COMPLETED' && (
                  <div className="w-full text-center py-2 text-xs font-bold text-success flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4" /> Ready for Guests
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Modal Overlay */}
      {completeModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white overflow-hidden shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-300">
            <div className="bg-navy p-6 text-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gold block mb-1">Task Completion</span>
              <h3 className="font-serif text-xl font-semibold">Report Room Status</h3>
              <p className="text-stone-400 text-xs mt-1">Concluding Room {selectedTask.room.roomNumber} Cleanup</p>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Maintenance Notes (e.g. Linen changed)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe work completed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-stone-100 justify-end">
                <button
                  type="button"
                  onClick={() => setCompleteModal(false)}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplete}
                  className="rounded-xl bg-gold hover:bg-gold-hover text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {submittingComplete && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm Ready
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
