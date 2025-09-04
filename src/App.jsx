import React, { useState } from 'react';

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-green-500 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-green-500 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-green-500 rounded-full typing-dot"></div>
    </div>
    <span className="text-green-600 text-sm font-medium">AI is analyzing your projects...</span>
  </div>
);

const App = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB limit.');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setAnalysis('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    setAnalysis('');
    setAnalysisData(null);
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('portfolioLinks', portfolioLinks);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/analyze-resume`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        // Try to extract server error details
        let serverMsg = '';
        try {
          const maybeJson = await response.json();
          serverMsg = maybeJson?.error || maybeJson?.details || '';
        } catch (_) {
          try {
            serverMsg = await response.text();
          } catch (_) {}
        }
        throw new Error(serverMsg ? `Server error ${response.status}: ${serverMsg}` : `Server error ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysis(data.analysis || 'No analysis available.');
      setAnalysisData({
        portfolioScore: data.portfolioScore,
        gamifiedLevel: data.gamifiedLevel,
        skillLevel: data.skillLevel,
        portfolioLinks: data.portfolioLinks
      });
    } catch (err) {
      const respText = err?.message || '';
      setError(respText ? `Failed to analyze portfolio. ${respText}` : 'Failed to analyze portfolio. Please try again later.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-2">gigzs.com</h1>
          <p className="text-lg text-gray-600">AI Project Portfolio Analysis</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 bg-gradient-to-br from-white via-green-25 to-blue-25 rounded-2xl mx-4 my-8">
        {/* Upload Section */}
        <div className="mb-12">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-200 cursor-pointer mb-6
              ${isDragging 
                ? 'border-green-500 bg-green-50' 
                : 'border-green-300 hover:border-green-400 hover:bg-green-25'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center">
              <svg 
                className="w-16 h-16 text-green-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {file ? file.name : 'Drag & drop your CV/Resume PDF here'}
              </h2>
              
              <p className="text-gray-500 mb-4">
                {file ? 'Ready to analyze projects' : 'or click to browse your files'}
              </p>
              
              <p className="text-sm text-gray-400">
                Supports PDF files up to 10 MB
              </p>
            </div>
          </div>

          {/* Portfolio Links Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Portfolio Links (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="portfolio-links" className="block text-sm font-medium text-gray-600 mb-2">
                  Add your portfolio links (GitHub, Behance, personal website, etc.)
                </label>
                <textarea
                  id="portfolio-links"
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="https://github.com/username&#10;https://behance.net/username&#10;https://yourportfolio.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Separate multiple links with new lines. Include GitHub, Behance, Dribbble, or any other portfolio platforms.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className={`w-full py-4 px-8 rounded-lg font-semibold text-white text-lg transition-all duration-200
              ${file && !isLoading 
                ? 'bg-green-500 hover:bg-green-600 transform hover:scale-105' 
                : 'bg-green-300 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                                 Analyzing Projects...
              </div>
            ) : (
              'Analyze Projects'
            )}
          </button>
        </div>

        {/* Gamified Level System */}
        {analysisData && !isLoading && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Portfolio Level System
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score */}
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold mb-2">{analysisData.portfolioScore}/100</div>
                  <div className="text-sm opacity-90">Overall Score</div>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${analysisData.portfolioScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Gamified Level */}
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-2 flex items-center justify-center">
                    {analysisData.gamifiedLevel === 'Bronze' && '🥉'}
                    {analysisData.gamifiedLevel === 'Silver' && '🥈'}
                    {analysisData.gamifiedLevel === 'Gold' && '🥇'}
                    {analysisData.gamifiedLevel === 'Platinum' && '💎'}
                    {analysisData.gamifiedLevel === 'Diamond' && '💠'}
                    <span className="ml-2">{analysisData.gamifiedLevel}</span>
                  </div>
                  <div className="text-sm opacity-90">Achievement Level</div>
                </div>

                {/* Skill Level */}
                <div className="bg-white/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-2">{analysisData.skillLevel}</div>
                  <div className="text-sm opacity-90">Skill Level</div>
                  <div className="mt-2">
                    {analysisData.skillLevel === 'Novice' && <span className="text-xs bg-blue-400 px-2 py-1 rounded">Beginner</span>}
                    {analysisData.skillLevel === 'Intermediate' && <span className="text-xs bg-green-400 px-2 py-1 rounded">Developing</span>}
                    {analysisData.skillLevel === 'Advanced' && <span className="text-xs bg-yellow-400 px-2 py-1 rounded">Skilled</span>}
                    {analysisData.skillLevel === 'Expert' && <span className="text-xs bg-red-400 px-2 py-1 rounded">Master</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {isLoading && (
          <div className="project-chat-box rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                AI Portfolio Analysis
              </h2>
            </div>
            <TypingIndicator />
          </div>
        )}

        {analysis && !isLoading && (
          <div className="project-chat-box rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                                   <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                 </svg>
                 AI Project Analysis
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-green-100 text-sm">
                    {analysis.split(/\s+/).filter(word => word.length > 0).length} words
                  </span>
                  <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto chat-scroll">
              <div className="space-y-4">
                {analysis.split('\n').map((line, index) => {
                  // Check if line contains bold text (**text**)
                  if (line.includes('**')) {
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {parts.map((part, partIndex) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            // Bold text with enhanced styling
                            return (
                              <span key={partIndex} className="bold-text px-1 rounded">
                                {part.slice(2, -2)}
                              </span>
                            );
                          }
                          return part;
                        })}
                      </p>
                    );
                  }
                  
                  // Regular line
                  if (line.trim()) {
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed">
                        {line}
                      </p>
                    );
                  }
                  
                  // Empty line
                  return <div key={index} className="h-2"></div>;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!analysis && !isLoading && (
          <div className="mt-12 bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-3">How it works:</h3>
            <ol className="text-gray-700 space-y-2 list-decimal list-inside">
              <li>Upload your CV/Resume PDF with project information</li>
              <li>Add your portfolio links (GitHub, Behance, personal website, etc.)</li>
              <li>Our AI analyzes your repositories and portfolio platforms</li>
              <li>Get a gamified score and level rating for your portfolio</li>
              <li>Receive detailed feedback on code quality, design, and technical skills</li>
              <li>Use the recommendations to level up your portfolio</li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎮 Gamified Level System</h4>
              <p className="text-sm text-blue-700">
                Get scored on a 0-100 scale with achievement levels: <strong>Bronze</strong> → <strong>Silver</strong> → <strong>Gold</strong> → <strong>Platinum</strong> → <strong>Diamond</strong>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-green-100 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} gigzs.com. All rights reserved.</p>
          <p className="mt-2">Analysis for a better future.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
