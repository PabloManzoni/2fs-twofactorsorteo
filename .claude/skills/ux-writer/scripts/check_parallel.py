#!/usr/bin/env python3
"""
check_parallel.py — verify a set of locale JSON files share the same key tree
and the same interpolation tokens per key, and that every value is a non-empty
string.

Usage:
    python check_parallel.py path/to/es.json path/to/en.json [...]

Exit code 0 means clean. Non-zero means problems were printed to stdout.

The tool is library-agnostic about interpolation syntax. It matches:
    {{name}}       (i18next / mustache)
    {name}         (react-intl / FormatJS / python format)
    %(name)s, %s   (printf / python-c)
    ${name}        (template literals)

It compares the *set* of tokens per key across locales — order is allowed to
change (different languages reorder naturally), but a missing token in one
locale is reported.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

TOKEN_PATTERNS = [
    re.compile(r"\{\{[^{}]+\}\}"),       # {{name}}
    re.compile(r"\{[^{}]+\}"),           # {name}
    re.compile(r"%\([^)]+\)[sd]"),       # %(name)s
    re.compile(r"%[sd]"),                # %s, %d
    re.compile(r"\$\{[^}]+\}"),          # ${name}
]


def extract_tokens(value: str) -> set[str]:
    tokens: set[str] = set()
    for pat in TOKEN_PATTERNS:
        tokens.update(pat.findall(value))
    return tokens


def flatten(obj: Any, prefix: str = "") -> dict[str, Any]:
    """Flatten a nested dict using dotted keys."""
    out: dict[str, Any] = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            out.update(flatten(v, key))
    else:
        out[prefix] = obj
    return out


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("usage: check_parallel.py file1.json file2.json [...]", file=sys.stderr)
        return 2

    paths = [Path(p) for p in argv[1:]]
    locales: dict[str, dict[str, Any]] = {}
    for p in paths:
        if not p.is_file():
            print(f"x not a file: {p}")
            return 1
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"x JSON parse error in {p}: {e}")
            return 1
        locales[str(p)] = flatten(data)

    problems: list[str] = []

    # 1. Same key set across all locales.
    locale_names = list(locales.keys())
    base = locale_names[0]
    base_keys = set(locales[base].keys())
    for other in locale_names[1:]:
        other_keys = set(locales[other].keys())
        missing_in_other = sorted(base_keys - other_keys)
        extra_in_other = sorted(other_keys - base_keys)
        for k in missing_in_other:
            problems.append(f"key '{k}' present in {base} but missing in {other}")
        for k in extra_in_other:
            problems.append(f"key '{k}' present in {other} but missing in {base}")

    common_keys = set.intersection(*(set(loc.keys()) for loc in locales.values()))

    # 2. Same token set per key across locales.
    for key in sorted(common_keys):
        token_sets: dict[str, set[str]] = {}
        for loc_name, loc_data in locales.items():
            val = loc_data[key]
            if not isinstance(val, str):
                problems.append(
                    f"non-string value at '{key}' in {loc_name}: {type(val).__name__}"
                )
                continue
            if not val.strip():
                problems.append(f"empty string at '{key}' in {loc_name}")
            token_sets[loc_name] = extract_tokens(val)
        if not token_sets:
            continue
        ref_loc, ref_tokens = next(iter(token_sets.items()))
        for loc_name, tokens in token_sets.items():
            if loc_name == ref_loc:
                continue
            if tokens != ref_tokens:
                missing = ref_tokens - tokens
                extra = tokens - ref_tokens
                if missing:
                    problems.append(
                        f"key '{key}': {loc_name} is missing tokens {sorted(missing)} "
                        f"(present in {ref_loc})"
                    )
                if extra:
                    problems.append(
                        f"key '{key}': {loc_name} has extra tokens {sorted(extra)} "
                        f"(not in {ref_loc})"
                    )

    if problems:
        print(f"x {len(problems)} problem(s) found:")
        print("")
        for p in problems:
            print(f"  - {p}")
        return 1

    total_keys = len(common_keys)
    print(f"ok: {total_keys} keys consistent across {len(locales)} locale file(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
