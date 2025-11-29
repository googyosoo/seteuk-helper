import React, { useState } from 'react';
import { generateSeTeuk } from './services/geminiService';
import { SeTeukInput, SeTeukResult, LoadingState } from './types';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { PenTool, GraduationCap, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<SeTeukResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: SeTeukInput) => {
    setLoadingState(LoadingState.LOADING);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateSeTeuk(input);
      setResult(generatedResult);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("작성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. (파일 크기가 너무 크거나 지원되지 않는 형식일 수 있습니다)");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 lg:p-8 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* 16:9 App Container */}
      <div className="w-full max-w-[1600px] aspect-video bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-800 ring-8 ring-slate-900/50">
        
        {/* Header - Fixed at Top */}
        <header className="bg-[#1e1b4b] shadow-lg border-b border-indigo-900 flex-none z-20">
          <div className="w-full px-6 sm:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-inner">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">SeTeuk Master AI</h1>
                <p className="text-xs text-indigo-300 font-medium tracking-wide">선생님을 위한 생활기록부 작성 파트너</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-900/50 border border-indigo-700/50 rounded-full">
               <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
               <span className="text-sm font-medium text-indigo-100">AI Engine Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <main className="w-full h-full px-6 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              
              {/* Left Column: Input */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2 text-lg">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    이렇게 사용하세요
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    학생의 수행평가 결과물(PDF, 사진), 발표 녹음 파일 등을 업로드하거나 
                    특징을 간단히 메모해주세요. <strong>입학사정관 관점</strong>에서 
                    역량이 돋보이는 고품질 세특을 작성해드립니다.
                  </p>
                </div>
                
                <InputForm onSubmit={handleSubmit} loadingState={loadingState} />
              </div>

              {/* Right Column: Output */}
              <div className="lg:col-span-7 pb-10">
                {loadingState === LoadingState.IDLE && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-300 rounded-3xl bg-white/50 min-h-[500px] backdrop-blur-sm">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <PenTool className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-xl font-bold text-slate-600 mb-2">세특 작성을 시작해보세요</p>
                    <p className="text-sm text-slate-500">좌측 폼에 자료를 입력하고 생성 버튼을 눌러주세요.</p>
                  </div>
                )}

                {loadingState === LoadingState.LOADING && (
                  <div className="h-full flex flex-col items-center justify-center p-12 min-h-[500px] bg-white rounded-3xl shadow-sm border border-slate-200">
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">AI가 자료를 분석 중입니다</h3>
                    <div className="space-y-2 text-center">
                      <p className="text-slate-500">업로드된 파일과 텍스트 내용을 심층 분석하고 있습니다.</p>
                      <p className="text-indigo-500 text-sm font-medium animate-pulse">잠시만 기다려주세요...</p>
                    </div>
                  </div>
                )}

                {loadingState === LoadingState.ERROR && (
                  <div className="h-full min-h-[400px] flex items-center justify-center">
                    <div className="bg-red-50 text-red-800 p-8 rounded-2xl border border-red-200 flex flex-col items-center gap-4 max-w-md shadow-lg">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <h3 className="text-lg font-bold">오류가 발생했습니다</h3>
                      <p className="text-center text-sm opacity-90">{error}</p>
                      <button 
                        onClick={() => setLoadingState(LoadingState.IDLE)}
                        className="px-6 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        다시 시도하기
                      </button>
                    </div>
                  </div>
                )}

                {loadingState === LoadingState.SUCCESS && result && (
                  <ResultDisplay result={result} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;