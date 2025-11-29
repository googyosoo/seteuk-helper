import React, { useState } from 'react';
import { SeTeukResult } from '../types';
import { Copy, Check, BarChart3, FileSignature, Sparkles } from 'lucide-react';

interface ResultDisplayProps {
  result: SeTeukResult | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. Analysis Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">학생 역량 분석 리포트</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">핵심 키워드</h3>
            <div className="flex flex-wrap gap-3">
              {result.analysis.keywords.map((keyword, idx) => (
                <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                관찰된 강점
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm">
                {result.analysis.strengths}
              </p>
            </div>

            {/* Storyline */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                스토리 라인 설계
              </h3>
              <p className="text-slate-700 leading-relaxed text-sm">
                {result.analysis.storyline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Draft */}
      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden ring-1 ring-indigo-50">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <FileSignature className="w-6 h-6" />
            <h2 className="text-xl font-bold">교과세특 초안</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-md transition-colors text-sm font-medium shadow-inner"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사완료' : '내용 복사'}
          </button>
        </div>
        
        <div className="p-8 bg-slate-50">
          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-800 leading-8 whitespace-pre-wrap font-serif text-lg">
              {result.draft}
            </p>
          </div>
          <div className="mt-4 text-right text-sm text-slate-400">
            공백 포함 {result.draft.length}자 / {new Blob([result.draft]).size} 바이트 (약)
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultDisplay;