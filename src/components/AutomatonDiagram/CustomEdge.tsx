import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export interface CustomEdgeData {
  symbols: string[];
  isActive?: boolean;
  isCurved?: boolean;
  curveOffset?: number;
  isSelfLoop?: boolean;
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
}: EdgeProps) => {
  const edgeData = (data as unknown as CustomEdgeData) || { symbols: [] };
  const symbols = edgeData.symbols || [];
  const isActive = edgeData.isActive;
  const isSelfLoop = edgeData.isSelfLoop || (sourceX === targetX && sourceY === targetY);

  // If self-loop: render SVG cubic Bezier loop on top
  if (isSelfLoop) {
    const loopRadius = 38;
    const path = `M ${sourceX - 12} ${sourceY - 26} C ${sourceX - 25} ${sourceY - 70}, ${sourceX + 25} ${sourceY - 70}, ${sourceX + 12} ${sourceY - 26}`;
    const labelX = sourceX;
    const labelY = sourceY - 62;

    return (
      <>
        <path
          id={id}
          className={`react-flow__edge-path ${isActive ? '!stroke-amber-500 !stroke-[3px]' : '!stroke-slate-600 !stroke-[1.8px]'}`}
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
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
              isActive
                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm scale-110'
                : 'bg-white text-slate-700 border-slate-300 shadow-xs'
            }`}
          >
            {symbols.join(', ')}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  }

  // Standard or curved edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive ? 3 : 1.8,
          stroke: isActive ? '#f59e0b' : '#475569',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-1.5 py-0.5 rounded text-[11px] font-bold border transition-all ${
            isActive
              ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-md scale-110 z-20'
              : 'bg-white text-slate-800 border-slate-300 shadow-xs hover:border-blue-400 z-10'
          }`}
        >
          {symbols.join(', ')}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
