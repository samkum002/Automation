import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export interface StateNodeData {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  nfaSubset?: string[];
  isActive?: boolean;
  isCurrentInStep?: boolean;
  isDeadState?: boolean;
  isEditor?: boolean;
  onToggleInitial?: (id: string) => void;
  onToggleFinal?: (id: string) => void;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

export const CustomStateNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as StateNodeData;
  const {
    id,
    label,
    isInitial,
    isFinal,
    nfaSubset,
    isActive,
    isCurrentInStep,
    isDeadState,
  } = nodeData;

  // Determine styling based on state properties
  let bgClasses = 'bg-white';
  let borderClasses = 'border-slate-700';

  if (isDeadState) {
    bgClasses = 'bg-slate-100 text-slate-500';
    borderClasses = 'border-slate-400 border-dashed';
  } else if (isActive) {
    bgClasses = 'bg-amber-50 text-amber-900';
    borderClasses = 'border-amber-500 ring-4 ring-amber-300 ring-opacity-75 shadow-lg';
  } else if (isCurrentInStep) {
    bgClasses = 'bg-indigo-50 text-indigo-900';
    borderClasses = 'border-indigo-600 ring-4 ring-indigo-300 ring-opacity-60 shadow-md';
  } else if (selected) {
    borderClasses = 'border-blue-600 ring-2 ring-blue-400';
  }

  const isDfaSubset = nfaSubset && nfaSubset.length > 0;

  return (
    <div className="relative group flex items-center justify-center select-none">
      {/* Handles around the state for smooth connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="w-2.5 h-2.5 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="w-2.5 h-2.5 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="w-2.5 h-2.5 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="w-2.5 h-2.5 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-2.5 h-2.5 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="w-2.5 h-2.5 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="w-2.5 h-2.5 !bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-2.5 h-2.5 !bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Initial state arrow pointing from the left */}
      {isInitial && (
        <div className="absolute -left-9 flex items-center pointer-events-none z-10">
          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded shadow-xs mr-0.5 border border-emerald-300">
            Start
          </div>
          <svg
            className="w-4 h-4 text-emerald-600 fill-current -mr-1"
            viewBox="0 0 24 24"
          >
            <path d="M4 12l14 0m-6 -6l6 6l-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      )}

      {/* Main outer circle */}
      <div
        className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center p-1 text-center transition-all duration-200 shadow-sm ${bgClasses} ${borderClasses}`}
      >
        {/* If final state: inner concentric ring */}
        {isFinal ? (
          <div className="w-[50px] h-[50px] rounded-full border-2 border-slate-700 flex flex-col items-center justify-center p-0.5">
            <span className="text-xs font-bold leading-tight truncate max-w-[42px]">
              {id.startsWith('D') ? id : label || id}
            </span>
            {isDfaSubset && (
              <span className="text-[9px] text-blue-700 font-mono leading-none truncate max-w-[42px]">
                {label}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <span className="text-xs font-bold leading-tight truncate max-w-[54px]">
              {id.startsWith('D') ? id : label || id}
            </span>
            {isDfaSubset && (
              <span className="text-[9px] text-blue-700 font-mono leading-none truncate max-w-[54px] mt-0.5">
                {label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active simulation indicator badge */}
      {isActive && (
        <span className="absolute -top-2 -right-1 px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow animate-pulse">
          Active
        </span>
      )}
    </div>
  );
});

CustomStateNode.displayName = 'CustomStateNode';
