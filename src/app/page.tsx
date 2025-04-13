'use client';

import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {deobfuscateCode} from '@/ai/flows/deobfuscate-code';

export default function Home() {
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [deobfuscatedCode, setDeobfuscatedCode] = useState('');
  const [isDeobfuscating, setIsDeobfuscating] = useState(false);

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

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/2 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Obfuscated Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter obfuscated Python code here"
              value={obfuscatedCode}
              onChange={e => setObfuscatedCode(e.target.value)}
            />
            <Button
              className="mt-4 w-full"
              onClick={handleDeobfuscate}
              disabled={isDeobfuscating}
            >
              {isDeobfuscating ? 'Deobfuscating...' : 'Deobfuscate'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <Separator orientation="vertical" />
      <div className="w-1/2 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Deobfuscated Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              placeholder="Deobfuscated code will appear here"
              value={deobfuscatedCode}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
