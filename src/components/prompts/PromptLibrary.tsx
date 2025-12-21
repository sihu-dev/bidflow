'use client';

/**
 * @component PromptLibrary
 * @description AI 프롬프트 템플릿 라이브러리 UI
 */

import { useState, useCallback, useMemo } from 'react';
import { Sparkles, Search, ChevronRight, Copy, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  SYSTEM_TEMPLATES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type PromptTemplate,
  type PromptCategory,
} from '@/lib/prompts/templates';
import { interpolate, type PromptContext } from '@/lib/prompts/engine';

// ============================================================================
// 타입 정의
// ============================================================================

interface PromptLibraryProps {
  context?: PromptContext;
  onExecute?: (prompt: string, templateId: string) => void;
  triggerButton?: React.ReactNode;
}

// ============================================================================
// 프롬프트 카드 컴포넌트
// ============================================================================

interface PromptCardProps {
  template: PromptTemplate;
  onSelect: (template: PromptTemplate) => void;
}

function PromptCard({ template, onSelect }: PromptCardProps) {
  return (
    <button
      onClick={() => onSelect(template)}
      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{template.icon || CATEGORY_ICONS[template.category]}</span>
            <h4 className="font-medium text-sm truncate">{template.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {template.description}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
      </div>
    </button>
  );
}

// ============================================================================
// 프롬프트 실행 다이얼로그
// ============================================================================

interface ExecuteDialogProps {
  template: PromptTemplate | null;
  context: PromptContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (prompt: string) => void;
}

function ExecuteDialog({
  template,
  context,
  open,
  onOpenChange,
  onExecute,
}: ExecuteDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // 변수 입력 처리
  const handleVariableChange = useCallback(
    (name: string, value: string) => {
      setVariables((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // 프롬프트 생성
  const handleGenerate = useCallback(() => {
    if (!template) return;

    const mergedContext = { ...context, ...variables };
    const result = interpolate(template.prompt, mergedContext, template.variables);
    setGeneratedPrompt(result.prompt);
  }, [template, context, variables]);

  // 실행
  const handleExecute = useCallback(() => {
    if (generatedPrompt) {
      onExecute(generatedPrompt);
      onOpenChange(false);
    }
  }, [generatedPrompt, onExecute, onOpenChange]);

  // 클립보드 복사
  const handleCopy = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
    }
  }, [generatedPrompt]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{template.icon || CATEGORY_ICONS[template.category]}</span>
            {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* 변수 입력 */}
          {template.variables.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">변수 입력</h4>
              {template.variables.map((v) => (
                <div key={v.name} className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    {v.description || v.name}
                    {v.required && <span className="text-neutral-600 ml-1">*</span>}
                  </label>
                  <Input
                    placeholder={v.default || `{{${v.name}}}`}
                    value={variables[v.name] || context[v.name]?.toString() || ''}
                    onChange={(e) => handleVariableChange(v.name, e.target.value)}
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                프롬프트 생성
              </Button>
            </div>
          )}

          {/* 생성된 프롬프트 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">생성된 프롬프트</h4>
              {generatedPrompt && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-1" />
                  복사
                </Button>
              )}
            </div>
            <Textarea
              value={generatedPrompt || template.prompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="변수를 입력하고 '프롬프트 생성'을 클릭하세요"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleExecute} disabled={!generatedPrompt}>
            <Play className="w-4 h-4 mr-1" />
            AI 실행
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export function PromptLibrary({
  context = {},
  onExecute,
  triggerButton,
}: PromptLibraryProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);

  // 필터링된 템플릿
  const filteredTemplates = useMemo(() => {
    let templates = SYSTEM_TEMPLATES;

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  // 템플릿 선택
  const handleSelectTemplate = useCallback((template: PromptTemplate) => {
    setSelectedTemplate(template);
    setExecuteDialogOpen(true);
  }, []);

  // 프롬프트 실행
  const handleExecute = useCallback(
    (prompt: string) => {
      if (onExecute && selectedTemplate) {
        onExecute(prompt, selectedTemplate.id);
      }
    },
    [onExecute, selectedTemplate]
  );

  const categories: (PromptCategory | 'all')[] = [
    'all',
    'analysis',
    'pricing',
    'proposal',
    'matching',
    'summary',
    'translation',
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {triggerButton || (
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="w-4 h-4" />
              AI 템플릿
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="w-full sm:w-[420px] sm:max-w-[90vw] p-0 flex flex-col">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              프롬프트 라이브러리
            </SheetTitle>
            <SheetDescription>
              AI 분석, 제안서 작성, 번역 등 다양한 템플릿
            </SheetDescription>
          </SheetHeader>

          {/* 검색 */}
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="템플릿 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* 카테고리 탭 */}
          <Tabs
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as PromptCategory | 'all')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="mx-4 h-auto flex-wrap gap-1 bg-transparent justify-start">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat === 'all' ? '전체' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>템플릿을 찾을 수 없습니다</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <PromptCard
                        key={template.id}
                        template={template}
                        onSelect={handleSelectTemplate}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* 하단 안내 */}
          <div className="p-4 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground">
              💡 템플릿을 선택하면 변수를 입력하고 AI를 실행할 수 있습니다
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* 실행 다이얼로그 */}
      <ExecuteDialog
        template={selectedTemplate}
        context={context}
        open={executeDialogOpen}
        onOpenChange={setExecuteDialogOpen}
        onExecute={handleExecute}
      />
    </>
  );
}

export default PromptLibrary;
