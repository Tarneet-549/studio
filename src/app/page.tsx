'use client';

import {useState, useEffect} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {deobfuscateCode} from '@/ai/flows/deobfuscate-code';
import {Sun, Moon} from 'lucide-react'; // Import icons
import {useTheme} from 'next-themes'; // Import useTheme hook

export default function Home() {
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [deobfuscatedCode, setDeobfuscatedCode] = useState('');
  const [isDeobfuscating, setIsDeobfuscating] = useState(false);
  const {theme, setTheme} = useTheme(); // Use next-themes hook for theme management

  // Ensure that the theme is initialized after the component mounts
  useEffect(() => {
    // This is necessary because next-themes needs to run on the client-side
  }, []);

  const handleDeobfuscate = async () => {
    setIsDeobfuscating(true);
    try {
      const result = await deobfuscateCode({obfuscatedCode});
      setDeobfuscatedCode(result.deobfuscatedCode);
    } catch (error) {
      console.error('Error during deobfuscation:', error);
      setDeobfuscatedCode('// An error occurred during deobfuscation.');
    } finally {
      setIsDeobfuscating(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col h-screen w-full transition-colors">
      {/* Header with Theme Toggle */}
      <header className="flex items-center justify-between p-4 bg-secondary transition-colors">
        <CardTitle className="text-xl font-bold">PyClarity</CardTitle>
        <Button onClick={toggleTheme} variant="outline" size="icon" className="transition-colors">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
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
                onChange={e => setObfuscatedCode(e.target.value)}
                className="flex-1 text-area-large transition-colors"
              />
              <Button
                className="mt-4 w-full transition-colors"
                onClick={handleDeobfuscate}
                disabled={isDeobfuscating}
              >
                {isDeobfuscating ? 'Deobfuscating...' : 'Deobfuscate'}
              </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
