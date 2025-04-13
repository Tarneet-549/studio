'use client';

import {useState, useEffect, useRef} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {deobfuscateCode} from '@/ai/flows/deobfuscate-code';
import {Sun, Moon, MessageSquare, ArrowDown, RotateCcw} from 'lucide-react'; // Import icons
import {useTheme} from 'next-themes'; // Import useTheme hook
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {toast} from "@/hooks/use-toast";
import {explainCodeContext} from '@/ai/flows/explain-code-context';

// Placeholder chart data and type
const initialChartData = [
  {name: 'Jan', value: 20},
  {name: 'Feb', value: 50},
  {name: 'Mar', value: 30},
  {name: 'Apr', value: 45},
  {name: 'May', value: 70},
];

const chartTypes = ['Line', 'Bar', 'Area'];

// Encryption function (very basic, do not use in production)
const encrypt = (text: string): string => {
  try {
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key';
    const textToChars = (text: string) => text.split('').map((char) => char.charCodeAt(0));
    const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
    const applySecret = (code: number) => textToChars(secret).reduce((a,b) => a ^ b, code);

    return text.split('')
        .map(textToChars)
        .map(applySecret)
        .map(byteHex)
        .join('');
  } catch (error) {
    console.error("Encryption error:", error);
    return text; // Return original text on error
  }
};

// Decryption function (very basic, do not use in production)
const decrypt = (encrypted: string): string => {
  try {
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key';
    const fromHex = (hex: string) => parseInt(hex, 16);
    const textToChars = (text: string) => text.split('').map((char) => char.charCodeAt(0));
    const applySecret = (code: number) => textToChars(secret).reduce((a,b) => a ^ b, code);

    return encrypted.match(/.{1,2}/g)!.map(fromHex)
        .map(applySecret)
        .map((charCode) => String.fromCharCode(charCode))
        .join('');
  } catch (error) {
    console.error("Decryption error:", error);
    return encrypted; // Return original text on error
  }
};

// Function to calculate cyclomatic complexity (basic implementation)
const calculateComplexity = (code: string): number => {
  const lines = code.split('\n');
  const conditionalStatements = lines.filter(line =>
      line.includes('if') || line.includes('else') || line.includes('for') || line.includes('while')
  ).length;
  return conditionalStatements + 1;
};

