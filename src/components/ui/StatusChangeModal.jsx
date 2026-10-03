// src/components/ui/StatusChangeModal.jsx


import { useState, useRef } from 'react'
import { Camera, X, ChevronDown, AlertCircle, User, ImageIcon } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

const PHOTO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'heic']
const PHOTO_ACCEPT = '.png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic'

function isPhoto(file) {
  return PHOTO_EXTENSIONS.includes(String(file?.name || '').toLowerCase().split('.').pop())
}


function PhotoThumb({ photo, onRemove }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0" title={photo.name}>
      {broken ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-1.5 text-slate-400">
          <ImageIcon size={16} />
          <span className="w-full truncate text-center text-[10px]">{photo.name}</span>
        </div>
      ) : (
        <img src={photo.url} alt={photo.name} onError={() => setBroken(true)} className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        title="Remove photo"
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-slate-900/50 text-white hover:bg-rose-500 transition-colors"
      >
        <X size={11} />
      </button>
    </div>
  )
}


export default function StatusChangeModal({
  open,
  onClose,
  title,
  statuses = [],
  currentStatus,
  onConfirm,
  canActAsSupplier = false,
  busy = false,
  error = '',
  photoNotice = '',
}) {
  const [nextStatus, setNextStatus] = useState('')
  const [photos, setPhotos] = useState([])          // [{ name, type, size, file, url }]
  const [photoError, setPhotoError] = useState('')
  const [note, setNote] = useState('')
  const [actingAsSupplier, setActingAsSupplier] = useState(false)
  const fileRef = useRef(null)

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.url))
    setNextStatus('')
    setPhotos([])
    setPhotoError('')
    setNote('')
    setActingAsSupplier(false)
  }

  function handleClose() {
    if (busy) return
    reset()
    onClose()
  }

  function handleFiles(files) {
    const all = Array.from(files || [])
    const accepted = all.filter(isPhoto)
    const rejected = all.filter((f) => !isPhoto(f))
    setPhotoError(rejected.length
      ? `${rejected.map((f) => `"${f.name}"`).join(', ')} ${rejected.length > 1 ? 'are' : 'is'} not supported. Please attach PNG, JPG, JPEG, or HEIC photos.`
      : '')
    setPhotos((prev) => [
      ...prev,
      ...accepted.map((file) => ({ name: file.name, type: file.type, size: file.size, file, url: URL.createObjectURL(file) })),
    ])
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer?.files)
  }

  async function handleConfirm() {
    if (!nextStatus || busy) return
    const ok = await onConfirm({
      nextStatus,
      photos: photos.map(({ name, type, size, file }) => ({ name, type, size, file })),
      note: note.trim(),
      actingAsSupplier,
    })
    if (ok) {
      reset()
      onClose()
    }
  }

  const availableStatuses = statuses.filter((s) => String(s).toLowerCase() !== String(currentStatus || '').toLowerCase())

  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <div className="flex flex-col gap-5">

      
        {canActAsSupplier && (
          <button
            type="button"
            role="switch"
            aria-checked={actingAsSupplier}
            onClick={() => setActingAsSupplier((v) => !v)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left w-full ${
              actingAsSupplier
                ? 'border-violet-400 bg-violet-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              actingAsSupplier ? 'bg-violet-500' : 'bg-slate-300'
            }`}>
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-semibold leading-none ${actingAsSupplier ? 'text-violet-800' : 'text-slate-600'}`}>
                Acting on behalf of supplier
              </p>
              <p className={`text-[11px] mt-0.5 ${actingAsSupplier ? 'text-violet-500' : 'text-slate-400'}`}>
                {actingAsSupplier ? 'Status will be recorded as supplier action' : 'Toggle to update status on supplier\'s behalf'}
              </p>
            </div>
            <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${actingAsSupplier ? 'bg-violet-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${actingAsSupplier ? 'left-4' : 'left-0.5'}`} />
            </div>
          </button>
        )}

       
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            New Status
          </label>
          <div className="relative">
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 cursor-pointer pr-10"
            >
              <option value="">Select status…</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {currentStatus && (
            <p className="text-[11px] text-slate-400">
              Current: <span className="font-medium text-slate-600">{currentStatus}</span>
            </p>
          )}
        </div>

      
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            Attach Photos <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>

          
          <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
            className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Camera size={16} className="text-indigo-500" />
            </div>
            <div className="text-center">
              <p className="text-[12.5px] font-medium text-slate-600">Drop photos here or click to upload</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, HEIC · Multiple allowed</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}

         
          {photos.length > 0 && (
            <>
              <div className="flex gap-2 flex-wrap mt-1">
                {photos.map((p, i) => (
                  <PhotoThumb key={p.url} photo={p} onRemove={() => removePhoto(i)} />
                ))}
              </div>
              {photoNotice && <p className="text-[11px] text-slate-400">{photoNotice}</p>}
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            Note <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context about this status change…"
            rows={2}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder-slate-400"
          />
        </div>

      
        {!nextStatus && (
          <div className="flex items-center gap-2 text-[11.5px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
            <AlertCircle size={12} />
            Select a new status to continue
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-[13px] text-rose-600">{error}</div>
        )}

       
        <div className="flex gap-2 pt-1">
          <Button onClick={handleConfirm} disabled={!nextStatus || busy} className="flex-1 py-3! text-[14px]!">
            {busy
              ? 'Updating…'
              : photos.length > 0 ? `Update Status · ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'Update Status'}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={busy} className="py-3! text-[14px]!">
            Cancel
          </Button>
        </div>

      </div>
    </Modal>
  )
}
