"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

export default function LuckyNumbersPage() {
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);

  const generateLuckyNumbers = () => {
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      const randomNumber = Math.floor(Math.random() * 60) + 1;
      numbers.add(randomNumber);
    }
    setLuckyNumbers(Array.from(numbers).sort((a, b) => a - b));
  };

  useEffect(() => {
    generateLuckyNumbers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl text-center font-bold mb-8">Números da sorte</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center flex-wrap gap-4 mb-8">
              {luckyNumbers.map((num, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-500 text-white rounded-full text-2xl md:text-3xl font-bold shadow-lg transform hover:scale-110 transition-transform"
                >
                  {num}
                </div>
              ))}
            </div>
            <Button onClick={generateLuckyNumbers}>Gerar novos números</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}