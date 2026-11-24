import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export interface CustomEdgeData {
  transitionId?: string;
  symbol: string;
  isActive?: boolean;
  isSelfLoop?: boolean;
  loopIndex?: number;
  curveOffset?: number;
  [key: string]: unknown;
}

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) => {
  const edgeData = (data as unknown as CustomEdgeData) || { symbol: 'a' };
  const symbol = edgeData.symbol || 'a';
  const isActive = edgeData.isActive;
  const isSelfLoop = edgeData.isSelfLoop || (sourceX === targetX && sourceY === targetY);
  const loopIndex = edgeData.loopIndex || 0;
  const curveOffset = edgeData.curveOffset || 0;

  // 1. Self-Loop Rendering: Multi-loop support without collision
  if (isSelfLoop) {
    let path = '';
    let labelX = sourceX;
    let labelY = sourceY - 60;

    if (loopIndex === 0) {
      // First self loop: Top arc
      path = `M ${sourceX - 10} ${sourceY - 26} C ${sourceX - 28} ${sourceY - 68}, ${sourceX + 28} ${sourceY - 68}, ${sourceX + 10} ${sourceY - 26}`;
      labelY = sourceY - 62;
    } else if (loopIndex === 1) {
      // Second self loop: Higher top arc
      path = `M ${sourceX - 14} ${sourceY - 26} C ${sourceX - 44} ${sourceY - 108}, ${sourceX + 44} ${sourceY - 108}, ${sourceX + 14} ${sourceY - 26}`;
      labelY = sourceY - 102;
    } else if (loopIndex === 2) {
      // Third self loop: Bottom arc
      path = `M ${sourceX - 10} ${sourceY + 26} C ${sourceX - 28} ${sourceY + 68}, ${sourceX + 28} ${sourceY + 68}, ${sourceX + 10} ${sourceY + 26}`;
      labelY = sourceY + 62;
    } else {
      // Fourth+ self loop: Deeper bottom arc
      path = `M ${sourceX - 14} ${sourceY + 26} C ${sourceX - 44} ${sourceY + 108}, ${sourceX + 44} ${sourceY + 108}, ${sourceX + 14} ${sourceY + 26}`;
      labelY = sourceY + 102;
    }

    return (
      <>
        <path
          id={id}
          className={`react-flow__edge-path ${
            isActive
              ? '!stroke-amber-500 !stroke-[3px]'
              : selected
              ? '!stroke-blue-600 !stroke-[2.5px]'
              : '!stroke-slate-600 !stroke-[1.8px]'
          }`}
          d={path}
          style={style}
          markerEnd={markerEnd}
        />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-md scale-110 z-20'
                : selected
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-110 z-20'
                : 'bg-white text-slate-800 border-slate-300 shadow-xs hover:border-blue-400 hover:text-blue-600 z-10'
            }`}
          >
            {symbol}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }

  // 2. Inter-State Transitions: Curved vs Straight
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (Math.abs(curveOffset) < 1) {
    // Gentle default Bezier curve
    const [bPath, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = bPath;
    labelX = lx;
    labelY = ly;
  } else {
    // Offset quadratic Bezier curve for distinct multiple edges
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const dist = Math.hypot(dx, dy) || 1;
    const normX = -dy / dist;
    const normY = dx / dist;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const cx = midX + normX * curveOffset;
    const cy = midY + normY * curveOffset;

    edgePath = `M ${sourceX} ${sourceY} Q ${cx} ${cy} ${targetX} ${targetY}`;
    labelX = 0.25 * sourceX + 0.5 * cx + 0.25 * targetX;
    labelY = 0.25 * sourceY + 0.5 * cy + 0.25 * targetY;
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive ? 3 : selected ? 2.5 : 1.8,
          stroke: isActive ? '#f59e0b' : selected ? '#2563eb' : '#475569',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
            isActive
              ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-md scale-110 z-20'
              : selected
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-110 z-20'
              : 'bg-white text-slate-800 border-slate-300 shadow-xs hover:border-blue-400 hover:text-blue-600 z-10'
          }`}
        >
          {symbol}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
