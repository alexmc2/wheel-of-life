'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { WheelChart, WheelCategory } from '@/components/wheel-chart';
import { cn } from '@/lib/utils';

const categories: WheelCategory[] = [
  {
    id: 'health',
    label: 'Health',
    description: 'Emotional, physical and mental wellbeing.',
    color: '#f59f92',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Partner, friends and family.',
    color: '#f4d28c',
  },
  {
    id: 'career',
    label: 'Career',
    description: 'Work, direction and opportunities.',
    color: '#9cd4f7',
  },
  {
    id: 'money',
    label: 'Money',
    description: 'Ability to budget, save and spend.',
    color: '#c8e7a0',
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    description: 'Home, routines and balance.',
    color: '#9ee7dc',
  },
  {
    id: 'personal_growth',
    label: 'Personal Growth',
    description: 'Actively developing yourself.',
    color: '#a9b4ff',
  },
  {
    id: 'attitude',
    label: 'Attitude',
    description: 'Approach to life in general.',
    color: '#d0a7f9',
  },
  {
    id: 'social_life',
    label: 'Social Life',
    description: 'Clubs, group activities and communities.',
    color: '#f7a8d3',
  },
];

const reflectivePrompts = [
  {
    id: 'happySegments',
    question: 'Which segments of your life are you happy with?',
  },
  {
    id: 'distanceSegments',
    question: 'Which are a distance from where you would like to be?',
  },
  {
    id: 'smoothRide',
    question: 'How smooth a ride does your Wheel provide just now?',
  },
  {
    id: 'changesNeeded',
    question:
      'What changes do you need to make in order to create the smoother ride you would like?',
  },
  {
    id: 'strongest',
    question: 'Which segment would you say you are strongest in just now? Why?',
  },
  {
    id: 'weakest',
    question: 'Which segment are you weakest in just now?',
  },
  {
    id: 'buildOnWeak',
    question: 'What can you do to build on your weaker segments?',
  },
  {
    id: 'familyView',
    question:
      'If you were to ask a family member which segment was your strongest just now, what would they say?',
  },
];

const defaultScores: Record<string, number | null> = Object.fromEntries(
  categories.map((category) => [category.id, null])
);

const defaultReflections: Record<string, string> = {
  ...Object.fromEntries(categories.map((category) => [category.id, ''])),
  ...Object.fromEntries(reflectivePrompts.map((prompt) => [prompt.id, ''])),
};

const helperNote =
  'Choose a number from 0 to 10 for your current satisfaction in this area. 0 means not satisfied; 10 means completely satisfied.';

