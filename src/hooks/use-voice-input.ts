import { useState, useCallback, useRef, useEffect } from 'react';

interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = options.continuous ?? true;
        recognition.interimResults = options.interimResults ?? true;
        recognition.lang = options.language ?? 'en-US';
        recognition.maxAlternatives = options.maxAlternatives ?? 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };

        recognition.onerror = (event) => {
          setError(event.error);
          setIsListening(false);
          console.error('Speech recognition error:', event.error);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(prev => prev + finalTranscript);
          setInterimTranscript(interimTranscript);

          // Auto-stop after period of silence
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(() => {
            if (recognition && isListening) {
              recognition.stop();
            }
          }, 3000); // Stop after 3 seconds of silence
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser');
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [options.continuous, options.interimResults, options.language, options.maxAlternatives]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported');
      return;
    }

    if (isListening) {
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Failed to start speech recognition:', err);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Process voice commands for task creation
  const processVoiceCommand = useCallback(async (text: string) => {
    try {
      // Simple command detection patterns
      const taskPatterns = [
        /(?:create|add|make)\s+(?:a\s+)?task\s+(?:to\s+)?(.*)/i,
        /(?:remind\s+me\s+to|i\s+need\s+to)\s+(.*)/i,
        /(?:schedule|plan)\s+(.*?)(?:\s+for\s+(.*?))?(?:\s+at\s+(.*?))?/i
      ];

      const notePatterns = [
        /(?:create|add|make)\s+(?:a\s+)?note\s+(?:about\s+)?(.*)/i,
        /(?:write\s+down|note\s+that)\s+(.*)/i,
        /(?:remember|save)\s+(.*)/i
      ];

      for (const pattern of taskPatterns) {
        const match = text.match(pattern);
        if (match) {
          return {
            type: 'task' as const,
            content: match[1]?.trim(),
            rawCommand: text
          };
        }
      }

      for (const pattern of notePatterns) {
        const match = text.match(pattern);
        if (match) {
          return {
            type: 'note' as const,
            content: match[1]?.trim(),
            rawCommand: text
          };
        }
      }

      // If no specific pattern matched, treat as general query
      return {
        type: 'query' as const,
        content: text,
        rawCommand: text
      };
    } catch (err) {
      console.error('Failed to process voice command:', err);
      return {
        type: 'query' as const,
        content: text,
        rawCommand: text
      };
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    processVoiceCommand,
    fullTranscript: transcript + interimTranscript
  };
}

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: SpeechGrammarList;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    serviceURI: string;

    // Event handlers
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

    // Methods
    abort(): void;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly confidence: number;
    readonly transcript: string;
  }

  interface SpeechGrammarList {
    readonly length: number;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
  }

  interface SpeechGrammar {
    src: string;
    weight: number;
  }

  const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}