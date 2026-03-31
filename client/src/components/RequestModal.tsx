import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlumniDirectoryItem } from '../types';

const requestSchema = z.object({
  topic: z.string().min(1, 'Please select a topic'),
  message: z.string().min(50, 'Message must be at least 50 characters'),
  slot1: z.string().min(1, 'Please provide at least one proposed time slot'),
  slot2: z.string().optional(),
  slot3: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestModalProps {
  alumni: AlumniDirectoryItem;
  onClose: () => void;
  onSubmit: (data: { topic: string; message: string; proposedSlots: string[] }) => Promise<void>;
}

export default function RequestModal({ alumni, onClose, onSubmit }: RequestModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    mode: 'onTouched',
  });

  const message = watch('message', '');

  const handleFormSubmit = async (data: RequestFormData) => {
    const slots = [data.slot1, data.slot2, data.slot3].filter(Boolean) as string[];
    await onSubmit({ topic: data.topic, message: data.message, proposedSlots: slots });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request Mentorship</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              with {alumni.user.name} — {alumni.profile.jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Topic */}
          <div>
            <label className="label">Topic *</label>
            <input
              type="text"
              {...register('topic')}
              placeholder="e.g. Resume Review, Interview Prep, Career Guidance..."
              className="input-field"
            />
            {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="label">
              Message * <span className="text-gray-400 font-normal">({message.length} / 50 min)</span>
            </label>
            <textarea
              {...register('message')}
              rows={4}
              placeholder="Introduce yourself and explain what you're looking to get out of this mentorship session..."
              className="input-field resize-none"
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          {/* Proposed Slots */}
          <div>
            <label className="label">Proposed Time Slots</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Provide up to 3 preferred times</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Slot 1 *</label>
                <input
                  type="datetime-local"
                  {...register('slot1')}
                  className="input-field mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errors.slot1 && <p className="text-red-500 text-xs mt-1">{errors.slot1.message}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Slot 2 (optional)</label>
                <input
                  type="datetime-local"
                  {...register('slot2')}
                  className="input-field mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Slot 3 (optional)</label>
                <input
                  type="datetime-local"
                  {...register('slot3')}
                  className="input-field mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
