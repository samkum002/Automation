import React, { useMemo } from 'react';
import { Automaton, EPSILON, isEpsilon } from '../../types/automaton';
import { Table, Download } from 'lucide-react';

interface TransitionTableProps {
  automaton: Automaton;
  title?: string;
  isNfa?: boolean;
  activeStateIds?: string[];
  className?: string;
}

export function TransitionTable({
  automaton,
  title = 'Transition Table',
  isNfa = true,
  activeStateIds = [],
  className = '',
}: TransitionTableProps) {
  // Determine table columns
  const columns = useMemo(() => {
    const symbols = [...automaton.alphabet];
    if (isNfa) {
      // Check if any transitions have epsilon or add it standardly for ε-NFA
      symbols.push(EPSILON);
    }
    return symbols;
  }, [automaton.alphabet, isNfa]);

  // Compute table matrix: map[stateId][symbol] = string[]
  const matrix = useMemo(() => {
    const table: Record<string, Record<string, string[]>> = {};

    for (const state of automaton.states) {
      table[state.id] = {};
      for (const col of columns) {
        table[state.id][col] = [];
      }
    }

    for (const t of automaton.transitions) {
      const sym = isEpsilon(t.symbol) ? EPSILON : t.symbol;
      if (table[t.from] && table[t.from][sym]) {
        if (!table[t.from][sym].includes(t.to)) {
          table[t.from][sym].push(t.to);
        }
      }
    }

    return table;
  }, [automaton, columns]);

  // Export table to CSV
  const handleExportCsv = () => {
    let csv = `State,${columns.join(',')}\n`;
    for (const state of automaton.states) {
      const prefix = `${state.isInitial ? '->' : ''}${state.isFinal ? '*' : ''}`;
      const stateName = `${prefix}${state.label || state.id}`;
      const rowVals = columns.map((col) => {
        const dests = matrix[state.id]?.[col] || [];
        if (dests.length === 0) return '∅';
        return `"{${dests.sort().join(', ')}}"`;
      });
      csv += `"${stateName}",${rowVals.join(',')}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-slate-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            Initial: <span className="font-semibold text-emerald-700">→</span>, Final:{' '}
            <span className="font-semibold text-purple-700">*</span>
          </span>
          <button
            onClick={handleExportCsv}
            title="Export CSV"
            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto max-h-72">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-2 px-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 w-32">
                State (δ)
              </th>
              {columns.map((col) => (
                <th key={col} className="py-2 px-3 text-center border-r border-slate-200 font-mono">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {automaton.states.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-4 text-center text-slate-400 italic">
                  No states defined.
                </td>
              </tr>
            ) : (
              automaton.states.map((state) => {
                const isSelected = activeStateIds.includes(state.id);

                return (
                  <tr
                    key={state.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* State column */}
                    <td className="py-2 px-3 border-r border-slate-200 sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-1 font-sans">
                        <span className="w-4 text-xs font-bold text-slate-400">
                          {state.isInitial && <span className="text-emerald-600 font-extrabold">→</span>}
                          {state.isFinal && <span className="text-purple-600 font-extrabold">*</span>}
                        </span>
                        <span className={`font-mono ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}>
                          {state.label || state.id}
                        </span>
                      </div>
                    </td>

                    {/* Transition columns */}
                    {columns.map((col) => {
                      const targets = matrix[state.id]?.[col] || [];
                      const hasTargets = targets.length > 0;

                      return (
                        <td
                          key={col}
                          className="py-2 px-3 text-center border-r border-slate-100 text-slate-700"
                        >
                          {hasTargets ? (
                            <span className="text-blue-700 font-semibold bg-blue-50/60 px-1.5 py-0.5 rounded">
                              {`{${targets.sort().join(', ')}}`}
                            </span>
                          ) : (
                            <span className="text-slate-400">∅</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
