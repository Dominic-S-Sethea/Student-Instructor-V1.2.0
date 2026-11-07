import React from 'react';
import { X, BookOpen, Trash2, Move, Plus, Sparkles, CheckCircle2, Compass } from 'lucide-react';
import { ClientAvatarItem, ClientRoomObject } from '../../types';
import { RoomObjectRenderer } from './RoomObjectRenderer';

interface ItemDetailModalProps {
  item: ClientAvatarItem | null;
  placedObject?: ClientRoomObject | null;
  isOpen: boolean;
  onClose: () => void;
  onPlace?: (item: ClientAvatarItem) => void;
  onRemove?: (objectId: string) => void;
  onReposition?: (objectId: string, currentX: number, currentY: number) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  placedObject,
  isOpen,
  onClose,
  onPlace,
  onRemove,
  onReposition,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {item.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">Slot: {item.default_slot}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Visual Showcase */}
          <div className="w-full h-40 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-center p-4 shadow-inner">
            <div className="w-36 h-36 flex items-center justify-center">
              <RoomObjectRenderer item={item} />
            </div>
          </div>

          {/* Titles */}
          <div>
            <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
          </div>

          {/* Educational Value Panel */}
          <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-100 space-y-2">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Pedagogical Purpose & Educational Value</span>
            </div>
            <p className="text-xs text-blue-800/90 leading-relaxed pl-6">
              {item.educational_value}
            </p>
            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-700 pl-6">
              <span className="font-semibold">Subject Domain:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                {item.subject_tag}
              </span>
            </div>
          </div>

          {/* Placement Status */}
          {placedObject ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Currently active in room ({placedObject.layer} layer)</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono">
                X: {placedObject.position_x}%, Y: {placedObject.position_y}%
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
              <span>This item is currently safely packed in your inventory.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Close
          </button>

          <div className="flex space-x-2">
            {placedObject ? (
              <>
                <button
                  onClick={() => {
                    if (onReposition) {
                      // nudge position slightly to demonstrate rearrangement
                      const newX = (placedObject.position_x + 8) % 85;
                      const newY = placedObject.position_y;
                      onReposition(placedObject.id, newX, newY);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Nudge Position</span>
                </button>
                <button
                  onClick={() => {
                    if (onRemove) onRemove(placedObject.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Send to Backpack</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (onPlace) onPlace(item);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Place in Room</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
