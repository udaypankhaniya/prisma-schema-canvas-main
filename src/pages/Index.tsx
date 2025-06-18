
import React, { useState } from 'react';
import { PrismaCanvas } from '@/components/PrismaCanvas';
import { LandingPage } from '@/components/LandingPage';

const Index = () => {
  const [showCanvas, setShowCanvas] = useState(false);

  if (!showCanvas) {
    return <LandingPage onGetStarted={() => setShowCanvas(true)} />;
  }

  return (
    <div className="h-screen w-full">
      <PrismaCanvas />
    </div>
  );
};

export default Index;
