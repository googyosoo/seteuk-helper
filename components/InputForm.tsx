import React, { useState, useRef } from 'react';
import { SeTeukInput, LoadingState, UploadedFile } from '../types';
import { Send, FileText, UserCheck, Settings2, Plus, X, UploadCloud, File, Trash2, Image as ImageIcon, Music, FileType2, Keyboard } from 'lucide-react';

interface InputFormProps {
  onSubmit: (input: SeTeukInput) => void;
  loadingState: LoadingState;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loadingState }) => {
  const [activityData, setActivityData] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const [lengthOption, setLengthOption] = useState('표준 (1500바이트/500자 내외)');
  const [keywordInput, setKeywordInput] = useState('');
  const [emphasisKeywords, setEmphasisKeywords] = useState<string[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddKeyword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (keywordInput.trim() && !emphasisKeywords.includes(keywordInput.trim())) {
      setEmphasisKeywords([...emphasisKeywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEmphasisKeywords(emphasisKeywords.filter(k => k !== keyword));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (selectedFiles: File[]) => {
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setFiles(prev => [...prev, {
          data: base64String,
          mimeType: file.type || 'application/octet-stream', // Fallback for files without type
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityData.trim() && !teacherComments.trim() && files.length === 0) {
      alert("학생 활동 자료(텍스트 또는 파일)나 교사 평가 중 적어도 하나는 입력해주세요.");
      return;
    }
    onSubmit({
      activityData,
      teacherComments,
      lengthOption,
      emphasisKeywords,
      files
    });
  };

  const isGenerating = loadingState === LoadingState.LOADING;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
    if (mimeType.includes('pdf')) return <FileType2 className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('text') || mimeType === '') return <FileText className="w-5 h-5 text-slate-500" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors group">
        <label className="flex items-center gap-2 text-slate-800 font-bold mb-3 text-lg">
          <UploadCloud className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
          자료 업로드
        </label>
        <p className="text-sm text-slate-500 mb-4">
          활동지, 텍스트 파일, 녹음 파일 등을 업로드하세요. <br/>
          <span className="text-xs text-indigo-500">* PPT는 PDF로 변환하여 업로드하는 것을 권장합니다.</span>
        </p>
        
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group-hover:bg-indigo-50/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            multiple 
            accept="image/*,audio/*,.pdf,.ppt,.pptx,.txt" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7 text-indigo-600" />
          </div>
          <p className="text-slate-700 font-bold text-lg">클릭하여 파일 선택</p>
          <p className="text-xs text-slate-400 mt-1">PDF, 이미지, 오디오, 텍스트(.txt) 지원</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-md border border-slate-100 shadow-sm">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(idx)} 
                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md text-slate-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Text Data Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="flex items-center gap-2 text-slate-800 font-bold mb-3 text-lg">
          <FileText className="w-6 h-6 text-blue-600" />
          텍스트 자료 입력
        </label>
        <textarea
          className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-slate-700 placeholder:text-slate-400 leading-relaxed"
          placeholder="파일이 없다면 여기에 활동 내용을 직접 입력하세요.&#13;&#10;(예: 수행평가 주제, 본인이 맡은 역할, 결과물의 주요 내용 등)"
          value={activityData}
          onChange={(e) => setActivityData(e.target.value)}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="flex items-center gap-2 text-slate-800 font-bold mb-3 text-lg">
          <UserCheck className="w-6 h-6 text-green-600" />
          교사 평가 / 코멘트
        </label>
        <textarea
          className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all resize-none text-slate-700 placeholder:text-slate-400 leading-relaxed"
          placeholder="학생의 평소 수업 태도, 관찰 내용, 강조하고 싶은 인성 요소 등을 입력하세요."
          value={teacherComments}
          onChange={(e) => setTeacherComments(e.target.value)}
        />
      </div>

      {/* Options */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="flex items-center gap-2 text-slate-800 font-bold mb-4 text-lg">
          <Settings2 className="w-6 h-6 text-orange-500" />
          작성 옵션
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">희망 분량</label>
            <select 
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-slate-700 outline-none appearance-none"
              value={lengthOption}
              onChange={(e) => setLengthOption(e.target.value)}
            >
              <option>표준 (1500바이트/500자 내외)</option>
              <option>짧게 (1000바이트/300자 내외)</option>
              <option>길게 (2000바이트/700자 내외)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">강조 역량 (선택)</label>
            <div className="relative">
              <div className="relative flex items-center">
                <Keyboard className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-11 pr-20 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-slate-700 placeholder:text-slate-400 outline-none"
                  placeholder="예: 문제해결력, 리더십"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword(e)}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Keyword Chips */}
            {emphasisKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {emphasisKeywords.map((keyword, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-bold border border-orange-100 animate-fade-in-up">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="w-5 h-5 rounded-full hover:bg-orange-200 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5
          ${isGenerating 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          }`}
      >
        {isGenerating ? (
          <>
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            분석 및 작성 중...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            세특 생성하기
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;