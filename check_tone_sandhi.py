#!/usr/bin/env python3
"""
Check tone sandhi rules for 一 (yī/yí/yì) and 不 (bù/bú) in HSK lesson JSON files.

Rules:
  一: before tone 4 → yí; before tone 1/2/3 → yì; isolated/ordinal/in compounds → yī
  不: before tone 4 → bú; otherwise → bù
"""

import json
import os
import re
import sys

# Tone diacritics
TONE1 = set('āēīōūǖ')
TONE2 = set('áéíóúǘ')
TONE3 = set('ǎěǐǒǔǚ')
TONE4 = set('àèìòùǜ')

def get_tone(syllable):
    """Return the tone number (1-4) or 0 (neutral) of a pinyin syllable."""
    syl = syllable.lower()
    for ch in syl:
        if ch in TONE1:
            return 1
        if ch in TONE2:
            return 2
        if ch in TONE3:
            return 3
        if ch in TONE4:
            return 4
    return 0  # neutral / no diacritic

def split_pinyin(pinyin_str):
    """
    Split a pinyin string into individual syllable tokens,
    preserving punctuation/spaces as non-syllable tokens.
    Returns list of (token, is_syllable).
    """
    # Match pinyin syllables (with optional diacritics) or non-syllable chars
    # A syllable is a sequence of letters possibly containing diacritic characters
    pattern = re.compile(r"[a-zA-ZāēīōūǖáéíóúǘǎěǐǒǔǚàèìòùǜÂÊÎÔÛāēīōūǖ]+")
    tokens = []
    last = 0
    for m in pattern.finditer(pinyin_str):
        if m.start() > last:
            tokens.append((pinyin_str[last:m.start()], False))
        tokens.append((m.group(), True))
        last = m.end()
    if last < len(pinyin_str):
        tokens.append((pinyin_str[last:], False))
    return tokens

def normalize_yi(syl):
    """Return the base form of a 一 syllable."""
    s = syl.lower()
    if s in ('yī', 'yí', 'yì', 'yi'):
        return 'yi'
    return None

def normalize_bu(syl):
    """Return the base form of a 不 syllable."""
    s = syl.lower()
    if s in ('bù', 'bú', 'bu'):
        return 'bu'
    return None

def check_pinyin_string(pinyin_str):
    """
    Check a pinyin string for tone sandhi violations.
    Returns list of (found, expected, position_info) tuples.
    """
    issues = []
    tokens = split_pinyin(pinyin_str)
    syllables = [(i, tok) for i, (tok, is_syl) in enumerate(tokens) if is_syl]

    for pos, (idx, syl) in enumerate(syllables):
        syl_lower = syl.lower()

        # Check 一
        if normalize_yi(syl_lower) == 'yi':
            if pos + 1 < len(syllables):
                next_syl = syllables[pos + 1][1]
                next_tone = get_tone(next_syl)
                if next_tone == 4:
                    expected = 'yí'
                elif next_tone in (1, 2, 3):
                    expected = 'yì'
                elif next_tone == 0:
                    expected = 'yī'  # neutral: treat as standalone
                else:
                    expected = 'yī'

                if syl_lower != expected:
                    issues.append({
                        'found': syl,
                        'expected': expected,
                        'next_syllable': next_syl,
                        'next_tone': next_tone,
                        'type': '一'
                    })
            else:
                # Last syllable — should be yī (isolated/ordinal)
                if syl_lower not in ('yī', 'yi'):
                    issues.append({
                        'found': syl,
                        'expected': 'yī',
                        'next_syllable': None,
                        'next_tone': None,
                        'type': '一 (final/isolated)'
                    })

        # Check 不
        elif normalize_bu(syl_lower) == 'bu':
            if pos + 1 < len(syllables):
                next_syl = syllables[pos + 1][1]
                next_tone = get_tone(next_syl)
                if next_tone == 4:
                    expected = 'bú'
                else:
                    expected = 'bù'

                if syl_lower != expected:
                    issues.append({
                        'found': syl,
                        'expected': expected,
                        'next_syllable': next_syl,
                        'next_tone': next_tone,
                        'type': '不'
                    })
            else:
                # Last syllable — should be bù
                if syl_lower not in ('bù', 'bu'):
                    issues.append({
                        'found': syl,
                        'expected': 'bù',
                        'next_syllable': None,
                        'next_tone': None,
                        'type': '不 (final/isolated)'
                    })

    return issues

def extract_pinyin_fields(obj, path=''):
    """
    Recursively extract all string values from the JSON object
    that look like pinyin (contain diacritic chars or match pinyin patterns).
    Yields (field_path, value).
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from extract_pinyin_fields(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from extract_pinyin_fields(v, f"{path}[{i}]")
    elif isinstance(obj, str):
        # Heuristic: contains typical pinyin diacritics or field name suggests pinyin
        has_diacritic = bool(re.search(r'[āēīōūǖáéíóúǘǎěǐǒǔǚàèìòùǜ]', obj))
        # Also check: field path ends with 'pinyin' or contains tone chars
        field_lower = path.lower()
        is_pinyin_field = 'pinyin' in field_lower
        if has_diacritic or is_pinyin_field:
            yield (path, obj)

def check_file(filepath):
    """Check a single JSON file. Returns list of issues."""
    issues = []
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"  ERROR: Could not parse {filepath}: {e}", file=sys.stderr)
            return []

    for field_path, pinyin_str in extract_pinyin_fields(data):
        field_issues = check_pinyin_string(pinyin_str)
        for issue in field_issues:
            issues.append({
                'file': filepath,
                'field': field_path,
                'pinyin_string': pinyin_str,
                **issue
            })
    return issues

def main():
    base = '/Users/irisvitalee/ChineseApp/data'
    folders = ['hsk3', 'hsk4_level4', 'hsk4_level5']
    # hsk5 folder doesn't exist, skip

    all_issues = []
    files_checked = 0

    for folder in folders:
        folder_path = os.path.join(base, folder)
        if not os.path.isdir(folder_path):
            print(f"Skipping (not found): {folder_path}")
            continue
        json_files = sorted([
            os.path.join(folder_path, f)
            for f in os.listdir(folder_path)
            if f.endswith('.json')
        ])
        print(f"\n=== {folder} ({len(json_files)} files) ===")
        for jf in json_files:
            issues = check_file(jf)
            files_checked += 1
            if issues:
                print(f"  {os.path.basename(jf)}: {len(issues)} issue(s)")
            all_issues.extend(issues)

    print(f"\n\n{'='*70}")
    print(f"TOTAL: {files_checked} files checked, {len(all_issues)} sandhi issues found")
    print(f"{'='*70}\n")

    if not all_issues:
        print("No tone sandhi issues found.")
        return

    # Group by file
    from collections import defaultdict
    by_file = defaultdict(list)
    for issue in all_issues:
        by_file[issue['file']].append(issue)

    for filepath, file_issues in sorted(by_file.items()):
        print(f"\nFILE: {os.path.relpath(filepath, base)}")
        print(f"  {len(file_issues)} issue(s):")
        for iss in file_issues:
            next_info = f"(before '{iss['next_syllable']}', tone {iss['next_tone']})" if iss['next_syllable'] else "(final/isolated)"
            print(f"    [{iss['type']}] Field: {iss['field']}")
            print(f"      Pinyin: {iss['pinyin_string']}")
            print(f"      Found: '{iss['found']}' → Expected: '{iss['expected']}' {next_info}")

if __name__ == '__main__':
    main()
