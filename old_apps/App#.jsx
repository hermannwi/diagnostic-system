import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle, XCircle, ExternalLink,
  ChevronRight, ChevronDown
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
  const [cache,     setCache]     = useState(new Map()); // parent → children[]
  const [expanded,  setExpanded]  = useState(new Set()); // open node ids
  const [selected,  setSelected]  = useState([]);        // leaf ids
  const [id2name,   setId2name]   = useState({});        // id → label
  const [rootId,    setRootId]    = useState(null);      // chosen system id

  /* 3 ─ Diagnostic flow */
  const [allErr, setAllErr] = useState([]);
  const [visErr, setVisErr] = useState([]);
  const [allQs,  setAllQs]  = useState([]);
  const [ans,    setAns]    = useState({});
  const [done,   setDone]   = useState(false);
  const [fixedProblem, setFixedProblem] = useState(null);
  
  /* UI state */
  const [hoveredQuestion, setHoveredQuestion] = useState(null);
  const [expandedErrors, setExpandedErrors] = useState({});
  const [diagnosticStats, setDiagnosticStats] = useState(null);
  const [questionStats, setQuestionStats] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showNewDiagnostic, setShowNewDiagnostic] = useState(false);
  const [newDiagnosticText, setNewDiagnosticText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [contactConsent, setContactConsent] = useState(null); // null, true, or false
  const [sessionId, setSessionId] = useState(null); // Store the session ID for updates

  /* misc */
  const [systems, setSystems] = useState([]);
  const [error,   setError]   = useState(null);
  const API = 'http://localhost:3001/api';

  /* ─── Fetch question statistics ─── */
  const fetchQuestionStats = async () => {
    if (visErr.length === 0 || allQs.length === 0) return;
    
    try {
      // Get all unique question IDs from all questions
      const questionIds = allQs.map(q => q.id);
      console.log('Fetching stats for questions:', questionIds);
      console.log('For errors:', visErr.map(e => ({ id: e.id, name: e.name })));
      
      // For each visible error, get stats
      const allStats = {};
      
      for (const error of visErr) {
        console.log(`Fetching stats for error ${error.id}`);
        const response = await fetch(`${API}/question-stats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionIds: questionIds,
            finalErrorId: error.id
          })
        });

        if (response.ok) {
          const stats = await response.json();
          console.log(`Stats received for error ${error.id}:`, stats);
          // Merge stats for each question
          Object.keys(stats).forEach(qId => {
            if (!allStats[qId] || 
                (stats[qId].yes_stats.total) > 
                (allStats[qId].yes_stats.total)) {
              allStats[qId] = stats[qId];
            }
          });
        } else {
          console.error(`Failed to fetch stats for error ${error.id}:`, await response.text());
        }
      }
      
      console.log('Final question stats:', allStats);
      setQuestionStats(allStats);
    } catch (e) {
      console.error('Error fetching question statistics:', e);
    }
  };

  /* ─── Fetch diagnostic statistics ─── */
  const fetchDiagnosticStats = async () => {
    try {
      const response = await fetch(`${API}/diagnostic-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initDiagnIds: selected,
          finalErrorId: visErr[0]?.id
        })
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');
      
      const stats = await response.json();
      setDiagnosticStats(stats);
    } catch (e) {
      console.error('Error fetching statistics:', e);
    }
  };
  /* ─── Create diagnostic session ─── */
const createDiagnosticSession = async () => {
  try {
    const sessionData = {
      vessel: personal.vessel,
      system: personal.system,
      serial: personal.serial,
      selectedDiagnostics: selected.map(id => ({
        id: id,
        name: id2name[id]
      })),
      finalErrorId: visErr[0]?.id,
      finalErrorName: visErr[0]?.name,
      questionsAnswered: ans,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${API}/diagnostic-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) throw new Error('Failed to create session');
    
    const result = await response.json();
    console.log('Session created:', result);
    setSessionId(result.sessionId || result.id); // Store the session ID
    return result;
  } catch (e) {
    console.error('Error creating session:', e);
    setError(`Failed to create session: ${e.message}`);
  }
};
/* ─── Update diagnostic session ─── */
const updateDiagnosticSession = async (updates) => {
  
  if (!sessionId) {
    console.warn('No session ID available for update');
    return;
  }

  try {
    const response = await fetch(`${API}/diagnostic-session/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) throw new Error('Failed to update session');
    
    const result = await response.json();
    console.log('Session updated:', result);
    return result;
  } catch (e) {
    console.error('Error updating session:', e);
    setError(`Failed to update session: ${e.message}`);
  }
};


  const saveDiagnosticSession = async (problemFixed) => {
    try {
      const sessionData = {
        vessel: personal.vessel,
        system: personal.system,
        serial: personal.serial,
        selectedDiagnostics: selected.map(id => ({
          id: id,
          name: id2name[id]
        })),
        finalErrorId: visErr[0]?.id,
        finalErrorName: visErr[0]?.name,
        questionsAnswered: ans,
        problemFixed: problemFixed,
        feedbackText: feedbackText,
        contactConsent: contactConsent,  // New field
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${API}/diagnostic-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) throw new Error('Failed to save session');
      
      const result = await response.json();
      console.log('Session saved:', result);
      return result;
    } catch (e) {
      console.error('Error saving session:', e);
      setError(`Failed to save session: ${e.message}`);
    }
  };

  /* ─── helpers ─── */
  const fetchChildren = async (parentId) => {
    if (cache.has(parentId)) return;
    const r = await fetch(`${API}/diagnostics/${parentId}`);
    if (!r.ok) throw new Error('child fetch failed');
    const kids = (await r.json())
      .map(k => ({ ...k, child_count: Number(k.child_count) }))
      .sort(sortKids);
    setCache(m => new Map(m).set(parentId, kids));
    setId2name(m => {
      const n = { ...m };
      kids.forEach(k => (n[k.id] = k.error_type));
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

  /* ─── load root systems ─── */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/systems`);
        if (!r.ok) throw new Error('Failed to fetch systems');
        setSystems(await r.json());
      } catch (e) { setError(e.message); }
    })();
  }, []);

  /* ─── when a system is picked ─── */
  useEffect(() => {
    const obj = systems.find(s => s.error_type === personal.system);
    if (!obj) return;
    /* reset */
    setRootId(obj.id);
    setCache(new Map());
    setExpanded(new Set([obj.id]));
    setSelected([]);
    setAllErr([]); setVisErr([]);
    setAllQs([]);  setAns({});
    setDone(false);
    setFixedProblem(null);
    setDiagnosticStats(null);
    setQuestionStats({});
    setExpandedQuestion(null);
    setShowNewDiagnostic(false);
    setNewDiagnosticText('');
    setFeedbackText('');
    setContactConsent(null);
    setSessionId(null);
    fetchChildren(obj.id).catch(e => setError(e.message));
  }, [personal.system, systems]);

  /* ─── load conf-errors whenever the leaf set changes ─── */
  useEffect(() => {
    if (!selected.length) {
      setAllErr([]); setVisErr([]); setAllQs([]); setAns({});
      return;
    }
    (async () => {
      try {
        const errArr = [];
        const qMap   = new Map();
        let autoComplete = false;
        
        for (const id of selected) {
          const r = await fetch(`${API}/conferrors/${id}`);
          if (!r.ok) continue;
          const data = await r.json();
          console.log('Conferror data received:', data); // Debug log
          
          // Check if this diagnostic has only one conferror
          if (selected.length === 1 && data.length === 1) {
            autoComplete = true;
          }
          
          data.forEach(e => {
            console.log('Processing error:', e); // Debug log
            console.log('Questions in error:', e.questions); // Debug log
            errArr.push({ ...e, diagnosticType: id2name[id] });
            e.questions.forEach(q => {
              console.log('Question object:', q); // Debug log
              if (!qMap.has(q.id)) {
                qMap.set(q.id, { 
                  id: q.id,
                  text: q.text,
                  family: q.family || '',
                  description: q.description || null,
                  text_help_link: q.text_help_link || null,
                  image_help_link: q.image_help_link || null,
                  confIds: [e.id], 
                  confNames: [e.name] 
                });
              } else {
                const o = qMap.get(q.id);
                o.confIds.push(e.id);  
                o.confNames.push(e.name);
              }
            });
          });
        }
        
        setAllErr(errArr); 
        setVisErr(errArr);
        setAllQs([...qMap.values()]); 
        setAns({});
        
        // Auto-complete if only one conferror exists
        if (autoComplete) {
          setDone(true);
        }
      } catch (e) { setError(e.message); }
    })();
  }, [selected, id2name]);

  /* ─── NEW LOGIC: filter errors by YES answers (exclude conferrors without the question) ─── */
  useEffect(() => {
    let filtered = [...allErr];
    
    // For each YES answer, exclude conferrors that don't have that question
    Object.entries(ans).forEach(([questionId, answer]) => {
      if (answer === true) {
        // Keep only conferrors that have this question
        filtered = filtered.filter(err => 
          err.questions.some(q => q.id === parseInt(questionId))
        );
      }
    });
    
    setVisErr(filtered);
  }, [ans, allErr]);

  /* ─── Load question stats when questions are displayed ─── */
  useEffect(() => {
    if (allQs.length > 0 && visErr.length > 0) {
      fetchQuestionStats();
    }
  }, [allQs, visErr]);

  /* ─── completion flag ─── */
  useEffect(() => {
    // Auto-complete if only one conferror from start, or if filtered to one
    if (allErr.length === 1 && selected.length === 1) {
      setDone(true);
    } else if (visErr.length === 1 && Object.keys(ans).length > 0) {
      setDone(true);
    } else {
      setDone(false);
    }
  }, [visErr, ans, allErr, selected]);

  /* ─── Create session when diagnosis is complete ─── */
  useEffect(() => {
    if (done && visErr.length === 1 && !sessionId) {
      createDiagnosticSession();
    }
  }, [done, visErr, sessionId]);

  /* ─── unanswered questions helper with sorting ─── */
  const unanswered = allQs
    .filter(q => !ans.hasOwnProperty(q.id) &&
                 q.confIds.some(id => visErr.find(e => e.id === id)))
    .map(q => ({
      ...q,
      visibleNames: q.confNames.filter((_,i) =>
        visErr.find(e => e.id === q.confIds[i]))
    }))
    .sort((a, b) => {
      // Get stats for both questions
      const statsA = questionStats[a.id];
      const statsB = questionStats[b.id];
      
      // If neither has stats, maintain original order
      if (!statsA && !statsB) return 0;
      
      // Questions with stats come before those without
      if (!statsA) return 1;
      if (!statsB) return -1;
      
      // Primary sort: by YES success rate
      const successRateA = statsA.yes_stats.success_rate;
      const successRateB = statsB.yes_stats.success_rate;
      
      // If success rates are equal, sort by sample size (more data = more reliable)
      if (successRateA === successRateB) {
        return statsB.yes_stats.total - statsA.yes_stats.total;
      }
      
      // Sort by success rate (descending)
      return successRateB - successRateA;
    });

  console.log('Debug - unanswered questions:', unanswered);
  console.log('Debug - visErr:', visErr);
  console.log('Debug - allQs:', allQs);
  console.log('Debug - done:', done);

  /* ─── recursive renderer ─── */
  const renderNodes = (parentId, depth = 0) => {
    const kids = cache.get(parentId) || [];
    return kids.map(node => (
      <React.Fragment key={node.id}>
        <div
          onClick={() => node.child_count ? toggleExpand(node) : toggleSelect(node)}
          className={`
            flex items-center justify-between cursor-pointer select-none
            px-3 py-2 mb-1 border-2 rounded-lg transition
            ${node.child_count
              ? 'border-gray-200 hover:border-gray-300 bg-white'
              : selected.includes(node.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'}
          `}
          style={{ marginLeft: depth * 20 }}
        >
          <div className="flex items-center">
            {node.child_count
              ? expanded.has(node.id)
                  ? <ChevronDown className="w-4 h-4 mr-2 text-gray-400" />
                  : <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
              : <span className="w-4 h-4 mr-2" />}
            {node.error_type}
          </div>
          {!node.child_count && selected.includes(node.id) &&
            <CheckCircle className="w-4 h-4 text-blue-600" />}
        </div>

        {node.child_count > 0 && expanded.has(node.id) &&
          renderNodes(node.id, depth + 1)}
      </React.Fragment>
    ));
  };

  /* ─── static demo lists ─── */
  const vessels = ['Trygve Braarud', 'Test Boat'];
  const serials = ['SL-001', 'SL-002', 'SL-003', 'SL-004'];

  /* ─── ui ─── */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Diagnostic System</h1>

        {error &&
          <p className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
            {error}
          </p>}

        {/* 1 – personal info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center
                             justify-center mr-3 text-sm font-bold">1</span>
            Personal Information
          </h2>

          <div className="space-y-4">
            {/* vessel */}
            <div>
              <label className="block text-sm font-medium mb-1">Vessel</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={personal.vessel}
                onChange={e => setPersonal({ ...personal, vessel: e.target.value })}
              >
                <option value="">Select vessel…</option>
                {vessels.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            {/* system */}
            {personal.vessel &&
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium mb-1">System</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={personal.system}
                  onChange={e => setPersonal({ ...personal, system: e.target.value, serial: '' })}
                >
                  <option value="">Select system…</option>
                  {systems.map(s => <option key={s.id}>{s.error_type}</option>)}
                </select>
              </div>}

            {/* serial */}
            {personal.system &&
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium mb-1">Serial</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={personal.serial}
                  onChange={e => setPersonal({ ...personal, serial: e.target.value })}
                >
                  <option value="">Select serial…</option>
                  {serials.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>}
          </div>
        </div>

        {/* 2 – hierarchy */}
        {personal.vessel && personal.system && personal.serial &&
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center
                               justify-center mr-3 text-sm font-bold">2</span>
              Select component or initial diagnostic
            </h2>

            {rootId && renderNodes(rootId)}

            {!!selected.length &&
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Selected: {selected.map(id => id2name[id]).join(', ')}
              </div>}
            
            {/* Create New Diagnostic Button */}
            <div className="mt-4">
              {!showNewDiagnostic ? (
                <button
                  onClick={() => setShowNewDiagnostic(true)}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Diagnostic
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">New Diagnostic Name:</label>
                    <button
                      onClick={() => {
                        setShowNewDiagnostic(false);
                        setNewDiagnosticText('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newDiagnosticText}
                    onChange={(e) => setNewDiagnosticText(e.target.value)}
                    placeholder="Enter diagnostic name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (newDiagnosticText.trim()) {
                          try {
                            const response = await fetch(`${API}/create-diagnostic`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                parentId: rootId,
                                diagnosticName: newDiagnosticText.trim(),
                                systemName: personal.system,
                                timestamp: new Date().toISOString()
                              })
                            });

                            if (response.ok) {
                              // Refresh the current level
                              await fetchChildren(rootId);
                              setShowNewDiagnostic(false);
                              setNewDiagnosticText('');
                            } else {
                              setError('Failed to create diagnostic');
                            }
                          } catch (e) {
                            setError(`Error creating diagnostic: ${e.message}`);
                          }
                        }
                      }}
                      disabled={!newDiagnosticText.trim()}
                      className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNewDiagnostic(false);
                        setNewDiagnosticText('');
                      }}
                      className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>}

        {/* 3 – error + question workflow */}
        {selected.length > 0 && allErr.length > 0 &&
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* error panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                  Confirmed Errors ({visErr.length}/{allErr.length})
                </h3>
                <div className="space-y-3">
                  {visErr.map(e => (
                    <div key={e.id}>
                      <div
                        onClick={() => setExpandedErrors(prev => ({
                          ...prev,
                          [e.id]: !prev[e.id]
                        }))}
                        className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-300 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800 flex-1 pr-2">{e.name}</h4>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            expandedErrors[e.id] ? 'rotate-90' : ''
                          }`} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          From: {e.diagnosticType}
                        </div>
                      </div>
                      {expandedErrors[e.id] && (
                        <div className="mt-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg animate-fadeIn">
                          <p className="text-sm text-gray-600">
                            {e.d2e_description || e.description || 'No description available.'}
                          </p>
                          {e.system && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">System:</span> {e.system}
                                {e.part_no && <span> • <span className="font-medium">Part:</span> {e.part_no}</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {visErr.length === 0 &&
                    <p className="text-center py-4 text-gray-500">
                      All errors eliminated by your answers.
                    </p>}
                </div>
              </div>
            </div>

            {/* question panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center
                                   justify-center mr-3 text-sm font-bold">3</span>
                  Diagnostic Questions
                </h3>

                {!done && unanswered.length > 0 && (
                  <>
                    <div className="mb-4 text-sm text-gray-500">
                      {Object.keys(ans).length} answered • {unanswered.length} remaining
                      {Object.keys(questionStats).length > 0 && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Questions ordered by diagnostic value)
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {unanswered.map((q, i) => (
                        <div key={q.id} className="relative">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="mb-3">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs text-blue-600 font-medium">Question {i + 1}</span>
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <span 
                                      className="text-xs text-gray-500 cursor-help"
                                      onMouseEnter={() => setHoveredQuestion(q.id)}
                                      onMouseLeave={() => setHoveredQuestion(null)}
                                    >
                                      Related to {q.visibleNames.length} error(s)
                                    </span>
                                    {hoveredQuestion === q.id && (
                                      <div className="absolute right-0 top-5 z-10 bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg max-w-xs">
                                        <div className="font-medium mb-1">Related errors:</div>
                                        {q.visibleNames.map((name, idx) => (
                                          <div key={idx}>• {name}</div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    className={`text-xs px-2 py-1 rounded transition-colors ${
                                      expandedQuestion === q.id 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {expandedQuestion === q.id ? 'Hide Help' : 'Show Help'}
                                  </button>
                                </div>
                              </div>
                              <p className="font-medium mb-2">{q.text}</p>
                              {/* Question Statistics */}
                              {questionStats[q.id] && (
                                <div className="mt-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-medium text-blue-800">Success Rate When YES:</div>
                                    {(() => {
                                      const yesSuccess = questionStats[q.id].yes_stats.success_rate;
                                      
                                      if (yesSuccess >= 80) {
                                        return (
                                          <span className="text-xs font-medium text-green-600 flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            High reliability
                                          </span>
                                        );
                                      } else if (yesSuccess >= 60) {
                                        return (
                                          <span className="text-xs font-medium text-yellow-600">
                                            Moderate reliability
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="text-xs font-medium text-gray-500">
                                            Low reliability
                                          </span>
                                        );
                                      }
                                    })()}
                                  </div>
                                  <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                    <div className="flex-1">
                                      <span className="text-lg font-semibold text-green-700">
                                        {questionStats[q.id].yes_stats.success_rate}%
                                      </span>
                                      {questionStats[q.id].yes_stats.total > 0 && (
                                        <span className="text-sm text-gray-600 ml-2">
                                          ({questionStats[q.id].yes_stats.fixed} successful fixes out of {questionStats[q.id].yes_stats.total} cases)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {!questionStats[q.id] && (
                                <div className="mt-2 mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500 italic">
                                  No historical data available for this question yet
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setAns(a => ({ ...a, [q.id]: true }))}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center
                                           ${ans[q.id] === true
                                             ? 'bg-green-500 text-white'
                                             : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Yes
                              </button>
                              <button
                                onClick={() => setAns(a => ({ ...a, [q.id]: false }))}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center
                                           ${ans[q.id] === false
                                             ? 'bg-red-500 text-white'
                                             : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                <XCircle className="w-4 h-4 mr-2" /> No
                              </button>
                              {ans[q.id] !== undefined && (
                                <button
                                  onClick={() => {
                                    const newAns = { ...ans };
                                    delete newAns[q.id];
                                    setAns(newAns);
                                  }}
                                  className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Expanded Question Help Panel */}
                          {expandedQuestion === q.id && (
                            <div className="absolute left-full ml-4 top-0 w-96 bg-white rounded-lg shadow-xl border-2 border-blue-200 p-5 z-20 animate-slideIn">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-semibold text-gray-800">Question Help</h4>
                                <button
                                  onClick={() => setExpandedQuestion(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Description */}
                              {q.description && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Description</h5>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {q.description}
                                  </p>
                                </div>
                              )}
                              
                              {/* Help Links */}
                              <div className="space-y-3">
                                {q.text_help_link && (
                                  <a
                                    href={q.text_help_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                      <div className="font-medium text-blue-800 text-sm">Documentation</div>
                                      <div className="text-xs text-blue-600">View detailed guide</div>
                                    </div>
                                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                                
                                {q.image_help_link && (
                                  <a
                                    href={q.image_help_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                  >
                                    <svg className="w-5 h-5 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                      <div className="font-medium text-green-800 text-sm">Visual Guide</div>
                                      <div className="text-xs text-green-600">View images & diagrams</div>
                                    </div>
                                    <svg className="w-4 h-4 ml-auto text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                )}
                              </div>
                              
                              {!q.description && !q.text_help_link && !q.image_help_link && (
                                <p className="text-sm text-gray-500 italic">
                                  No additional help information available for this question.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>)}

                {done && visErr.length === 1 && (
                  <div className="animate-fadeIn">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Diagnosis Complete
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Identified error: <strong>{visErr[0].name}</strong>
                      </p>
                      
                      <div className="space-y-4 mt-6">
                        {/* Relevant Diagnostic Questions - Only show questions answered YES */}
                        {Object.keys(ans).length > 0 && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">1. Relevant Diagnostic Questions</h5>
                            <div className="space-y-2">
                              {allQs
                                .filter(q => ans[q.id] === true && q.confIds.includes(visErr[0].id))
                                .map((question) => {
                                  console.log('Question object:', question); // Debug log
                                  return (
                                    <div key={question.id} className="text-sm text-gray-600">
                                      <div className="flex items-start">
                                        <span className="mr-2">•</span>
                                        <div className="flex-1">
                                          <span>{question.text || `Question ${question.id}`}</span>
                                          {questionStats[question.id] && (
                                            <span className="ml-2 text-xs text-green-600">
                                              (Yes success rate: {questionStats[question.id].yes_stats.success_rate}%)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              {allQs.filter(q => ans[q.id] === true && q.confIds.includes(visErr[0].id)).length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                  No questions were answered 'Yes' for this error.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {Object.keys(ans).length === 0 && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">1. Relevant Diagnostic Questions</h5>
                            <p className="text-sm text-gray-500 italic">
                              No diagnostic questions were needed - only one possible error.
                            </p>
                          </div>
                        )}
                        
                        {/* Temporary Solution */}
                        {visErr[0].d3e_containment_act && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">2. Temporary Solution Description</h5>
                            <p className="text-sm text-gray-600">{visErr[0].d3e_containment_act}</p>
                          </div>
                        )}
                        
                        {/* Root Cause */}
                        {visErr[0].d4e_root_cause && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">3. Root Cause</h5>
                            <p className="text-sm text-gray-600">{visErr[0].d4e_root_cause}</p>
                          </div>
                        )}
                        
                        {/* Permanent Fix */}
                        {visErr[0].d5e_action_performed && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">4. Permanent Fix</h5>
                            <p className="text-sm text-gray-600">{visErr[0].d5e_action_performed}</p>
                          </div>
                        )}
                        
                        {/* Solutions (if any) */}
                        {visErr[0].solutions && visErr[0].solutions.length > 0 && (
                          <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-gray-700 mb-2">5. Recommended Solutions</h5>
                            <div className="space-y-2">
                              {visErr[0].solutions.map((solution, index) => (
                                <a
                                  key={index}
                                  href={solution.url}
                                  className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {solution.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Contact Consent */}
                    {fixedProblem === null && contactConsent === null && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Contact Consent
                        </h4>
                        <p className="text-gray-700 mb-4">
                          May we contact you for follow-up regarding this diagnosis if needed?
                        </p>
                        <div className="space-y-3">
                          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors">
                            <input
                              type="radio"
                              name="contact-consent"
                              checked={contactConsent === true}
                              onChange={async () => {
                                setContactConsent(true);
                                await updateDiagnosticSession({ contactConsent: true });
                              }}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700">Yes, you may contact me</span>
                          </label>
                          <label className="flex items-center cursor-pointer hover:bg-blue-100 p-3 rounded-lg transition-colors">
                            <input
                              type="radio"
                              name="contact-consent"
                              checked={contactConsent === false}
                              onChange={async () => {
                                setContactConsent(false);
                                await updateDiagnosticSession({ contactConsent: false });
                              }}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700">No, please do not contact me</span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-3 italic">
                          * This selection is required to continue
                        </p>
                      </div>
                    )}
                    
                    {/* Did this fix the problem? */}
                    {fixedProblem === null && contactConsent !== null && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Did this fix the problem?
                        </h4>
                        <div className="flex gap-4">
                          <button
                            onClick={async () => {
                              setFixedProblem(true);
                              await updateDiagnosticSession({ problemFixed: true });
                            }}
                            className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-medium"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Yes, problem solved!
                          </button>
                          <button
                            onClick={async () => {
                              setFixedProblem(false);
                              await updateDiagnosticSession({ problemFixed: false });
                            }}
                            className="flex-1 py-3 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center font-medium"
                          >
                            <XCircle className="w-5 h-5 mr-2" />
                            No, still having issues
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Feedback Input Section */}
                    {fixedProblem !== null && !feedbackText && (
                      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Additional Feedback (Optional)
                        </h4>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder={fixedProblem 
                            ? "Any additional details about the fix or what specifically worked..."
                            : "Please describe what issues remain or what didn't work..."
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={async () => {
                              await updateDiagnosticSession({ feedbackText: feedbackText });
                              await fetchDiagnosticStats();
                            }}
                            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Submit Feedback
                          </button>
                          <button
                            onClick={async () => {
                              setFeedbackText(''); // Skip feedback
                              await updateDiagnosticSession({ feedbackText: '' });
                              await fetchDiagnosticStats();
                            }}
                            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Feedback message */}
                    {fixedProblem === true && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">
                          Great! Problem resolved successfully.
                        </h4>
                        <p className="text-green-700">
                          The diagnosis was correct and the issue has been fixed.
                        </p>
                      </div>
                    )}
                    
                    {fixedProblem === false && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                          Issue not resolved
                        </h4>
                        <p className="text-red-700">
                          The problem persists. Please contact technical support for further assistance.
                        </p>
                      </div>
                    )}
                    
                    {/* Statistics Display */}
                    {fixedProblem !== null && diagnosticStats && (feedbackText !== '' || feedbackText === '') && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Diagnostic Success Statistics
                        </h4>
                        
                        {/* Overall statistics for this error */}
                        <div className="mb-4 p-4 bg-white rounded-lg">
                          <h5 className="font-semibold text-gray-700 mb-2">
                            Overall Success Rate for "{visErr[0].name}"
                          </h5>
                          <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-blue-600">
                              {diagnosticStats.overallStats.percentage_fixed}%
                            </div>
                            <div className="text-sm text-gray-600">
                              {diagnosticStats.overallStats.fixed_cases} fixed out of {diagnosticStats.overallStats.total_cases} cases
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${diagnosticStats.overallStats.percentage_fixed}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Statistics for each selected diagnostic */}
                        {selected.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700">
                              Success Rate by Initial Diagnostic Path:
                            </h5>
                            {selected.map(diagId => {
                              const stats = diagnosticStats.diagnosticStats[diagId];
                              if (!stats || stats.total_cases === 0) return null;
                              
                              return (
                                <div key={diagId} className="p-3 bg-white rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">
                                      {id2name[diagId]}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {stats.percentage_fixed}% ({stats.fixed_cases}/{stats.total_cases})
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        stats.percentage_fixed >= 70 ? 'bg-green-500' :
                                        stats.percentage_fixed >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${stats.percentage_fixed}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {diagnosticStats.overallStats.total_cases === 0 && (
                          <p className="text-sm text-gray-600 italic">
                            This is the first recorded case of this diagnostic combination.
                          </p>
                        )}
                      </div>
                    )}
                    
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
                        setQuestionStats({});
                        setFeedbackText('');
                        setContactConsent(null);
                        setSessionId(null);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Start New Diagnosis
                    </button>
                  </div>
                )}

                {selected.length > 0 && visErr.length > 0 && !done && unanswered.length === 0 && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Calculating final diagnosis...</p>
                  </div>
                )}
              </div>
            </div>
          </div>}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from {opacity:0;transform:translateY(10px)}
                            to   {opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from {opacity:0;transform:translateX(-20px)}
                            to   {opacity:1;transform:translateX(0)} }
        .animate-fadeIn{animation:fadeIn .3s ease-out}
        .animate-slideIn{animation:slideIn .3s ease-out}
      `}</style>
    </div>
  );
};

export default DiagnosticInterface;