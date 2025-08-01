import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, XCircle, ExternalLink,
  ChevronRight, ChevronDown, HelpCircle, Plus, Search,
  BarChart3, Settings, RefreshCw, FileText, Users,
  Calendar, Trash2, Edit3, Save, X, Info
} from 'lucide-react';

const sortKids = (a, b) => {
  if (a.child_count && !b.child_count) return -1;
  if (!a.child_count && b.child_count) return 1;
  return a.error_type.localeCompare(b.error_type, 'en', { sensitivity: 'base' });
};

const DiagnosticInterface = () => {
  /* 1 ─ Personal info */
  const [personal, setPersonal] = useState({ vessel: '', system: '', serial: '' });

  /* 2 ─ Hierarchical tree */
  const [cache, setCache] = useState(new Map());
  const [expanded, setExpanded] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [id2name, setId2name] = useState({});
  const [rootId, setRootId] = useState(null);

  /* 3 ─ Diagnostic flow */
  const [allErr, setAllErr] = useState([]);
  const [visErr, setVisErr] = useState([]);
  const [allQs, setAllQs] = useState([]);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const [fixedProblem, setFixedProblem] = useState(null);
  
  /* UI state */
  const [expandedErrors, setExpandedErrors] = useState({});
  const [diagnosticStats, setDiagnosticStats] = useState(null);
  const [questionStats, setQuestionStats] = useState({});
  const [showNewDiagnostic, setShowNewDiagnostic] = useState(false);
  const [newDiagnosticText, setNewDiagnosticText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [contactConsent, setContactConsent] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);

  /* misc */
  const [systems, setSystems] = useState([]);
  const [error, setError] = useState(null);
  const API = 'http://localhost:3001/api';

  // Mock data for demonstration
  useEffect(() => {
    setSystems([
      { id: 1, error_type: 'Propulsion System' },
      { id: 2, error_type: 'Navigation System' },
      { id: 3, error_type: 'Power Management' },
      { id: 4, error_type: 'Safety Systems' }
    ]);
  }, []);

  const fetchQuestionStats = async () => {
    // Mock implementation for demo
    setQuestionStats({});
  };

  const fetchDiagnosticStats = async () => {
    // Mock implementation for demo
    setDiagnosticStats(null);
  };

  const createDiagnosticSession = async () => {
    // Mock implementation for demo
    setSessionId('demo-session-' + Date.now());
  };

  const updateDiagnosticSession = async (updates) => {
    // Mock implementation for demo
    console.log('Session updated:', updates);
  };

  const fetchChildren = async (parentId) => {
    if (cache.has(parentId)) return;
    
    // Mock data for demonstration
    const mockChildren = [
      { id: 10, error_type: 'Engine Failure', child_count: 0 },
      { id: 11, error_type: 'Fuel System', child_count: 3 },
      { id: 12, error_type: 'Transmission', child_count: 0 },
    ];
    
    setCache(m => new Map(m).set(parentId, mockChildren));
    setId2name(m => {
      const n = { ...m };
      mockChildren.forEach(k => (n[k.id] = k.error_type));
      return n;
    });
  };
  
  const toggleExpand = async (n) => {
    if (!n.child_count) return;
    const next = new Set(expanded);
    next.has(n.id) ? next.delete(n.id) : next.add(n.id);
    setExpanded(next);
    if (!cache.has(n.id)) {
      try { await fetchChildren(n.id); } catch (e) { setError(e.message); }
    }
  };
  
  const toggleSelect = (n) => {
    if (n.child_count) return;
    setSelected(sel => sel.includes(n.id)
      ? sel.filter(i => i !== n.id)
      : [...sel, n.id]);
  };

  // Auto-advance steps
  useEffect(() => {
    if (currentStep === 1 && personal.vessel && personal.system && personal.serial) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selected.length > 0) {
      setCurrentStep(3);
    }
  }, [personal, selected, currentStep]);

  // Mock diagnostic loading when selections change
  useEffect(() => {
    if (!selected.length) {
      setAllErr([]); setVisErr([]); setAllQs([]); setAns({});
      return;
    }
    
    // Mock conferrors and questions
    const mockErrors = [
      {
        id: 1,
        name: 'Engine Oil Pressure Low',
        description: 'Engine oil pressure is below normal operating range',
        d3e_containment_act: 'Reduce engine speed immediately',
        d4e_root_cause: 'Possible oil leak or pump failure',
        d5e_action_performed: 'Check oil level and inspect for leaks',
        questions: [
          { id: 1, text: 'Is the oil level low?', family: 'visual' },
          { id: 2, text: 'Do you hear unusual engine noises?', family: 'auditory' }
        ]
      }
    ];
    
    const mockQuestions = [
      { 
        id: 1, 
        text: 'Is the oil level low?', 
        family: 'visual',
        description: 'Check the oil dipstick to verify current oil level',
        confIds: [1], 
        confNames: ['Engine Oil Pressure Low'] 
      },
      { 
        id: 2, 
        text: 'Do you hear unusual engine noises?', 
        family: 'auditory',
        description: 'Listen for knocking, grinding, or other abnormal sounds',
        confIds: [1], 
        confNames: ['Engine Oil Pressure Low'] 
      }
    ];
    
    setAllErr(mockErrors);
    setVisErr(mockErrors);
    setAllQs(mockQuestions);
    setAns({});
  }, [selected]);

  // Filter errors by answers
  useEffect(() => {
    let filtered = [...allErr];
    
    Object.entries(ans).forEach(([questionId, answer]) => {
      if (answer === true) {
        filtered = filtered.filter(err => 
          err.questions.some(q => q.id === parseInt(questionId))
        );
      }
    });
    
    setVisErr(filtered);
  }, [ans, allErr]);

  // Check completion
  useEffect(() => {
    if (allErr.length === 1 && selected.length === 1) {
      setDone(true);
    } else if (visErr.length === 1 && Object.keys(ans).length > 0) {
      setDone(true);
    } else {
      setDone(false);
    }
  }, [visErr, ans, allErr, selected]);

  // Create session when done
  useEffect(() => {
    if (done && visErr.length === 1 && !sessionId) {
      createDiagnosticSession();
    }
  }, [done, visErr, sessionId]);

  const unanswered = allQs
    .filter(q => !ans.hasOwnProperty(q.id) &&
                 q.confIds.some(id => visErr.find(e => e.id === id)))
    .map(q => ({
      ...q,
      visibleNames: q.confNames.filter((_,i) =>
        visErr.find(e => e.id === q.confIds[i]))
    }));

  const renderNodes = (parentId, depth = 0) => {
    const kids = cache.get(parentId) || [];
    const filteredKids = searchTerm 
      ? kids.filter(node => 
          node.error_type.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : kids;

    return filteredKids.map(node => (
      <React.Fragment key={node.id}>
        <div
          onClick={() => node.child_count ? toggleExpand(node) : toggleSelect(node)}
          className={`
            group flex items-center justify-between cursor-pointer select-none
            px-4 py-3 mb-2 border rounded-lg transition-all duration-200
            ${node.child_count
              ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
              : selected.includes(node.id)
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'}
          `}
          style={{ marginLeft: depth * 24 }}
        >
          <div className="flex items-center flex-1">
            {node.child_count ? (
              expanded.has(node.id) ? (
                <ChevronDown className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              ) : (
                <ChevronRight className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
              )
            ) : (
              <div className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium text-gray-800">{node.error_type}</span>
            {node.child_count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {node.child_count}
              </span>
            )}
          </div>
          {!node.child_count && selected.includes(node.id) && (
            <CheckCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>

        {node.child_count > 0 && expanded.has(node.id) &&
          renderNodes(node.id, depth + 1)}
      </React.Fragment>
    ));
  };

  const vessels = ['Trygve Braarud', 'Test Boat'];
  const serials = ['SL-001', 'SL-002', 'SL-003', 'SL-004'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marine Diagnostic System</h1>
              <p className="text-gray-600 text-sm mt-1">Intelligent fault diagnosis and troubleshooting</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { num: 1, title: 'System Information', desc: 'Vessel and system details' },
              { num: 2, title: 'Component Selection', desc: 'Choose diagnostic path' },
              { num: 3, title: 'Diagnosis', desc: 'Answer questions and resolve' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                    ${currentStep >= step.num 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'}
                  `}>
                    {currentStep > step.num ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <div className="ml-4">
                    <p className={`font-medium ${currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-6 rounded ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: System Information */}
        <div className={`bg-white rounded-xl shadow-sm border mb-6 overflow-hidden transition-all duration-300 ${
          currentStep >= 1 ? 'opacity-100' : 'opacity-50'
        }`}>
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-600" />
              System Information
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vessel <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={personal.vessel}
                  onChange={e => setPersonal({ ...personal, vessel: e.target.value })}
                >
                  <option value="">Select vessel...</option>
                  {vessels.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
                  value={personal.system}
                  onChange={e => setPersonal({ ...personal, system: e.target.value, serial: '' })}
                  disabled={!personal.vessel}
                >
                  <option value="">Select system...</option>
                  {systems.map(s => <option key={s.id} value={s.error_type}>{s.error_type}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
                  value={personal.serial}
                  onChange={e => setPersonal({ ...personal, serial: e.target.value })}
                  disabled={!personal.system}
                >
                  <option value="">Select serial...</option>
                  {serials.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Component Selection */}
        {personal.vessel && personal.system && personal.serial && (
          <div className={`bg-white rounded-xl shadow-sm border mb-6 overflow-hidden transition-all duration-300 ${
            currentStep >= 2 ? 'opacity-100' : 'opacity-50'
          }`}>
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Search className="w-5 h-5 mr-3 text-green-600" />
                  Component Selection
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search components..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewDiagnostic(!showNewDiagnostic)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Diagnostic
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex">
                <div className="flex-1 pr-6">
                  {rootId && (
                    <div className="space-y-2">
                      {renderNodes(rootId)}
                    </div>
                  )}
                  
                  {!rootId && (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Loading diagnostic tree...</p>
                    </div>
                  )}
                </div>
                
                {/* Selection Summary */}
                <div className="w-80 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Selected Components</h3>
                  {selected.length > 0 ? (
                    <div className="space-y-2">
                      {selected.map(id => (
                        <div key={id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm text-gray-700">{id2name[id]}</span>
                          <button
                            onClick={() => setSelected(sel => sel.filter(i => i !== id))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No components selected</p>
                  )}
                </div>
              </div>

              {/* New Diagnostic Form */}
              {showNewDiagnostic && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-3">Create New Diagnostic</h4>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={newDiagnosticText}
                      onChange={(e) => setNewDiagnosticText(e.target.value)}
                      placeholder="Enter diagnostic name..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        if (newDiagnosticText.trim()) {
                          // Save logic here
                          setShowNewDiagnostic(false);
                          setNewDiagnosticText('');
                        }
                      }}
                      disabled={!newDiagnosticText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowNewDiagnostic(false);
                        setNewDiagnosticText('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Diagnosis */}
        {selected.length > 0 && allErr.length > 0 && (
          <div className={`transition-all duration-300 ${
            currentStep >= 3 ? 'opacity-100' : 'opacity-50'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Possible Errors Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border sticky top-6">
                  <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                      Possible Errors ({visErr.length})
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {visErr.map(e => (
                      <div key={e.id}>
                        <div
                          onClick={() => setExpandedErrors(prev => ({
                            ...prev,
                            [e.id]: !prev[e.id]
                          }))}
                          className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800 text-sm flex-1 pr-2">
                              {e.name}
                            </h4>
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedErrors[e.id] ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>
                        
                        {expandedErrors[e.id] && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="text-gray-600 mb-2">
                              {e.description || 'No description available.'}
                            </p>
                            {e.d3e_containment_act && (
                              <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">Quick fix:</span> {e.d3e_containment_act}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {visErr.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">All errors eliminated!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Diagnostic Panel */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <HelpCircle className="w-5 h-5 mr-3 text-purple-600" />
                      Diagnostic Questions
                      {!done && unanswered.length > 0 && (
                        <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {Object.keys(ans).length} answered • {unanswered.length} remaining
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="p-6">
                    {!done && unanswered.length > 0 && (
                      <div className="space-y-6">
                        {unanswered.map((q, i) => (
                          <div key={q.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                                    Question {i + 1}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {q.family && `${q.family} • `}
                                    Related to {q.visibleNames.length} error(s)
                                  </span>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                  {q.text}
                                </h4>
                                {q.description && (
                                  <p className="text-sm text-gray-600 mb-4">
                                    {q.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              <button
                                onClick={() => setAns(a => ({ ...a, [q.id]: true }))}
                                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                                  ans[q.id] === true
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                }`}
                              >
                                <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                                Yes
                              </button>
                              
                              <button
                                onClick={() => setAns(a => ({ ...a, [q.id]: false }))}
                                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                                  ans[q.id] === false
                                    ? 'bg-red-600 text-white shadow-lg'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                              >
                                <XCircle className="w-5 h-5 mx-auto mb-1" />
                                No
                              </button>
                              
                              {ans[q.id] !== undefined && (
                                <button
                                  onClick={() => {
                                    const newAns = { ...ans };
                                    delete newAns[q.id];
                                    setAns(newAns);
                                  }}
                                  className="px-4 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Diagnosis Complete */}
                    {done && visErr.length === 1 && (
                      <div className="space-y-6">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">
                                Diagnosis Complete
                              </h4>
                              <p className="text-green-700 font-medium">
                                Identified: {visErr[0].name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Questions Answered */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                              Diagnostic Path
                            </h5>
                            {Object.keys(ans).length > 0 ? (
                              <div className="space-y-2">
                                {allQs
                                  .filter(q => ans[q.id] === true && q.confIds.includes(visErr[0].id))
                                  .map((question) => (
                                    <div key={question.id} className="flex items-center text-sm">
                                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                      <span className="text-gray-700">{question.text}</span>
                                    </div>
                                  ))}
                                {allQs.filter(q => ans[q.id] === true && q.confIds.includes(visErr[0].id)).length === 0 && (
                                  <p className="text-sm text-gray-600 italic">
                                    Direct diagnosis - no questions needed
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 italic">
                                Single possibility identified
                              </p>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                              Immediate Action
                            </h5>
                            {visErr[0].d3e_containment_act ? (
                              <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {visErr[0].d3e_containment_act}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600 italic">
                                No immediate action specified
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Detailed Analysis */}
                        <div className="bg-white border border-gray-200 rounded-lg">
                          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                            <h5 className="font-semibold text-gray-900">Detailed Analysis</h5>
                          </div>
                          <div className="p-5 space-y-4">
                            {visErr[0].d4e_root_cause && (
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Root Cause</h6>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {visErr[0].d4e_root_cause}
                                </p>
                              </div>
                            )}
                            
                            {visErr[0].d5e_action_performed && (
                              <div>
                                <h6 className="font-medium text-gray-900 mb-2">Recommended Fix</h6>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                  {visErr[0].d5e_action_performed}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contact Consent */}
                        {contactConsent === null && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <Users className="w-5 h-5 mr-2 text-blue-600" />
                              Follow-up Contact
                            </h5>
                            <p className="text-gray-700 mb-4">
                              May we contact you for follow-up regarding this diagnosis?
                            </p>
                            <div className="flex space-x-4">
                              <button
                                onClick={async () => {
                                  setContactConsent(true);
                                  await updateDiagnosticSession({ contactConsent: true });
                                }}
                                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Yes, contact me
                              </button>
                              <button
                                onClick={async () => {
                                  setContactConsent(false);
                                  await updateDiagnosticSession({ contactConsent: false });
                                }}
                                className="flex-1 py-3 px-6 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                              >
                                No, thanks
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Problem Resolution */}
                        {contactConsent !== null && fixedProblem === null && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                              Problem Resolution
                            </h5>
                            <p className="text-gray-700 mb-6">
                              Did the recommended solution fix your problem?
                            </p>
                            <div className="flex space-x-4">
                              <button
                                onClick={async () => {
                                  setFixedProblem(true);
                                  await updateDiagnosticSession({ problemFixed: true });
                                }}
                                className="flex-1 py-4 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                              >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Yes, problem solved!
                              </button>
                              <button
                                onClick={async () => {
                                  setFixedProblem(false);
                                  await updateDiagnosticSession({ problemFixed: false });
                                }}
                                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                              >
                                <XCircle className="w-5 h-5 mr-2" />
                                Still having issues
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Feedback Section */}
                        {fixedProblem !== null && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <Edit3 className="w-5 h-5 mr-2 text-purple-600" />
                              Additional Feedback
                            </h5>
                            
                            {fixedProblem ? (
                              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-medium">
                                  Excellent! The diagnosis was successful.
                                </p>
                                <p className="text-green-700 text-sm mt-1">
                                  Your feedback helps improve our diagnostic accuracy.
                                </p>
                              </div>
                            ) : (
                              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 font-medium">
                                  We're sorry the issue wasn't resolved.
                                </p>
                                <p className="text-red-700 text-sm mt-1">
                                  Please provide details to help us improve our diagnostics.
                                </p>
                              </div>
                            )}
                            
                            <textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder={fixedProblem 
                                ? "Any additional details about what worked or suggestions for improvement..."
                                : "Please describe what issues remain or what didn't work as expected..."
                              }
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            
                            <div className="mt-4 flex justify-end space-x-3">
                              <button
                                onClick={async () => {
                                  setFeedbackText('');
                                  await updateDiagnosticSession({ feedbackText: '' });
                                  await fetchDiagnosticStats();
                                }}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                Skip
                              </button>
                              <button
                                onClick={async () => {
                                  await updateDiagnosticSession({ feedbackText: feedbackText });
                                  await fetchDiagnosticStats();
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Submit Feedback
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Statistics Display */}
                        {fixedProblem !== null && diagnosticStats && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                              Diagnostic Performance
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                  {diagnosticStats.overallStats?.percentage_fixed || 0}%
                                </div>
                                <p className="text-sm text-blue-700">
                                  Overall Success Rate
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Based on {diagnosticStats.overallStats?.total_cases || 0} cases
                                </p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                  {diagnosticStats.overallStats?.fixed_cases || 0}
                                </div>
                                <p className="text-sm text-green-700">
                                  Successful Fixes
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Problems resolved
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* New Diagnosis Button */}
                        <div className="text-center pt-6">
                          <button
                            onClick={() => {
                              setSelected([]);
                              setAllErr([]); 
                              setVisErr([]);
                              setAllQs([]); 
                              setAns({});
                              setDone(false);
                              setExpandedErrors({});
                              setFixedProblem(null);
                              setDiagnosticStats(null);
                              setFeedbackText('');
                              setContactConsent(null);
                              setSessionId(null);
                              setCurrentStep(2);
                            }}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto"
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Start New Diagnosis
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {selected.length > 0 && visErr.length > 0 && !done && unanswered.length === 0 && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center px-6 py-3 bg-blue-50 rounded-lg">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-blue-700 font-medium">Finalizing diagnosis...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticInterface;