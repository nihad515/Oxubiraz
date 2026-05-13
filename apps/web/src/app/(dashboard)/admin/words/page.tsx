'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Upload, X, Tag } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { toast } from 'sonner';

const listSchema = z.object({
  name: z.string().min(2),
  language: z.enum(['az', 'ru', 'en']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().optional(),
});

type ListForm = z.infer<typeof listSchema>;

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const LANG_LABELS: Record<string, string> = { az: 'AZ', ru: 'RU', en: 'EN' };

interface WordList {
  id: number;
  name: string;
  language: string;
  difficulty: string;
  description?: string;
  word_count: number;
}

interface Word {
  id: number;
  word: string;
  frequency?: number;
}

function WordListWords({ listId }: { listId: number }) {
  const { t } = useString();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState('');

  const { data: words, isLoading } = useQuery({
    queryKey: ['word-list-words', listId],
    queryFn: () => apiClient.get(API.words.items(listId)),
    select: (d: any) => d.data,
  });

  const addMutation = useMutation({
    mutationFn: (word: string) => apiClient.post(API.words.createItem(listId), { words: [word] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-list-words', listId] });
      queryClient.invalidateQueries({ queryKey: ['word-lists'] });
      setNewWord('');
      toast.success(t('words.word_added', {}, 'Word added'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (wordId: number) => apiClient.delete(API.words.deleteItem(listId, wordId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-list-words', listId] });
      queryClient.invalidateQueries({ queryKey: ['word-lists'] });
    },
  });

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWord.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <form onSubmit={handleAddWord} className="flex gap-2">
        <Input
          placeholder={t('words.new_word_placeholder', {}, 'Add a word...')}
          value={newWord}
          onChange={e => setNewWord(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" disabled={addMutation.isPending || !newWord.trim()}>
          <Plus size={14} className="mr-1" />
          {t('common.add', {}, 'Add')}
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
        </div>
      ) : !words?.length ? (
        <p className="text-sm text-muted-foreground">{t('words.no_words', {}, 'No words yet. Add some above.')}</p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
          {words.map((w: Word) => (
            <div
              key={w.id}
              className="flex items-center gap-1 rounded-full border bg-muted/40 px-3 py-1 text-sm"
            >
              {w.word}
              <button
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => removeMutation.mutate(w.id)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminWordsPage() {
  const { t } = useString();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterLang, setFilterLang] = useState<string>('all');

  const { data: lists, isLoading } = useQuery({
    queryKey: ['word-lists', filterLang],
    queryFn: () => apiClient.get(`${API.words.lists}${filterLang !== 'all' ? `?language=${filterLang}` : ''}`),
    select: (d: any) => d.data,
  });

  const form = useForm<ListForm>({
    resolver: zodResolver(listSchema),
    defaultValues: { name: '', language: 'az', difficulty: 'beginner', description: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data: ListForm) => apiClient.post(API.words.createList, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-lists'] });
      form.reset();
      setShowForm(false);
      toast.success(t('words.list_created', {}, 'Word list created'));
    },
    onError: () => toast.error(t('common.error', {}, 'Something went wrong')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.words.deleteList(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-lists'] });
      toast.success(t('words.list_deleted', {}, 'Word list deleted'));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={24} />
            {t('nav.words', {}, 'Word Lists')}
          </h1>
          <p className="text-muted-foreground">{t('admin.words_desc', {}, 'Manage word lists used in reading exercises.')}</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus size={16} className="mr-2" />
          {t('words.new_list', {}, 'New List')}
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <CardHeader><CardTitle className="text-base">{t('words.new_list', {}, 'New Word List')}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-3 space-y-1.5">
                      <Label>{t('words.list_name', {}, 'List Name')}</Label>
                      <Input {...form.register('name')} placeholder={t('words.list_name_placeholder', {}, 'e.g. Beginner Azerbaijani')} />
                      {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('common.language', {}, 'Language')}</Label>
                      <Select defaultValue="az" onValueChange={v => form.setValue('language', v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="az">Azərbaycan</SelectItem>
                          <SelectItem value="ru">Русский</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('words.difficulty', {}, 'Difficulty')}</Label>
                      <Select defaultValue="beginner" onValueChange={v => form.setValue('difficulty', v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{t('words.beginner', {}, 'Beginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('words.intermediate', {}, 'Intermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('words.advanced', {}, 'Advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t('common.description', {}, 'Description')}</Label>
                      <Input {...form.register('description')} placeholder={t('common.optional', {}, 'Optional')} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel', {}, 'Cancel')}</Button>
                    <Button type="submit" disabled={createMutation.isPending}>{t('common.create', {}, 'Create')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'az', 'ru', 'en'].map(lang => (
          <Button
            key={lang}
            size="sm"
            variant={filterLang === lang ? 'default' : 'outline'}
            onClick={() => setFilterLang(lang)}
          >
            {lang === 'all' ? t('common.all', {}, 'All') : LANG_LABELS[lang]}
          </Button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !lists?.length ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t('words.no_lists', {}, 'No word lists found.')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lists.map((list: WordList, i: number) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div>
                        <div className="font-semibold">{list.name}</div>
                        {list.description && <div className="text-xs text-muted-foreground mt-0.5">{list.description}</div>}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">{LANG_LABELS[list.language] ?? list.language}</Badge>
                          <Badge variant="outline" className={`text-xs ${DIFFICULTY_COLORS[list.difficulty] ?? ''}`}>
                            {t(`words.${list.difficulty}`, {}, list.difficulty)}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag size={11} />
                            {list.word_count} {t('words.words', {}, 'words')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(expandedId === list.id ? null : list.id)}
                      >
                        {expandedId === list.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {t('words.manage_words', {}, 'Words')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('words.delete_list_title', {}, 'Delete Word List?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('words.delete_list_desc', {}, 'This will permanently delete the list and all its words.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel', {}, 'Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(list.id)}
                            >
                              {t('common.delete', {}, 'Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {expandedId === list.id && <WordListWords listId={list.id} />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
