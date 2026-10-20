import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCollegePrompt,
  clampVariantsCount,
  DEFAULT_FORM_STATE,
  parseDomainsList,
} from './promptBuilder.ts';

test('parseDomainsList splits comma and semicolon separated domains accurately', () => {
  const result = parseDomainsList('Кофейня, прокат самокатов в Алматы; курьерская доставка');
  assert.deepEqual(result, [
    'Кофейня',
    'прокат самокатов в Алматы',
    'курьерская доставка',
  ]);
});

test('clampVariantsCount bounds variant counts between 1 and 10', () => {
  assert.equal(clampVariantsCount(0), 1);
  assert.equal(clampVariantsCount(-5), 1);
  assert.equal(clampVariantsCount(4), 4);
  assert.equal(clampVariantsCount(15), 10);
});

test('buildCollegePrompt includes role, parameters, domains, all 4 optional sections, and constraints by default', () => {
  const prompt = buildCollegePrompt(DEFAULT_FORM_STATE);
  assert.match(prompt, /преподаватель-методист профильных IT-дисциплин в техническом колледже/);
  assert.match(prompt, /Дисциплина: Объектно-ориентированное программирование/);
  assert.match(prompt, /Курс обучения: 2 курс колледжа/);
  assert.match(prompt, /Язык программирования: C#/);
  assert.match(prompt, /Уровень сложности: Средний/);
  assert.match(prompt, /Вариант №1: предметная область «Кофейня»/);
  assert.match(prompt, /Вариант №2: предметная область «прокат самокатов в Алматы»/);
  assert.match(prompt, /Вариант №3: предметная область «курьерская доставка»/);
  assert.match(prompt, /СТАРТОВЫЙ КОД С TODO И НАМЕРЕННОЙ СКРЫТОЙ ОШИБКОЙ/);
  assert.match(prompt, /НАБОР ТЕСТОВ И ВХОДНЫХ ДАННЫХ/);
  assert.match(prompt, /ВОПРОСЫ ДЛЯ УСТНОЙ ЗАЩИТЫ КОДА/);
  assert.match(prompt, /УНИВЕРСАЛЬНАЯ РУБРИКА ОЦЕНИВАНИЯ НА 10 БАЛЛОВ/);
  assert.match(prompt, /НЕ давай студентам готовое полное решение задачи/);
  assert.match(prompt, /НЕ используй реальные персональные данные/);
});

test('buildCollegePrompt omits unchecked optional blocks and handles custom language', () => {
  const customState = {
    ...DEFAULT_FORM_STATE,
    language: 'Другой',
    customLanguage: 'TypeScript',
    difficulty: 'Повышенный' as const,
    variantsCount: 5,
    options: {
      starterCodeWithBug: false,
      testCases: true,
      defenseQuestions: false,
      gradingRubric: true,
    },
  };
  const prompt = buildCollegePrompt(customState);
  assert.match(prompt, /Язык программирования: TypeScript/);
  assert.match(prompt, /Уровень сложности: Повышенный/);
  assert.match(prompt, /Вариант №5:/);
  assert.doesNotMatch(prompt, /СТАРТОВЫЙ КОД С TODO И НАМЕРЕННОЙ СКРЫТОЙ ОШИБКОЙ/);
  assert.doesNotMatch(prompt, /ВОПРОСЫ ДЛЯ УСТНОЙ ЗАЩИТЫ КОДА/);
  assert.match(prompt, /НАБОР ТЕСТОВ И ВХОДНЫХ ДАННЫХ/);
  assert.match(prompt, /УНИВЕРСАЛЬНАЯ РУБРИКА ОЦЕНИВАНИЯ НА 10 БАЛЛОВ/);
});
