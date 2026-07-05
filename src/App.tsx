import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  Briefcase, 
  BookOpen, 
  Zap, 
  Compass, 
  FileText, 
  FileJson,
  CheckCircle,
  Eye,
  Maximize2,
  ChevronRight,
  Info,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Smartphone,
  Copy,
  Check,
  Book,
  Globe
} from 'lucide-react';

// Node type definition
interface CanvasNode {
  id: string;
  title: string;
  content: string;
  type: 'root' | 'concept' | 'action' | 'question';
  x: number;
  y: number;
}

// Edge type definition
interface CanvasEdge {
  id: string;
  from: string;
  to: string;
}

// Template Preset Type
interface TemplatePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export default function App() {
  // Canvas State
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Dragging and Panning State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(1);
  
  // UI States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error' | null>('saved');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Template Presets
  const templates: TemplatePreset[] = [
    {
      id: 'saas-builder',
      name: 'سیستەمێ لۆجستیکی یێ EcoFlow',
      icon: <Briefcase className="w-4 h-4 text-emerald-400" />,
      description: 'پلاندانانا لۆجستیکییا دۆستا ژینگەهێ، چارەسەرکرنا رێیان ب رێکا ژیرییا دەستکرد، و کێمکرنا غازێن کاربۆنی.',
      nodes: [
        { id: 'root', title: 'EcoFlow Logistics SaaS', content: 'سیستەمەکێ لۆجستیکی پێشکەفتی بۆ رێکخستنا رێیێن بارهەلگرێن کارەبایی دۆستێن ژینگەهێ ب کێمترین رێژەیا غازێن کاربۆنی.', type: 'root', x: 100, y: 300 },
        
        // Technical Stream (ئالیێ تەکنیکی)
        { id: 'tech-1', title: 'ژیرییا رێڕەو کورتکرنێ (Route Optimization AI)', content: 'بەکارهێنانا Google OR-Tools بۆ دیتنا کورتترین رێیا گەشتکرنێ کو ببیتە ئەگەرێ کێمترین سووتانا وزێ.', type: 'concept', x: 400, y: 100 },
        { id: 'tech-2', title: 'گرێدانا مۆدێلێ کاربۆنی (Carbon Estimation Model)', content: 'هەژمارکرنا رێژەیا کاربۆنا هاتیە فرێدان ل سەر بنەمایێ کێشا بارستەیا بارهەلگرێ و جۆرێ وزەیا دهێتە بەکارهێنان.', type: 'concept', x: 700, y: 100 },
        { id: 'tech-3', title: 'نەخشاندنا مۆدێلا Google Maps', content: 'رێکخستنا نەخشەکێ تاقیکاری د React دا ب بەکارهێنانا Google Routes API بۆ نیشادانا جاددەیێن بلندی و نزمیێن وزەپارێز ل سەر نەخشەی.', type: 'action', x: 1000, y: 100 },
        
        // Questions Column (ئارێشە و پرسیارێن سەرەکی)
        { id: 'q-1', title: 'کارتێکرنا سەرمایێ ل سەر پاترییێ؟', content: 'د وەرزێ زستانێ دا رادەیێ هێزا پاترییا بارهەلگران کێم دبیت. چەوا دشێین ڤێ کێمبوونێ د لۆجیکێ ئەلگۆریتمێ دا جێبەجێ بکەین؟', type: 'question', x: 400, y: 300 },
        { id: 'q-2', title: 'چەوا بەرسڤدانا لایڤ بۆ شۆفێران فرێ بکەین؟', content: 'ئایا پێکگەهشتن و گوهۆڕینا رێڕەوان د جاددەیان دا ب رێکا لایڤ سێرڤەری (WebSockets) بیت یان شۆفێر بخۆ ماناڤێستێ ئەپلود بکەت؟', type: 'question', x: 700, y: 300 },

        // Administrative/Managerial Stream (ئالیێ کارگێری و بازرگانی)
        { id: 'admin-1', title: 'داشبۆردێ چاودێرییا ژینگەهێ (Carbon Offset Dashboard)', content: 'بەشەکێ بازرگانی بۆ کڕیاران دا کو رێژەیا دارستان و دارێن پاشکەفتکری ب گرافیکی نیشا بدەت بۆ گۆڕانکاریێن کەشوهەوایی.', type: 'concept', x: 400, y: 500 },
        { id: 'admin-2', title: 'رێکخستنا بارستە و پاترییان (Fleet & Load Manager)', content: 'رێڤەبرنا دەستپێکەرا لۆجستیکی بۆ چاودێریکرنا ئاستێ بارێ بارهەلگران و دیارکرنا دەمێن هێز پڕکرنێ.', type: 'concept', x: 700, y: 500 },
        { id: 'admin-3', title: 'پێداچوونا مەرجێن یاسایی (ESG Compliance Review)', content: 'پشکنین و کۆمکرنا داتایێن ژینگەهی دا کو دگەل یاسا و ستاندەردێن جیهانی یێن کێمکرنا غازێن کيمیاوی بگونجێت.', type: 'action', x: 1000, y: 500 }
      ],
      edges: [
        { id: 'e1', from: 'root', to: 'tech-1' },
        { id: 'e2', from: 'tech-1', to: 'tech-2' },
        { id: 'e3', from: 'tech-2', to: 'tech-3' },
        { id: 'e4', from: 'root', to: 'admin-1' },
        { id: 'e5', from: 'admin-1', to: 'admin-2' },
        { id: 'e6', from: 'admin-2', to: 'admin-3' },
        { id: 'e7', from: 'tech-1', to: 'q-1' },
        { id: 'e8', from: 'admin-1', to: 'q-2' }
      ]
    },
    {
      id: 'sci-fi-world',
      name: 'پلانکرنا جیهانا چیرۆکێن زانستی (Sci-Fi)',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      description: 'گەنگەشەکردن و ئاڤاکرنا لۆجیکێ چیرۆکێن خەیالی یێن زانستی، داهێنانا رووداو و کارەکتەرێن لۆژیستیک.',
      nodes: [
        { id: 'root', title: 'ئەرشەبیلا نیۆن (Neon Archipelago)', content: 'هەسارەیەکا دەریایی یا ل سەر ئاڤێ کو تێدا بارهەڵگرێن فڕۆکە ژ وزەیا کارەبایی یا ئەسمانی هێزێ وەردگرن.', type: 'root', x: 150, y: 250 },
        { id: 'c1', title: 'بارهەڵگرێن ڤۆڵتایی (Voltaic Carriers)', content: 'فڕۆکێن مەزن یێن بارکرنێ کو وزەیا ئەورێن کارەبایی کۆم دکەن و دبەنە سەر باژێڕێن خوارێ.', type: 'concept', x: 420, y: 140 },
        { id: 'c2', title: 'سیستەمێ کێمکرنا وزێ (Energy-Silt Station)', content: 'مەلبەندێن هەلاویستی بۆ پشکنین و سەرنۆژەنکرنا فڕۆکێن وزەپارێز.', type: 'concept', x: 420, y: 350 },
        { id: 'a1', title: 'دەستپێکرنا گەشتا تاقیکاری', content: 'نڤیسینا چیرۆکەکێ ل سەر فڕۆکەوانەکی کو راست تووشی کێشەیەکی د پاترییا فڕۆکێ دا دبیت و دکەڤیتە سەر کەنارەکێ پاتری-تژی.', type: 'action', x: 700, y: 140 }
      ],
      edges: [
        { id: 'e1', from: 'root', to: 'c1' },
        { id: 'e2', from: 'root', to: 'c2' },
        { id: 'e3', from: 'c1', to: 'a1' }
      ]
    },
    {
      id: 'marketing',
      name: 'پلانا مارکێتینگا بەڵاڤبوونا خێرا (Marketing)',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      description: 'مێشکدەرئێخستن بۆ رێیێن گەشەکرنا بازرگانی، کەناڵێن گەهاندنێ و گەشەپێدانێ.',
      nodes: [
        { id: 'root', title: 'بانگەوازیا دەستپێکرنا بەرهەمی', content: 'کەمپینەکا ب هێز بۆ ناساندنا سیستەمێ EcoFlow Logistics بۆ گەشەپێدەران ب رێکا پێشکێشکرنا دیاری و خەلاتێن تایبەت.', type: 'root', x: 150, y: 250 },
        { id: 'c1', title: 'تاقیکرنا کارپێکرنا راستەوخۆ', content: 'بانگهێشتکرنا شۆفێران بۆ کارپێکرنا ئەپی د ماوێ ١ دەمژمێر دا بۆ پاشکەفتکرنا کاربۆنێ.', type: 'concept', x: 420, y: 140 },
        { id: 'q1', title: 'باشترین کەناڵ بۆ بەلاڤکرنێ کێژەیە؟', content: 'ئایا باشترین جهـ تۆڕێن جاددەینە یان گروپێن فەرمی یێن لۆجستیکی د فەیسبووک و واتسئەپێ دا؟', type: 'question', x: 420, y: 350 },
        { id: 'a1', title: 'رێکخستنا ناڤەندا پەیوەندیێ', content: 'دروستکرنا گروپەکێ تایبەت ب بۆتێن ئۆتۆماتیکی دا کو داتایێن دارستان و رێیێن کاربۆن-کێم بۆ هەموویان فرێ بکەت.', type: 'action', x: 700, y: 350 }
      ],
      edges: [
        { id: 'e1', from: 'root', to: 'c1' },
        { id: 'e2', from: 'root', to: 'q1' },
        { id: 'e3', from: 'q1', to: 'a1' }
      ]
    }
  ];