export default function Home() {
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [deobfuscatedCode, setDeobfuscatedCode] = useState('');
  const [isDeobfuscating, setIsDeobfuscating] = useState(false);
  const {theme, setTheme} = useTheme(); // Use next-themes hook for theme management
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [currentChartData, setCurrentChartData] = useState(initialChartData);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  const [isObfuscatedCodeEncrypted, setIsObfuscatedCodeEncrypted] = useState(false);
  const [isDeobfuscatedCodeEncrypted, setIsDeobfuscatedCodeEncrypted] = useState(false);

  // Ensure that the theme is initialized after the component mounts
  useEffect(() => {
    // This is necessary because next-themes needs to run on the client-side

    // Load obfuscated code from localStorage
    const storedObfuscatedCode = localStorage.getItem('obfuscatedCode');
    if (storedObfuscatedCode) {
      try {
        const decryptedCode = decrypt(storedObfuscatedCode);
        setObfuscatedCode(decryptedCode);
        setIsObfuscatedCodeEncrypted(true);
      } catch (error) {
        console.error('Error decrypting obfuscated code:', error);
        setObfuscatedCode(storedObfuscatedCode);
        setIsObfuscatedCodeEncrypted(false);
      }
    }

    // Load deobfuscated code from localStorage
    const storedDeobfuscatedCode = localStorage.getItem('deobfuscatedCode');
    if (storedDeobfuscatedCode) {
      try {
        const decryptedCode = decrypt(storedDeobfuscatedCode);
        setDeobfuscatedCode(decryptedCode);
        setIsDeobfuscatedCodeEncrypted(true);
      } catch (error) {
        console.error('Error decrypting deobfuscated code:', error);
        setDeobfuscatedCode(storedDeobfuscatedCode);
        setIsDeobfuscatedCodeEncrypted(false);
      }
    }
  }, []);

  const handleDeobfuscate = async () => {
    setIsDeobfuscating(true);
    try {
      const result = await deobfuscateCode({obfuscatedCode});
      const newDeobfuscatedCode = result.deobfuscatedCode;
      setDeobfuscatedCode(newDeobfuscatedCode);

      // Encrypt and store deobfuscated code in localStorage
      const encryptedDeobfuscatedCode = encrypt(newDeobfuscatedCode);
      localStorage.setItem('deobfuscatedCode', encryptedDeobfuscatedCode);
      setIsDeobfuscatedCodeEncrypted(true);

      // Update action history
      setActionHistory(prev => [...prev, 'Deobfuscated code']);
    } catch (error) {
      console.error('Error during deobfuscation:', error);
      setDeobfuscatedCode('// An error occurred during deobfuscation.');
      toast({
        title: "Deobfuscation Failed",
        description: "An error occurred while deobfuscating the code.",
        variant: "destructive",
      });
    } finally {
      setIsDeobfuscating(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setObfuscatedCode(newCode);

    // Encrypt and store obfuscated code in localStorage
    const encryptedCode = encrypt(newCode);
    localStorage.setItem('obfuscatedCode', encryptedCode);
    setIsObfuscatedCodeEncrypted(true);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSendMessage = async (message: string) => {
    setChatHistory(prev => [...prev, `User: ${message}`]);

    try {
      const geminiApiKey = 'AIzaSyAGmVxghwQ4tQogZwf87pKfJJqPSf6VFR4';
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${geminiApiKey}`;

      const response = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: message }],
          }],
        }),
      });

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setChatHistory(prev => [...prev, `AI: ${aiResponse}`]);
      } else {
        setChatHistory(prev => [...prev, `AI: Sorry, I couldn't process your request.`]);
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      setChatHistory(prev => [...prev, `AI: An error occurred while processing your request.`]);
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update action history
    setActionHistory(prev => [...prev, `Downloaded ${filename}`]);
  };

  const undoLastAction = () => {
    if (actionHistory.length > 0) {
      const lastAction = actionHistory[actionHistory.length - 1];
      setActionHistory(prev => prev.slice(0, -1));
      toast({
        title: "Action Undone",
        description: `Undid last action: ${lastAction}`,
      });
    } else {
      toast({
        title: "No Actions to Undo",
        description: "There are no more actions to undo.",
      });
    }
  };

  const obfuscatedCodeComplexity = calculateComplexity(obfuscatedCode);
  const deobfuscatedCodeComplexity = calculateComplexity(deobfuscatedCode);

  return (
    <div className="flex flex-col h-screen w-full transition-colors">
      {/* Header with Theme Toggle */}
      <header className="flex items-center justify-between p-4 bg-secondary transition-colors">
        <CardTitle className="text-xl font-bold">PyClarity</CardTitle>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleTheme} variant="outline" size="icon" className="transition-colors">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex p-4">
        <div className="w-1/2 p-2">
          <Card className="h-full flex flex-col transition-colors">
            <CardHeader>
              <CardTitle>Obfuscated Code</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                placeholder="Enter obfuscated Python code here"
                value={obfuscatedCode}
                onChange={handleCodeChange}
                className="flex-1 text-area-large transition-colors"
              />
              <div className="flex justify-between mt-4">
                <Button
                  className="transition-colors"
                  onClick={handleDeobfuscate}
                  disabled={isDeobfuscating}
                >
                  {isDeobfuscating ? 'Deobfuscating...' : 'Deobfuscate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Separator orientation="vertical" className="transition-colors" />
        <div className="w-1/2 p-2">
          <Card className="h-full flex flex-col transition-colors">
            <CardHeader>
              <CardTitle>Deobfuscated Code</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Textarea
                readOnly
                placeholder="Deobfuscated code will appear here"
                value={deobfuscatedCode}
                className="flex-1 text-area-large transition-colors"
              />
              <div className="flex justify-between mt-4">
                <Button
                  variant="secondary"
                  onClick={() => downloadCode(deobfuscatedCode, 'deobfuscated_code.py')}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex p-4 space-x-4">
        {/* AI Assistant / Contextual Chatbot */}
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="mb-2">
              {chatHistory.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 border rounded-l-md px-2 py-1 text-foreground ai-input"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.target.value);
                    (e.target as HTMLInputElement).value = ''; // Clear the input
                  }
                }}
              />
              <Button onClick={() => {
                const input = document.querySelector<HTMLInputElement>('.ai-input');
                if (input) {
                  handleSendMessage(input.value);
                  input.value = ''; // Clear the input
                }
              }} className="rounded-r-md">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Data Visualization / Analytics */}
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>Data Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Code Statistics</AccordionTrigger>
                <AccordionContent>
                  <div>
                    <p>Lines of Obfuscated Code: {obfuscatedCode.split('\n').length}</p>
                    <p>Lines of Deobfuscated Code: {deobfuscatedCode.split('\n').length}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Complexity Analysis</AccordionTrigger>
                <AccordionContent>
                  <div>
                    <p>Obfuscated Code Complexity: {obfuscatedCodeComplexity}</p>
                    <p>Deobfuscated Code Complexity: {deobfuscatedCodeComplexity}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* Add more accordion items as needed */}
            </Accordion>
          </CardContent>
        </Card>

        {/* Undo / Action History */}
        <Card className="w-1/4">
          <CardHeader>
            <CardTitle>Action History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="mb-2">
              {actionHistory.map((action, index) => (
                <div key={index} className="mb-1">
                  {action}
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={undoLastAction} disabled={actionHistory.length === 0}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
