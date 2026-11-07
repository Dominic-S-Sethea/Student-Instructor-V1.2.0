import React, { useState } from 'react';
import { X, Package, Sparkles, Check, Plus, BookOpen, Layers } from 'lucide-react';
import { ClientStudentInventoryItem, ClientAvatarItem } from '../../types';
import { RoomObjectRenderer } from './RoomObjectRenderer';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: ClientStudentInventoryItem[];
  availableItems: ClientAvatarItem[];
  placedItemIds: string[];
  onPlaceItem: (item: ClientAvatarItem) => Promise<void>;
  onInspectItem: (item: ClientAvatarItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  availableItems,
  placedItemIds,
  onPlaceItem,
  onInspectItem,
}) => {
  const [activeTab, setActiveTab] = useState<'owned' | 'catalog'>('owned');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [placingId, setPlacingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Furniture', 'Learning Object', 'Decoration', 'Achievement'];

  const filteredInventory = inventory.filter((inv) => {
    if (selectedCategory === 'All') return true;
    return inv.item.category === selectedCategory;
  });

  const filteredCatalog = availableItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handlePlace = async (item: ClientAvatarItem) => {
    setPlacingId(item.id);
    try {
      await onPlaceItem(item);
    } finally {
      setPlacingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Learning Gear & Room Inventory</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  សារពើភ័ណ្ឌ
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Equip your personal study space with tools, scientific kits, and scholastic decorations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls Bar */}
        <div className="px-6 py-3 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Main Owned vs Catalog Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('owned')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'owned'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Owned Items ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Academic Catalog
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'owned' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredInventory.map(({ item, id }) => {
                const isPlaced = placedItemIds.includes(item.id);
                return (
                  <div
                    key={id}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all bg-white ${
                      isPlaced
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                          {item.category}
                        </span>
                        {isPlaced ? (
                          <span className="flex items-center text-emerald-600 font-bold text-[10px] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 mr-1" /> Placed in Room
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">In Backpack</span>
                        )}
                      </div>

                      {/* Icon preview */}
                      <div
                        onClick={() => onInspectItem(item)}
                        className="w-full h-24 bg-slate-50/80 rounded-xl p-2 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="w-20 h-20 flex items-center justify-center">
                          <RoomObjectRenderer item={item} />
                        </div>
                      </div>

                      {/* Title & info */}
                      <div className="mt-2.5">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>

                      {/* Subject Tag */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                        <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.subject_tag}
                        </span>
                        <span className="text-slate-400">Slot: {item.default_slot}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => onInspectItem(item)}
                        className="flex-1 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handlePlace(item)}
                        disabled={isPlaced || placingId === item.id}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 ${
                          isPlaced
                            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                        }`}
                      >
                        {placingId === item.id ? (
                          <span>Placing...</span>
                        ) : isPlaced ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Placed</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Place</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* CATALOG VIEW (Shows how to unlock) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCatalog.map((item) => {
                const isOwned = inventory.some((inv) => inv.item_id === item.id);
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between bg-white hover:border-slate-300"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                          {item.category}
                        </span>
                        {isOwned ? (
                          <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>

                      <div className="w-full h-24 bg-slate-50/80 rounded-xl p-2 flex items-center justify-center">
                        <div className="w-20 h-20 flex items-center justify-center">
                          <RoomObjectRenderer item={item} />
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">How to Unlock:</div>
                        <div className="text-[11px] text-slate-700 font-medium mt-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>
                            {item.unlock_condition_type === 'free'
                              ? 'Starter Item'
                              : item.unlock_condition_val || 'Achievement reward'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onInspectItem(item)}
                      className="mt-3 w-full py-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 hover:bg-blue-100/70 rounded-xl transition-colors"
                    >
                      View Educational Specs
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