  // Initial Load from LocalStorage
  useEffect(() => {
    const savedNodes = localStorage.getItem('ai_concept_nodes');
    const savedEdges = localStorage.getItem('ai_concept_edges');
    
    if (savedNodes && savedEdges) {
      try {
        setNodes(JSON.parse(savedNodes));
        setEdges(JSON.parse(savedEdges));
        setShowTemplates(false);
      } catch (e) {
        console.error('Failed to parse saved canvas', e);
        loadTemplate(templates[0]);
      }
    } else {
      loadTemplate(templates[0]);
    }
  }, []);

  // Listen for the beforeinstallprompt event (PWA)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('EcoFlow هاتە ئینستالکرن!');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Check for SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
    }
  }, []);

  // Monitor network status and announce offline status in Behdini
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(true);
    };
    
    const handleOfflineStatus = () => {
      setIsOnline(false);
      speakResponse("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە");
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, [isSpeaking]);

  const toggleVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ckb-IQ'; // Kurdish (Soranî / Behdînî)
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setPromptInput((prev) => prev ? prev + ' ' + text : text);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Speech Synthesis (ڕاگەیاندنا دەنگی یا راوێژکاری ب زمانێ کوردی)
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Clear any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ckb-IQ'; // زمانێ کوردی (کوردیا بەهدینی/سۆرانی)
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when selected node changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedNodeId]);

  // Autosave
  useEffect(() => {
    if (nodes.length === 0) return;
    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ai_concept_nodes', JSON.stringify(nodes));
        localStorage.setItem('ai_concept_edges', JSON.stringify(edges));
        setAutosaveStatus('saved');
      } catch (e) {
        setAutosaveStatus('error');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  const loadTemplate = (template: TemplatePreset) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    setSelectedNodeId(template.nodes[0]?.id || null);
    setShowTemplates(false);
    // Center view
    setPanOffset({ x: 50, y: 40 });
    setZoomScale(1);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setDraggedNodeId(nodeId);
    
    // Calculate difference between click position and node position
    // Scaled to compensate for Zoom
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    setDragOffset({
      x: (mouseX / zoomScale) - node.x,
      y: (mouseY / zoomScale) - node.y
    });
  };

  // Global Mouse Move (Drag & Pan logic)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      // Node Dragging
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      setNodes(prev => prev.map(node => {
        if (node.id === draggedNodeId) {
          return {
            ...node,
            x: Math.max(20, Math.min(2500, (mouseX / zoomScale) - dragOffset.x)),
            y: Math.max(20, Math.min(1800, (mouseY / zoomScale) - dragOffset.y))
          };
        }
        return node;
      }));
    } else if (isPanning) {
      // Background Panning
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      setPanOffset({
        x: panOffset.x + deltaX / zoomScale,
        y: panOffset.y + deltaY / zoomScale
      });
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Background Click & Panning Setup
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If clicking background, start pan
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'grid-svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedNodeId(null);
    }
  };

  // Node Creation
  const handleAddNode = (type: 'concept' | 'action' | 'question' = 'concept') => {
    const id = `node_${Date.now()}`;
    
    // Spawn in the center of the visible area
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    const newX = -panOffset.x + (canvasWidth / 2) / zoomScale - 80;
    const newY = -panOffset.y + (canvasHeight / 2) / zoomScale - 50;

    const newNode: CanvasNode = {
      id,
      title: `New ${type.toUpperCase()}`,
      content: 'Click here or open the sidebar to write details about this idea.',
      type,
      x: newX,
      y: newY
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);

    // If there's an existing selected node, connect them automatically
    if (selectedNodeId) {
      const newEdge: CanvasEdge = {
        id: `edge_${Date.now()}`,
        from: selectedNodeId,
        to: id
      };
      setEdges(prev => [...prev, newEdge]);
    }
  };

  // Node Deletion
  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear your entire canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  };

  // Auto-arrange nodes in a clean layout
  const handleAutoLayout = () => {
    if (nodes.length === 0) return;

    // Direct radial/fan arrangement from root nodes
    const roots = nodes.filter(n => n.type === 'root');
    const primaryRoot = roots[0] || nodes[0];
    
    // Mark visiting structure to avoid cycles
    const visited = new Set<string>();
    const layoutNodes = [...nodes];

    const arrangeChildren = (parentId: string, parentX: number, parentY: number, depth: number) => {
      visited.add(parentId);
      
      // Find connected nodes
      const outgoingEdges = edges.filter(e => e.from === parentId);
      const childIds = outgoingEdges.map(e => e.to).filter(id => !visited.has(id));
      
      if (childIds.length === 0) return;

      const spreadAngle = Math.PI / 2; // 90 degree arc
      const baseAngle = 0; // facing rightwards
      const radius = 260 - (depth * 20); // spacing radius

      childIds.forEach((childId, index) => {
        const nodeIndex = layoutNodes.findIndex(n => n.id === childId);
        if (nodeIndex === -1) return;

        // Calculate offset position in a neat fan
        let childX = parentX + radius;
        let childY = parentY;

        if (childIds.length > 1) {
          const progress = (index / (childIds.length - 1)) - 0.5;
          childY = parentY + (progress * (childIds.length * 140));
        } else {
          childY = parentY;
        }

        layoutNodes[nodeIndex] = {
          ...layoutNodes[nodeIndex],
          x: childX,
          y: childY
        };

        arrangeChildren(childId, childX, childY, depth + 1);
      });
    };

    // Position primary root at center-left
    const rootIndex = layoutNodes.findIndex(n => n.id === primaryRoot.id);
    if (rootIndex !== -1) {
      layoutNodes[rootIndex] = {
        ...layoutNodes[rootIndex],
        x: 150,
        y: 280
      };
    }

    arrangeChildren(primaryRoot.id, 150, 280, 1);

    // Arrange any unconnected nodes in a grid below
    let unconnectedOffset = 1;
    layoutNodes.forEach((node) => {
      if (!visited.has(node.id) && node.id !== primaryRoot.id) {
        node.x = 150;
        node.y = 280 + (unconnectedOffset * 180);
        unconnectedOffset++;
      }
    });

    setNodes(layoutNodes);
    setPanOffset({ x: 50, y: 40 });
    setZoomScale(1);
  };

  // Node Editing
  const updateNodeField = (nodeId: string, field: 'title' | 'content' | 'type', value: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return { ...node, [field]: value };
      }
      return node;
    }));
  };

  // ==========================================
  // AI Gemini Integration Handlers
  // ==========================================

  // Presets and prompts helper
  const runAiCommand = async (commandType: 'brainstorm' | 'expand' | 'rewrite', param?: string) => {
    if (!selectedNodeId) return;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    if (!isOnline) {
      speakResponse("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە");
      alert("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە! ژ بهر کو تو یێ بێ ئینتەرنێتی، کارهێنانا ژیریێ نە یا گونجایە.");
      return;
    }

    setAiLoading(true);
    
    try {
      if (commandType === 'brainstorm') {
        setAiStatusMessage('Activating Gemini 3.5 Flash...');
        const response = await fetch('/api/gemini/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conceptTitle: node.title,
            conceptDescription: node.content
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to brainstorm concepts');
        }

        setAiStatusMessage('Plotting node trajectories...');
        const newConcepts = await response.json();

        if (Array.isArray(newConcepts)) {
          // Spawn radial nodes around the parent node
          const distance = 250;
          const count = newConcepts.length;
          
          const newNodes: CanvasNode[] = [];
          const newEdges: CanvasEdge[] = [];

          newConcepts.forEach((item, index) => {
            const angle = (index - (count - 1) / 2) * (Math.PI / 4); // Spread arc
            const id = `node_${Date.now()}_${index}`;
            
            // Calculate child position offset
            const x = node.x + distance;
            const y = node.y + (index - (count - 1) / 2) * 160;

            newNodes.push({
              id,
              title: item.title || 'Sub-concept',
              content: item.content || '',
              type: (item.type === 'action' || item.type === 'question') ? item.type : 'concept',
              x,
              y
            });

            newEdges.push({
              id: `edge_${Date.now()}_${index}`,
              from: node.id,
              to: id
            });
          });

          setNodes(prev => [...prev, ...newNodes]);
          setEdges(prev => [...prev, ...newEdges]);
          setAiStatusMessage('');
        }
      } 
      else if (commandType === 'expand') {
        setAiStatusMessage('خۆ ئامادەکرن بۆ دارشتنا بەرفراھکرنێ ب بەهدینی...');
        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `ڤێ هزرێ بەرفراھ بکە و بکە ڕێبەرەکێ بجهئینانێ یێ ڕێکخستی کو پێکهاتبی ژ قۆناغێن دیارکرى، مەترسیێن ل بەرامبەر، و پێشنیارێن ژێدەران. گرنگە بەرسڤا تە ب زمانی کوردی زاراوەیێ بەهدینی یێ پاقژ و روون پێکبێت.
ناڤێ هزرێ: "${node.title}"
پێزانینێن نوکە: "${node.content}"`,
            systemInstruction: 'تو ڕاوێژکارەکێ ژیر و هەڤالەکێ دلسۆزی. بەرسڤەکا کورت، روون و ڕێکخستی پێشکێش بکە ب زمانێ شیرین یێ کوردی بەهدینی (Kurdish Behdini). چ جۆرە نڤیسینەکێ ب زمانێ ئینگلیزی یان سۆرانی نەنووسی.'
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'کێشە د کارکرنا ژیریێ دا چێبوو');
        }

        const data = await response.json();
        if (data.text) {
          updateNodeField(node.id, 'content', data.text);
        }
      }
      else if (commandType === 'rewrite') {
        const style = param || 'professional';
        setAiStatusMessage(`نوژەنکرن ب شێوازێ ${style}...`);
        
        const stylePrompts = {
          professional: 'ڤێ نڤیسینێ ب شێوازەکێ فەرمی، سەرنجڕاکێش و بەهدینی یێ پاقژ بنڤیسە. زۆر درێژ نەکە، تەنێ ٣ بۆ ٤ ڕستە بن.',
          creative: 'ڤێ نڤیسینێ ب شێوازەکێ داهێنەرانە، جوان و تژی هەست ب زمانی شیرینی بەهدینی بنڤیسە. زۆر درێژ نەکە، تەنێ ٣ بۆ ٤ ڕستە بن.',
          concise: 'ئەڤێ نڤیسینێ کورت و پوخت بکە ب زمانی بەهدینی. تەنێ ١ بۆ ٢ ڕستەیێن ب هێز بن.',
          punchy: 'ڤێ نڤیسینێ زۆر ب هێز و بەردەست بنڤیسە، وەک دروشمەکێ بازرگانی یان سەرنجڕاکێش ب زمانی بەهدینی.'
        };

        const response = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `${stylePrompts[style as keyof typeof stylePrompts]}\n\nدەقێ سەرەکی:\n"${node.content}"`,
            systemInstruction: 'تو نڤیسەرەکێ بلیمەتی. بیرۆکەیان ب دروستی کۆمبکە، کو تێدا پەیاما سەرەکی پارێزراو بیت و بەرسڤ ب زمانێ شیرینێ بەهدینی یێ پاقژ بیت.'
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'کێشە د گوهۆرینا زمانێ نڤیسینێ دا چێبوو');
        }

        const data = await response.json();
        if (data.text) {
          updateNodeField(node.id, 'content', data.text.trim());
        }
      }
    } catch (e: any) {
      alert(`کێشەیا ژیرییا دەستکرد: ${e.message}`);
    } finally {
      setAiLoading(false);
      setAiStatusMessage('');
    }
  };

  // Custom Prompt execution
  const handleCustomPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || !selectedNodeId) return;
    
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    if (!isOnline) {
      speakResponse("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە");
      alert("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە! ژ بهر کو تو یێ بێ ئینتەرنێتی، کارهێنانا ژیریێ نە یا گونجایە.");
      return;
    }

    setAiLoading(true);
    setAiStatusMessage('راوێژکار هزر دکەت بۆ بەرسڤدانێ...');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `ل سەر بنەمایێ ڤێ نۆدێ:
ناڤونیشان: "${node.title}"
ناڤەڕۆک: "${node.content}"

داخوازیێ جێبەجێ بکە: "${promptInput}"
گرنگ: پێدڤیە بەرسڤ ب زمانی شیرینی کوردی زاراوەیێ بەهدینی بیت.`,
          systemInstruction: 'تو ڕاوێژکارەکێ ژیر و لۆجیستی یی و هەڤالێ من یێ زیرەکی. بەرسڤا تە بلا یا تژی پێزانین و پوخت بیت ب زمانێ کوردی بەهدینی.'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to execute prompt');
      }

      const data = await response.json();
      if (data.text) {
        // Spawn the answer as a connected child node!
        const id = `node_${Date.now()}`;
        const newX = node.x + 250;
        const newY = node.y + 80;

        const newNode: CanvasNode = {
          id,
          title: promptInput.length > 30 ? `${promptInput.substring(0, 30)}...` : promptInput,
          content: data.text,
          type: 'concept',
          x: newX,
          y: newY
        };

        const newEdge: CanvasEdge = {
          id: `edge_${Date.now()}`,
          from: node.id,
          to: id
        };

        setNodes(prev => [...prev, newNode]);
        setEdges(prev => [...prev, newEdge]);
        setSelectedNodeId(id);
        setPromptInput('');
      }
    } catch (err: any) {
      alert(`Custom prompt error: ${err.message}`);
    } finally {
      setAiLoading(false);
      setAiStatusMessage('');
    }
  };

  // ==========================================
  // Exports Handlers
  // ==========================================

  // Compile entire tree into Markdown document
  const handleExportMarkdown = () => {
    if (nodes.length === 0) return;

    let md = `# AI Concept Map: ${nodes.find(n => n.type === 'root')?.title || 'Creative Workspace'}\n\n`;
    md += `Generated via AI Concept Studio on ${new Date().toLocaleDateString()}\n\n---\n\n`;

    // Try finding root nodes first
    const roots = nodes.filter(n => n.type === 'root');
    const processedIds = new Set<string>();

    const writeNodeHierarchy = (nodeId: string, level: number) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || processedIds.has(nodeId)) return;

      processedIds.add(nodeId);

      const headerSymbol = '#'.repeat(Math.min(level, 6));
      const typeBadge = node.type.toUpperCase();
      
      md += `${headerSymbol} [${typeBadge}] ${node.title}\n\n`;
      md += `${node.content}\n\n`;

      // Find children
      const childEdges = edges.filter(e => e.from === nodeId);
      childEdges.forEach(edge => {
        writeNodeHierarchy(edge.to, level + 1);
      });
    };

    // Export all roots first
    roots.forEach(root => {
      writeNodeHierarchy(root.id, 1);
    });

    // Capture any orphaned nodes
    nodes.forEach(node => {
      if (!processedIds.has(node.id)) {
        writeNodeHierarchy(node.id, 2);
      }
    });

    // Trigger download
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(nodes.find(n => n.type === 'root')?.title || 'concept_map').toLowerCase().replace(/\s+/g, '_')}_export.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export raw JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "concept_canvas_save.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200" dir="rtl">
      
      {/* HEADER BAR */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide text-slate-100">کەنڤاسێ هزرا ژیر یێ EcoFlow</h1>
            <p className="text-[11px] text-slate-400 font-mono flex items-center space-x-2 space-x-reverse">
              <span>خۆلا لۆجستیکی یا کارا</span>
              {autosaveStatus === 'saving' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
              {autosaveStatus === 'saved' && <span className="text-emerald-400">● هاتە پاشکەفتکرن</span>}
            </p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center space-x-2 space-x-reverse">
          {/* Node Spawners */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 space-x-1 space-x-reverse">
            <button 
              onClick={() => handleAddNode('concept')}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>هزر</span>
            </button>
            <button 
              onClick={() => handleAddNode('action')}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>کریار</span>
            </button>
            <button 
              onClick={() => handleAddNode('question')}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-900 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span>پرسیار</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Canvas Actions */}
          <button 
            onClick={handleAutoLayout}
            title="رێکخستنا خۆکار یا نۆدان"
            className="p-2 rounded-lg bg-slate-850 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-slate-100 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            title="نەخشە و قالبێن کارپێکرنێ"
            className={`flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              showTemplates 
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-slate-850 border-slate-850 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>قالبێن کارێ</span>
          </button>

          {/* Mobile Companion Guide Button */}
          <button 
            onClick={() => setShowAndroidGuide(!showAndroidGuide)}
            title="رێنماییا بڵاوکردنەوەی و ئەندرۆیدێ"
            className={`flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              showAndroidGuide 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse' 
                : 'bg-slate-850 border-slate-850 hover:border-slate-700 text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>رێنماییا موبایلێ</span>
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && (
            <button 
              onClick={handleInstallApp}
              className="flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-lg shadow-emerald-500/20 transition-all duration-200 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>دابەزاندنا ئەپی</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-800" />

          {/* Offline/Online Handler & Simulation */}
          <div className="flex items-center space-x-2 space-x-reverse bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center space-x-1.5 space-x-reverse">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
              <span className="text-[11px] text-slate-300 font-medium">
                {isOnline ? 'سەر هێڵ' : 'بێ هێڵ'}
              </span>
            </span>
            <button
              onClick={() => {
                const targetState = !isOnline;
                setIsOnline(targetState);
                if (!targetState) {
                  speakResponse("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە");
                }
              }}
              title="تاقیکرنا ڕەوشا بێ ئینتەرنێتێ"
              className={`px-2 py-0.5 text-[10px] rounded font-semibold cursor-pointer border transition-all ${
                !isOnline 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30' 
                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {!isOnline ? 'چالاک بکە ڤە' : 'تاقیکرنا ئۆفلایین'}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-1.5 space-x-reverse px-3 py-2 rounded-lg text-xs font-medium bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>دەرکێشان</span>
            </button>
            <div className="absolute left-0 top-full mt-1.5 w-48 rounded-lg bg-slate-900 border border-slate-800 shadow-xl opacity-0 scale-95 pointer-events-none group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-30">
              <div className="p-1.5 space-y-0.5">
                <button 
                  onClick={handleExportMarkdown}
                  className="flex items-center space-x-2 space-x-reverse w-full px-3 py-2 rounded-md text-right text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>دۆسیەیا Markdown (.md)</span>
                </button>
                <button 
                  onClick={handleExportJson}
                  className="flex items-center space-x-2 space-x-reverse w-full px-3 py-2 rounded-md text-right text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-400" />
                  <span>دۆسیەیا پاڵپشت (.json)</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleClearCanvas}
            title="پاککرنا تەختەی"
            className="p-2 rounded-lg bg-slate-850 border border-slate-850 hover:border-red-900/30 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-lg bg-slate-850 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div className="bg-rose-950/85 border-b border-rose-800/40 px-6 py-2.5 flex items-center justify-between text-rose-200 text-xs animate-fade-in z-20" dir="rtl">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>
              <strong>تۆ یێ بێ هێڵی (Offline):</strong> هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە بۆ جێبەجێکرنا فەرمانێن ژیرییا دەستکرد! تەنێ کارێن سەر تەختەی د ئامادەنە بۆ تومارکرنێ ل ناوخۆ.
            </span>
          </div>
          <button 
            onClick={() => speakResponse("هەڤال، ئەز ل هیڤیا ئینتەرنێتێ مە")}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-[11px] font-semibold text-rose-300 transition-all cursor-pointer flex items-center space-x-1 space-x-reverse"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>گوهداریا دەنگی</span>
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* TEMPLATE DRAWER (TOP OVERLAY) */}
        {showTemplates && (
          <div className="absolute top-4 left-4 right-4 max-w-4xl mx-auto bg-slate-900/95 border border-slate-800 shadow-2xl rounded-xl p-5 z-20 backdrop-blur-md transition-all">
            <div className="flex items-center justify-between mb-3.5 flex-row-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">بارکرنا قالبەکێ مێشکدەرئێخستنا لۆجستیکی</h3>
              </div>
              <button 
                onClick={() => setShowTemplates(false)}
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-850 px-2 py-1 rounded cursor-pointer"
              >
                داخستن
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(preset => (
                <div 
                  key={preset.id}
                  onClick={() => loadTemplate(preset)}
                  className="flex flex-col p-4 rounded-lg bg-slate-950 hover:bg-slate-850/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    {preset.icon}
                    <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed flex-1">
                    {preset.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 flex-row-reverse">
                    <span>{preset.nodes.length} نۆد</span>
                    <span className="flex items-center text-indigo-400 hover:text-indigo-300">
                      بارکرنا قالبى <ChevronRight className="w-3 h-3 mr-0.5 transform rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLOATING HELP BUBBLE */}
        {showHelp && (
          <div className="absolute bottom-4 right-4 max-w-sm bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl z-20 font-sans text-xs space-y-2 text-right">
            <h4 className="font-semibold text-slate-200 flex items-center justify-end space-x-1.5 space-x-reverse">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>دەستکاریکرنا خێرا</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 leading-relaxed text-[10px]">
              <li>💡 <strong className="text-slate-200">لڤاندنا نۆدان</strong>: ل سەر نۆدان کلیک بکە و کێش بکە بۆ گۆڕینا جهێ وان.</li>
              <li>🌌 <strong className="text-slate-200">جوڵاندنا تەختەی</strong>: ل سەر جهێ ڤالا یێ تەختەی کلیک بکە و بکێشە بۆ گەڕیانێ.</li>
              <li>✨ <strong className="text-slate-200">بەرفراھکرنا ژیریێ</strong>: نۆدەکێ هەلبژێرە، پاشان ل سەر یەک ژ دوگمەیێن لایێ ڕاستێ لێدە.</li>
              <li>🔗 <strong className="text-slate-200">گرێدانا خۆکار</strong>: دەمێ نۆدەکا نوی دروست دکەی و نۆدەکا دی یا هەلبژارتی بیت، خۆکار دێ گرێدەت.</li>
              <li>📲 <strong className="text-emerald-400">PWA (ئەپێ موبایلێ)</strong>: دکاری ڤێ وەک ئەپ د موبایلا خۆ دا دابەزینی. ل سەر Safari: دوگمەیا Share لێدە پاشان "Add to Home Screen" بکە. ل سەر Android: دوگمەیا "دابەزاندنا ئەپی" ل سەرى لێدە.</li>
            </ul>
          </div>
        )}

        {/* CANVAS WORKSPACE */}
        <div 
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleCanvasMouseDown}
          className={`flex-1 h-full overflow-hidden relative cursor-grab ${isPanning ? 'cursor-grabbing' : ''}`}
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
          }}
        >
          {/* CONNECTIONS (SVG OVERLAY) */}
          <svg 
            id="grid-svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              transformOrigin: '0 0'
            }}
          >
            <defs>
              <linearGradient id="edge-gradient-root" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="edge-gradient-generic" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {edges.map(edge => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;

              // Node dimensions (approximate centers of 240px wide nodes)
              const startX = fromNode.x + 120;
              const startY = fromNode.y + 60;
              const endX = toNode.x + 120;
              const endY = toNode.y + 60;

              // Beautiful Bezier Curve formulation
              const controlPointX1 = startX + (endX - startX) * 0.5;
              const controlPointY1 = startY;
              const controlPointX2 = startX + (endX - startX) * 0.5;
              const controlPointY2 = endY;

              const pathString = `M ${startX} ${startY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endX} ${endY}`;
              const isRootSource = fromNode.type === 'root';

              return (
                <g key={edge.id}>
                  {/* Glowing background path */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isRootSource ? '#10b981' : '#6366f1'}
                    strokeWidth="3.5"
                    strokeOpacity="0.08"
                  />
                  {/* Visual path line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isRootSource ? 'url(#edge-gradient-root)' : 'url(#edge-gradient-generic)'}
                    strokeWidth="1.5"
                    strokeDasharray={fromNode.type === 'question' ? '4,4' : undefined}
                  />
                </g>
              );
            })}
          </svg>

          {/* NODES LAYER */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              transformOrigin: '0 0'
            }}
          >
            {nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              
              // Colors based on types
              let typeStyles = {
                bg: 'bg-slate-900/90',
                border: 'border-slate-800 hover:border-slate-750',
                glow: 'shadow-lg',
                iconColor: 'text-indigo-400',
                badgeBg: 'bg-indigo-500/10 text-indigo-400'
              };

              if (node.type === 'root') {
                typeStyles = {
                  bg: 'bg-emerald-950/20 border-2',
                  border: isSelected ? 'border-emerald-400' : 'border-emerald-500/50 hover:border-emerald-400',
                  glow: 'shadow-[0_0_15px_rgba(16,185,129,0.06)]',
                  iconColor: 'text-emerald-400',
                  badgeBg: 'bg-emerald-500/20 text-emerald-300'
                };
              } else if (node.type === 'action') {
                typeStyles = {
                  bg: 'bg-slate-900/95',
                  border: isSelected ? 'border-amber-400 border-2' : 'border-amber-500/30 hover:border-amber-500/50',
                  glow: 'shadow-md',
                  iconColor: 'text-amber-400',
                  badgeBg: 'bg-amber-500/10 text-amber-400'
                };
              } else if (node.type === 'question') {
                typeStyles = {
                  bg: 'bg-slate-900/95',
                  border: isSelected ? 'border-rose-400 border-2' : 'border-rose-500/30 hover:border-rose-500/50',
                  glow: 'shadow-md',
                  iconColor: 'text-rose-400',
                  badgeBg: 'bg-rose-500/10 text-rose-400'
                };
              } else {
                // concept
                if (isSelected) {
                  typeStyles.border = 'border-indigo-400 border-2';
                  typeStyles.glow = 'shadow-[0_0_15px_rgba(99,102,241,0.08)]';
                }
              }

              const isDragged = draggedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  style={{ 
                    left: node.x, 
                    top: node.y,
                    width: '240px'
                  }}
                  className={`absolute p-4 rounded-xl border ${typeStyles.bg} ${typeStyles.border} ${typeStyles.glow} backdrop-blur-sm pointer-events-auto cursor-grab active:cursor-grabbing transition-[transform,shadow,border-color,background-color] duration-300 ease-out select-none ${
                    isDragged 
                      ? 'scale-[1.04] rotate-[1.5deg] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.15)] bg-slate-900/98 border-emerald-500/50 z-50 cursor-grabbing' 
                      : isSelected 
                        ? 'scale-[1.02] -rotate-[0.5deg] ring-1 ring-emerald-500/20 z-20' 
                        : 'hover:scale-[1.01] hover:shadow-md z-10'
                  }`}
                >
                  {/* Badge & Quick Delete */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider uppercase ${typeStyles.badgeBg}`}>
                      {node.type}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-semibold text-slate-100 tracking-wide line-clamp-1 mb-1 bg-transparent border-none outline-none">
                    {node.title}
                  </h3>

                  {/* Description Snippet */}
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {node.content}
                  </p>

                  {/* Quick Expand Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between flex-row-reverse">
                    <span className="text-[9px] text-slate-500 font-mono">
                      X: {Math.round(node.x)} Y: {Math.round(node.y)}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        runAiCommand('brainstorm');
                      }}
                      className="flex items-center space-x-1 space-x-reverse px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/20 text-[10px] text-slate-300 font-medium cursor-pointer transition-all"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>بەرفراھکرن</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NO SELECTED STATE INTRO PLACECARD */}
        {!selectedNode && (
          <div className="absolute right-6 bottom-6 bg-slate-900/90 border border-slate-850 p-4 rounded-xl max-w-sm backdrop-blur z-10 shadow-lg text-right">
            <h4 className="text-xs font-semibold text-slate-200 mb-1 flex items-center justify-end space-x-1.5 space-x-reverse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>دەستپێکرنا گەشتێ</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ل سەر هەر هزرا تەختەی کلیک بکە دا کو <strong className="text-emerald-400">ڕاوێژکارێ کارێ لۆجستی</strong> بکەی، یان ژى بۆ دەستپێکرن یەک ژ قالبێن کارى یێن سەرى باربکە.
            </p>
          </div>
        )}

        {/* SIDEBAR EDIT PANEL & AI WORKSHOP */}
        <div 
          className={`w-[420px] h-full border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col z-15 transition-transform duration-300 ${
            selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'
          }`}
        >
          {selectedNode ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 flex-row-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">پانتاییا کارێ نۆدێ یێ ژیر</span>
                </div>
                <button 
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Main edit workspace */}
              <div className="p-5 flex-1 space-y-4 text-right">
                {/* Node type selector */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">جۆرێ نۆدێ (تایبەتمەندی)</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {(['root', 'concept', 'action', 'question'] as const).map(type => {
                      const displayNames: Record<string, string> = {
                        root: 'سەرەکی',
                        concept: 'هزر',
                        action: 'کریار',
                        question: 'پرسیار'
                      };
                      return (
                        <button
                          key={type}
                          onClick={() => updateNodeField(selectedNode.id, 'type', type)}
                          className={`py-1 rounded text-[10px] font-medium tracking-wide transition-all cursor-pointer ${
                            selectedNode.type === type 
                              ? 'bg-slate-800 text-slate-200 font-semibold' 
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {displayNames[type] || type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Node Title edit */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">ناڤونیشانێ نۆدێ</label>
                  <input
                    type="text"
                    value={selectedNode.title}
                    onChange={(e) => updateNodeField(selectedNode.id, 'title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none transition-colors text-right"
                    placeholder="بۆ نموونە: دیارکرنا رێکێن کورتتر"
                  />
                </div>

                {/* Node Content edit */}
                <div>
                  <div className="flex items-center justify-between mb-1 flex-row-reverse">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">شرووڤە و پێزانینێن هزری</label>
                    <button
                      onClick={() => speakResponse(`${selectedNode.title}. ${selectedNode.content}`)}
                      title="ب دەنگ بخوینە (Kurdish TTS)"
                      className={`flex items-center space-x-1 space-x-reverse px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                        isSpeaking 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' 
                          : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-red-400" />
                          <span>بوەستینە</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>گوهداریکردن</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={selectedNode.content}
                    onChange={(e) => updateNodeField(selectedNode.id, 'content', e.target.value)}
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-100 leading-relaxed outline-none transition-colors resize-y font-sans text-right"
                    placeholder="پێزانین، خالێن گرنگ یان شرووڤەیا خۆ ل ڤێرێ بنڤیسە..."
                  />
                </div>

                {/* AI Loading status bar */}
                {aiLoading && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 space-x-reverse animate-pulse text-right">
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <div>
                      <p className="text-[11px] font-medium text-emerald-400">هزرکرنا بریکارێ راوێژکار...</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{aiStatusMessage || 'Generating...'}</p>
                    </div>
                  </div>
                )}

                {/* AI ACTIONS TOOLBOX */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">کرتۆکێن ژیرییا دەستکرد (Gemini API)</h4>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Radial Expansion */}
                    <button
                      onClick={() => runAiCommand('brainstorm')}
                      disabled={aiLoading}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-emerald-500/5 border border-slate-800 hover:border-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer group text-center"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-200">مێشکدەرئێخستن</span>
                      <span className="text-[8px] text-slate-500 mt-0.5">٣ بۆ ٤ نۆدێن نوی دروست دکەت</span>
                    </button>

                    {/* Content Detailer */}
                    <button
                      onClick={() => runAiCommand('expand')}
                      disabled={aiLoading}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-indigo-500/5 border border-slate-800 hover:border-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer group text-center"
                    >
                      <Layers className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-semibold text-slate-200">کۆنکریتکرنا کارى</span>
                      <span className="text-[8px] text-slate-500 mt-0.5">هەنگاو و مەترسیان دەستنیشان دکەت</span>
                    </button>
                  </div>

                  {/* Refinement presets */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] text-slate-500 font-mono">گۆڕینی شێوازی دەقی بە زمانی بەهدینی:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {['professional', 'creative', 'concise', 'punchy'].map(style => {
                        const styleNames: Record<string, string> = {
                          professional: 'فەرمی',
                          creative: 'داهێنەر',
                          concise: 'پوخت',
                          punchy: 'ب هێز'
                        };
                        return (
                          <button
                            key={style}
                            onClick={() => runAiCommand('rewrite', style)}
                            disabled={aiLoading}
                            className="py-1 rounded bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-50 text-[9px] text-slate-300 font-medium cursor-pointer transition-colors"
                          >
                            {styleNames[style] || style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Prompt Context input */}
                  <form onSubmit={handleCustomPromptSubmit} className="space-y-1.5 pt-2 text-right">
                    <label className="block text-[9px] text-slate-500 font-mono">داخوازیەکا نوی بنڤیسە بۆ جێبەجێکرنێ:</label>
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-1 items-center space-x-reverse">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                            placeholder="بۆ نموونە: مەترسیێن کێمکرنا کاربۆنێ چنە ل ڤێرێ؟"
                            disabled={aiLoading}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-8 pr-2.5 py-1.5 text-[10px] text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-50 text-right"
                          />
                          {voiceSupported && (
                            <button
                              type="button"
                              onClick={toggleVoiceListening}
                              title="دەنگ تۆمار بکە (کوردیا بهەدینی/سۆرانی)"
                              className={`absolute left-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all cursor-pointer ${
                                isListening 
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse border border-red-500/30' 
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                              }`}
                            >
                              {isListening ? (
                                <MicOff className="w-3.5 h-3.5" />
                              ) : (
                                <Mic className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={aiLoading || !promptInput.trim()}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-100 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer self-stretch flex items-center justify-center"
                        >
                          بپرسە
                        </button>
                      </div>
                      {isListening && (
                        <p className="text-[9px] text-emerald-400 animate-pulse font-mono">
                          ● گۆتارا دەنگی کارایە... باخڤە ب زمانێ کوردی یێ شیرین
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Delete button footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between flex-row-reverse">
                <span className="text-[10px] text-slate-500 font-mono">{selectedNode.id}</span>
                <button 
                  onClick={() => handleDeleteNode(selectedNode.id)}
                  className="flex items-center space-x-1 space-x-reverse px-3 py-1.5 rounded-lg border border-red-950/40 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ژێبرنا نۆدێ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
              <Sparkles className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-400 mb-1">چ نۆد نەهاتینە هەلبژارتن</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                کلیکێ ل سەر هەر کاردەکێ ل سەر تەختەی بکە دا کو دەست ب نووژەنکرن، پلانکێشان یان مێشکدەرئێخستنێ بکەی ب زمانی کوردیێ بەهدینی دگەل ڕاوێژکاری.
              </p>
            </div>
          )}
        </div>

        {/* MOBILE & PWA COMPANION GUIDE MODAL */}
        {showAndroidGuide && (
          <div className="absolute inset-y-0 right-0 w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl z-30 flex flex-col font-sans text-right" dir="rtl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 flex-row-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">رێنماییا بڵاوکردنەوەی و ئەندرۆیدێ</h3>
              </div>
              <button 
                onClick={() => setShowAndroidGuide(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-850 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-300 leading-relaxed text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                <h4 className="font-semibold text-emerald-400 flex items-center justify-start space-x-1.5 space-x-reverse">
                  <Globe className="w-4 h-4" />
                  <span>دابەزاندنا ئەپی وەک PWA ل سەر موبایلێ</span>
                </h4>
                <p>
                  بۆ وێ چەندێ ئەپێ <strong>EcoFlow Logistics</strong> ل سەر شاشا موبایلا تە دەرکەڤیت وەک ئەپەکێ ئاسایی (Native App):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>ل سەر موبایلێ، لینکێ ئەپێ خۆ د وێبگەڕێ Chrome یان Safari دا بکەوە.</li>
                  <li><strong>ل سەر iOS (Safari):</strong> ل سەر کۆمەکا پارڤەکرنێ (Share) لێدە و پاشان <strong className="text-slate-200">"Add to Home Screen"</strong> هەلبژێرە.</li>
                  <li><strong>ل سەر Android (Chrome):</strong> ل سەر سێ خالێن سەرى لێدە و <strong className="text-slate-200">"Install app"</strong> یان ل سەر دوگمەیا <strong className="text-slate-200">"دابەزاندنا ئەپی"</strong> یا کەسک ل سەرى لێدە.</li>
                </ol>
              </div>

              <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-3">
                <h4 className="font-semibold text-indigo-400 flex items-center justify-start space-x-1.5 space-x-reverse">
                  <Smartphone className="w-4 h-4" />
                  <span>گوهۆڕین بۆ Native Android App ب رێکا Capacitor</span>
                </h4>
                <p>
                  ئەگەر تە دڤێت ڤی پڕۆژەی بگەهینیە ئاستێ Native App ب رێکا Capacitor:
                </p>
                <div className="space-y-2 bg-slate-950 p-3 rounded-lg font-mono text-[10px] text-indigo-300 select-all overflow-x-auto text-left" dir="ltr">
                  <p># Install Capacitor Core & CLI</p>
                  <p>npm install @capacitor/core @capacitor/cli</p>
                  <p>npx cap init EcoFlow com.ecoflow.app --web-dir=dist</p>
                  <p>npm install @capacitor/android</p>
                  <p>npx cap add android</p>
                  <p># Build and copy files</p>
                  <p>npm run build</p>
                  <p>npx cap sync</p>
                  <p>npx cap open android</p>
                </div>
              </div>

              <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-3">
                <h4 className="font-semibold text-amber-400 flex items-center justify-start space-x-1.5 space-x-reverse">
                  <Book className="w-4 h-4" />
                  <span>مۆڵەتێن پێدڤی د AndroidManifest.xml دا</span>
                </h4>
                <p>
                  بۆ ئەوەی مایک و کارکرنا ل پشتا شاشێ (Background Activity) کار بکەن، ئەڤ هێڵە ل ناڤ دۆسیەیا <code className="text-amber-300 font-mono">android/app/src/main/AndroidManifest.xml</code> زێدە بکە:
                </p>
                <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[9px] text-amber-300 select-all overflow-x-auto text-left" dir="ltr">
{`<!-- Permissions for Microphone & Audio -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Permissions for Background Services -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />`}
                </pre>
              </div>

              <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-row-reverse">
                  <h4 className="font-semibold text-emerald-400 flex items-center justify-start space-x-1.5 space-x-reverse">
                    <Check className="w-4 h-4" />
                    <span>سکرێپتێ Foreground Service بۆ مایکێ</span>
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`// BackgroundService.ts
export const startVoiceService = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("راوێژکار: مایک یێ ئاکتیف بوو ل پشتا شاشێ.");
      })
      .catch((err) => {
        console.error("راوێژکار: کێشەیەک د ئاکتیفکرنا مایکێ دا هەیە:", err);
      });
  }
};`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded flex items-center space-x-1 space-x-reverse cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'کۆپی بوو!' : 'کۆپیکرنا کۆدی'}</span>
                  </button>
                </div>
                <p>
                  ئەڤە کۆدێ خزمەتگۆزاریا Foreground یە بۆ مایکێ دا کو بشێت ل پشتا شاشێ ژی کار بکەت و گوه ل دەنگی بیت:
                </p>
                <pre className="bg-slate-950 p-3 rounded-lg font-mono text-[9px] text-emerald-300 select-all overflow-x-auto text-left" dir="ltr">
{`// startVoiceService Background Service
export const startVoiceService = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        console.log("راوێژکار: مایک یێ ئاکتیف بوو ل پشتا شاشێ.");
      })
      .catch((err) => {
        console.error("راوێژکار: کێشەیەک د مایکێ دا هەیە:", err);
      });
  }
};`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