export default function Home() {
  const [scores, setScores] = React.useState<Record<string, number | null>>({
    ...defaultScores,
  });
  const [reflections, setReflections] = React.useState<Record<string, string>>({
    ...defaultReflections,
  });
  const [step, setStep] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);
  const exportChartRef = React.useRef<SVGSVGElement | null>(null);
  const [chartSize, setChartSize] = React.useState(320);

  React.useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      const calculated =
        width >= 1024 ? 360 : Math.max(220, Math.min(320, width - 64));
      setChartSize(calculated);
    };

    updateSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
    return undefined;
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('wheel-of-life-data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          scores?: Record<string, number | null>;
          reflections?: Record<string, string>;
          step?: number;
        };
        if (parsed.scores) {
          setScores({ ...defaultScores, ...parsed.scores });
        }
        if (parsed.reflections) {
          setReflections({ ...defaultReflections, ...parsed.reflections });
        }
        if (typeof parsed.step === 'number') {
          setStep(Math.min(parsed.step, categories.length));
        }
      } catch (error) {
        console.warn('Unable to parse stored Wheel of Life data', error);
      }
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    const payload = JSON.stringify({ scores, reflections, step });
    window.localStorage.setItem('wheel-of-life-data', payload);
  }, [scores, reflections, step, hydrated]);

  const handleScoreSelect = (categoryId: string, value: number) => {
    setScores((prev) => ({ ...prev, [categoryId]: value }));
  };

  const handleReflectionChange = (promptId: string, value: string) => {
    setReflections((prev) => ({ ...prev, [promptId]: value }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, categories.length));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setScores({ ...defaultScores });
    setReflections({ ...defaultReflections });
    setStep(0);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('wheel-of-life-data');
    }
  };

  const handleDownloadPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;

    const chartElement = exportChartRef.current;
    const chartTarget = Math.min(380, Math.max(260, chartSize + 40));
    let chartImage: string | null = null;

    if (chartElement) {
      try {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(chartElement);
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        chartImage = await new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = chartTarget;
            canvas.height = chartTarget;
            const context = canvas.getContext('2d');
            if (!context) {
              reject(new Error('Canvas context not available'));
              URL.revokeObjectURL(svgUrl);
              return;
            }
            context.clearRect(0, 0, chartTarget, chartTarget);
            context.drawImage(img, 0, 0, chartTarget, chartTarget);
            URL.revokeObjectURL(svgUrl);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            reject(new Error('Unable to load SVG for export'));
          };
          img.src = svgUrl;
        });
      } catch (error) {
        console.warn('Unable to export chart', error);
      }
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text('Wheel of Life Review', margin, margin + 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(
      `Completed on ${new Date().toLocaleDateString()}`,
      margin,
      margin + 34
    );

    let cursorY = margin + 50;

    if (chartImage) {
      const chartWidth = Math.min(chartTarget, contentWidth * 0.55);
      const chartHeight = chartWidth;
      pdf.addImage(chartImage, 'PNG', margin, cursorY, chartWidth, chartHeight);

      const tableX = margin + chartWidth + 24;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('Scores', tableX, cursorY + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      let tableY = cursorY + 24;
      categories.forEach((category) => {
        const scoreValue = scores[category.id] ?? 0;
        pdf.text(category.label, tableX, tableY);
        const scoreText = `${scoreValue}/10`;
        pdf.text(scoreText, tableX + 120, tableY, { align: 'right' });
        tableY += 18;
      });

      cursorY += chartHeight + 28;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Reflection notes', margin, cursorY);
    cursorY += 20;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    const maxLineWidth = contentWidth;

    reflectivePrompts.forEach((prompt) => {
      const answer = reflections[prompt.id]?.trim() || '(No notes yet)';
      const questionLines = pdf.splitTextToSize(prompt.question, maxLineWidth);
      const answerLines = pdf.splitTextToSize(answer, maxLineWidth);
      const estimatedHeight =
        questionLines.length * 14 + answerLines.length * 14 + 12;

      if (cursorY + estimatedHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text(questionLines, margin, cursorY);
      cursorY += questionLines.length * 14;

      pdf.setFont('helvetica', 'normal');
      pdf.text(answerLines, margin, cursorY);
      cursorY += answerLines.length * 14 + 12;
    });

    pdf.save('wheel-of-life.pdf');
  };

  const isComplete = step >= categories.length;
  const progress = Math.round(
    (Math.min(step, categories.length) / categories.length) * 100
  );
  const activeCategory = categories[step];

  return (
    <div className="min-h-screen bg-[#f4f6fb] py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.2em] text-slate-500">
            Wheel of Life
          </h1>

          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
            Completing this exercise gives you a foundation on which to build
            and grow. Take a moment to rate how satisfied you are in each area,
            notice what feels out of balance, and capture the next steps you
            would like to take.
          </p>
        </header>

        <section
          className={cn(
            'flex flex-col gap-8',
            !isComplete && 'lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start'
          )}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-0">
                <CardDescription className="text-xs font-medium uppercase text-slate-500">
                  {isComplete
                    ? 'Review'
                    : 'Step ' + (step + 1) + ' of ' + categories.length}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {isComplete
                    ? 'Review your Wheel of Life'
                    : activeCategory.label}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {isComplete
                    ? 'Identify the shifts you are ready to make and prepare to revisit this wheel in a few weeks to notice your progress.'
                    : activeCategory.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-6 space-y-6">
                {!isComplete && (
                  <div className="space-y-6">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-md text-slate-600">
                      <p className="font-medium text-slate-700">{helperNote}</p>
                      <p className="mt-2 text-slate-600">
                        Think about how content you feel with this part of life
                        right now. Be honest and take your time—this is your
                        starting point for the conversations you will have with
                        your coach.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-md font-semibold text-slate-700">
                        How would you rate this area of your life today?
                      </p>
                      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                        {Array.from({ length: 11 }, (_, idx) => idx).map(
                          (value) => {
                            const isSelected =
                              scores[activeCategory.id] === value;
                            return (
                              <button
                                type="button"
                                key={value}
                                onClick={() =>
                                  handleScoreSelect(activeCategory.id, value)
                                }
                                className={cn(
                                  'flex h-12 items-center justify-center rounded-lg border text-md font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
                                  isSelected
                                    ? 'border-blue-500 bg-blue-500 text-white'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                                )}
                                aria-label={`Score ${value}`}
                              >
                                {value}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 0}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Back
                      </Button>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {progress}% complete
                        </span>
                        <Button
                          onClick={handleNext}
                          disabled={scores[activeCategory.id] === null}
                          className="min-w-[120px]"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isComplete && (
                  <div className="space-y-8">
                    <div className="rounded-xl bg-slate-50 px-4 py-4 text-md text-slate-600">
                      Revisit this exercise monthly so you can see how your
                      wheel evolves. Share your reflections with your coach to
                      keep your momentum.
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                          Wheel overview
                        </h2>
                        <div className="mt-4 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
                          <div className="w-full max-w-[400px] pl-4 sm:pl-8 lg:pl-12">
                            <WheelChart
                              categories={categories}
                              scores={scores}
                              size={Math.min(360, chartSize + 10)}
                              className="w-full"
                              svgRef={exportChartRef}
                            />
                          </div>
                          <ul className="w-full max-w-[320px] space-y-2 text-md text-slate-600 sm:pr-3 lg:pr-4">
                            {categories.map((category) => (
                              <li
                                key={category.id}
                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                              >
                                <span className="font-medium text-slate-700">
                                  {category.label}
                                </span>
                                <span className="text-slate-900">
                                  {scores[category.id] ?? 0}/10
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                          Reflection prompts
                        </h2>
                        <div className="mt-3 space-y-4 text-md text-slate-600">
                          {reflectivePrompts.map((prompt) => (
                            <div key={prompt.id}>
                              <p className="font-medium text-slate-700">
                                {prompt.question}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                                {reflections[prompt.id]
                                  ? reflections[prompt.id]
                                  : '(No notes yet)'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button onClick={handleDownloadPdf}>Download PDF</Button>
                      <Button variant="outline" onClick={handleReset}>
                        Start again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isComplete && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why this rating?</CardTitle>
                  <CardDescription>
                    Capture any thoughts you want to revisit with your coach
                    later. This can be edited at the end of the exercise.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    rows={4}
                    placeholder="What feels satisfying here? What feels like it needs attention?"
                    value={reflections[activeCategory.id] ?? ''}
                    onChange={(event) =>
                      handleReflectionChange(
                        activeCategory.id,
                        event.target.value
                      )
                    }
                  />
                </CardContent>
              </Card>
            )}

            {isComplete && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Deepen your reflection
                  </CardTitle>
                  <CardDescription>
                    Note down your answers and discuss these with your career
                    coach.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reflectivePrompts.map((prompt) => (
                    <div key={prompt.id}>
                      <p className="text-md font-semibold text-slate-700">
                        {prompt.question}
                      </p>
                      <Textarea
                        className="mt-2"
                        value={reflections[prompt.id] ?? ''}
                        onChange={(event) =>
                          handleReflectionChange(prompt.id, event.target.value)
                        }
                        placeholder="Write your thoughts here..."
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {!isComplete && (
            <aside className="flex w-full flex-col gap-6 self-stretch lg:sticky lg:top-8">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Wheel preview</CardTitle>
                  <CardDescription>
                    See how your wheel is shaping up as you work through each
                    area.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pt-6">
                  <WheelChart
                    categories={categories}
                    scores={scores}
                    size={chartSize}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </aside>
          )}
        </section>
      </div>
    </div>
  );
}
