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
        width >= 1024
          ? 360
          : width <= 640
          ? Math.max(220, Math.min(300, width - 96))
          : Math.max(240, Math.min(320, width - 80));
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
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    const textRightPadding = 48;
    const chartHorizontalPadding = 60;

    const chartElement = exportChartRef.current;
    let chartImageData: {
      dataUrl: string;
      width: number;
      height: number;
    } | null = null;

    if (chartElement) {
      try {
        const bbox = chartElement.getBBox();
        const basePadding = Math.max(28, chartSize * 0.14);
        const horizontalPadding = {
          left: basePadding,
          right: basePadding * 1.75,
        };
        const verticalPadding = {
          top: basePadding,
          bottom: basePadding,
        };
        const exportWidth =
          bbox.width + horizontalPadding.left + horizontalPadding.right;
        const exportHeight =
          bbox.height + verticalPadding.top + verticalPadding.bottom;

        const svgClone = chartElement.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svgClone.setAttribute('width', `${exportWidth}`);
        svgClone.setAttribute('height', `${exportHeight}`);
        svgClone.setAttribute(
          'viewBox',
          `${bbox.x - horizontalPadding.left} ${
            bbox.y - verticalPadding.top
          } ${exportWidth} ${exportHeight}`
        );

        svgClone
          .querySelectorAll('tspan')
          .forEach((node) => {
            if (node.textContent === 'R/ships') {
              node.textContent = 'Relationships';
            }
          });

        svgClone
          .querySelectorAll<SVGTextElement>('text[font-weight="600"]')
          .forEach((node) => {
            const fontSizeAttr = node.getAttribute('font-size');
            const baseFontSize = fontSizeAttr
              ? Number.parseFloat(fontSizeAttr)
              : Number.NaN;
            const resolvedSize = Number.isNaN(baseFontSize) ? 14 : baseFontSize;
            const reduced = Math.max(
              10,
              Number.parseFloat((resolvedSize * 0.9).toFixed(2)),
            );
            node.setAttribute('font-size', String(reduced));
          });

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        chartImageData = await new Promise<{
          dataUrl: string;
          width: number;
          height: number;
        }>((resolve, reject) => {
          const img = new Image();
          const scaleFactor = 2.8;
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(exportWidth * scaleFactor);
            canvas.height = Math.round(exportHeight * scaleFactor);
            const context = canvas.getContext('2d');
            if (!context) {
              reject(new Error('Canvas context not available'));
              URL.revokeObjectURL(svgUrl);
              return;
            }
            context.scale(scaleFactor, scaleFactor);
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, exportWidth, exportHeight);
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.drawImage(img, 0, 0, exportWidth, exportHeight);
            URL.revokeObjectURL(svgUrl);
            resolve({
              dataUrl: canvas.toDataURL('image/png'),
              width: exportWidth,
              height: exportHeight,
            });
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
    const completedOn = new Date();
    const formattedDate = completedOn.toLocaleDateString('en-GB');
    pdf.text(`Completed on ${formattedDate}`, margin, margin + 34);

    let cursorY = margin + 78;

    if (chartImageData) {
      const desiredWidth = Math.min(
        Math.max(contentWidth - chartHorizontalPadding, 240),
        560,
      );
      const scale = desiredWidth / chartImageData.width;
      const chartWidth = chartImageData.width * scale;
      const chartHeight = chartImageData.height * scale;
      const chartX = margin + (contentWidth - chartWidth) / 2;
      pdf.addImage(
        chartImageData.dataUrl,
        'PNG',
        chartX,
        cursorY,
        chartWidth,
        chartHeight
      );

      cursorY += chartHeight + 40;
    }

    const maxLineWidth = Math.max(contentWidth - textRightPadding, 280);
    const addScoresNotesHeading = (title: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(title, margin, cursorY);
      cursorY += 26;
    };

    addScoresNotesHeading('Scores & notes');

    const labelSpacing = 14;
    const scoreSpacing = 10;
    const noteLineHeight = 14;
    const noteGap = 10;
    const blockSpacing = 14;
    const bodyFontSize = 11.5;

    categories.forEach((category, index) => {
      const scoreValue = scores[category.id] ?? 0;
      const rawNote = reflections[category.id] ?? '';
      const trimmedNote = rawNote.trim();
      const hasNote = trimmedNote.length > 0;
      const noteLines = hasNote
        ? pdf.splitTextToSize(trimmedNote, maxLineWidth)
        : [];
      const noteHeight = hasNote ? noteLines.length * noteLineHeight : 0;
      const noteSpacing = hasNote ? noteGap : 0;
      const trailingSpacing = index < categories.length - 1 ? blockSpacing : 0;
      const entryHeight =
        labelSpacing + scoreSpacing + noteSpacing + noteHeight + trailingSpacing;

      if (cursorY + entryHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
        addScoresNotesHeading('Scores & notes (cont.)');
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`${category.label}`, margin, cursorY);
      cursorY += labelSpacing;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(bodyFontSize);
      pdf.text(`Score: ${scoreValue}/10`, margin, cursorY);
      cursorY += scoreSpacing;

      if (hasNote) {
        cursorY += noteSpacing;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(bodyFontSize);
        pdf.text(noteLines, margin, cursorY);
        cursorY += noteHeight;
      }

      cursorY += trailingSpacing;
    });

    cursorY += 32;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Reflection prompts', margin, cursorY);
    cursorY += 22;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(bodyFontSize);

    const promptLineHeight = 16;
    const promptGap = 16;

    reflectivePrompts.forEach((prompt) => {
      const answer = reflections[prompt.id]?.trim() || '(No notes yet)';
      const questionLines = pdf.splitTextToSize(prompt.question, maxLineWidth);
      const answerLines = pdf.splitTextToSize(answer, maxLineWidth);
      const estimatedHeight =
        questionLines.length * promptLineHeight +
        answerLines.length * promptLineHeight +
        promptGap;

      if (cursorY + estimatedHeight > pageHeight - margin) {
        pdf.addPage();
        cursorY = margin;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(bodyFontSize);
      pdf.text(questionLines, margin, cursorY);
      cursorY += questionLines.length * promptLineHeight;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(bodyFontSize);
      pdf.text(answerLines, margin, cursorY);
      cursorY += answerLines.length * promptLineHeight + promptGap;
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 ">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="sm:text-4xl text-3xl font-semibold uppercase tracking-[0.2em] text-slate-500">
            Wheel of Life
          </h1>

          {!isComplete && (
            <p className="mx-auto max-w-4xl py-4 text-md text-slate-600 sm:text-lg">
              Completing this exercise gives you a foundation on which to build
              and grow. Take a moment to rate how satisfied you are in each area,
              notice what feels out of balance, and capture the next steps you
              would like to take. A PDF report will be available to download once
              you complete the exercise.
            </p>
          )}
        </header>

        <section
          className={cn(
            'flex flex-col gap-8',
            !isComplete && 'lg:grid lg:grid-cols-[1.00fr_1fr] lg:items-start'
          )}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader className="relative pb-0 lg:pr-48">
                <CardDescription className="text-xs font-medium uppercase text-slate-500">
                  {isComplete
                    ? ''
                    : 'Step ' + (step + 1) + ' of ' + categories.length}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {isComplete
                    ? 'Review your Wheel of Life'
                    : activeCategory.label}
                </CardTitle>
                {!isComplete && (
                  <CardDescription className="text-slate-600">
                    {activeCategory.description}
                  </CardDescription>
                )}
                {isComplete && (
                  <div className="hidden gap-3 lg:absolute lg:right-6 lg:top-6 lg:flex">
                    <Button onClick={handleDownloadPdf}>Download PDF</Button>
                    <Button variant="outline" onClick={handleReset}>
                      Start again
                    </Button>
                  </div>
                )}
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
                    <div className="flex flex-wrap items-center gap-3 lg:hidden">
                      <Button onClick={handleDownloadPdf}>Download PDF</Button>
                      <Button variant="outline" onClick={handleReset}>
                        Start again
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                          Wheel overview
                        </h2>
                        <div className="mt-4 flex flex-col items-center gap-5 sm:gap-10">
                          <div className="mx-auto w-full max-w-[460px] px-2 sm:px-0">
                            <WheelChart
                              categories={categories}
                              scores={scores}
                              size={Math.min(420, chartSize + (chartSize < 320 ? 20 : 60))}
                              className="w-full"
                              svgRef={exportChartRef}
                              labelOverrides={{
                                personal_growth: ['Personal', 'Growth'],
                                relationships: ['R/ships'],
                              }}
                            />
                          </div>
                          <ul className="w-full max-w-[520px] space-y-3 text-md sm:text-lg text-slate-600">
                            {categories.map((category) => {
                              const note = (
                                reflections[category.id] ?? ''
                              ).trim();
                              return (
                                <li
                                  key={category.id}
                                  className="rounded-lg bg-white px-4 py-3 shadow-sm"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="sm:max-w-[70%]">
                                    <p className="sm:text-lg text-md  text-slate-700">
                                        {category.label}
                                      </p>
                                    </div>
                                    <span className="sm:text-lg text-md  text-slate-900 sm:pl-4">
                                      {scores[category.id] ?? 0}/10
                                    </span>
                                  </div>
                                  {note && (
                                    <p className="mt-1 whitespace-pre-wrap text-md sm:text-lg text-slate-600 leading-relaxed">
                                      {note}
                                    </p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-lg sm:text-xl font-semibold text-slate-800">
                          Reflection prompts
                        </div>
                        <div className="mt-3 space-y-4 text-md sm:text-lg text-slate-600 ">
                          {reflectivePrompts.map((prompt) => (
                            <div key={prompt.id}>
                              <p className="font-bold text-slate-700 ">
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
                  </div>
                )}
              </CardContent>
            </Card>

            {!isComplete && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why this rating? </CardTitle>
                  <CardDescription className="pb-2">
                    Capture any thoughts you want to revisit with your coach
                    later. (Optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label
                    htmlFor={`notes-${activeCategory.id}`}
                    className="mb-2 flex items-baseline justify-between text-sm font-medium text-slate-700"
                  >
                  
            
                  </label>
                  <Textarea
                    id={`notes-${activeCategory.id}`}
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
                      <p className="text-md sm:text-lg font-semibold text-slate-700">
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
            <aside className="order-first flex w-full flex-col gap-6 self-stretch lg:order-0 lg:sticky lg:top-8">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg sm:text-xl">Wheel preview</CardTitle>
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
