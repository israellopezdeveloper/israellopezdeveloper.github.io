# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple, Union

from bs4 import BeautifulSoup

# --------------------------------------------------------------------------
# 1) EXCLUSIÓN POR RUTAS (con comodín [] para índices de lista)
# --------------------------------------------------------------------------

_ANY = object()  # comodín para índices de lista


@dataclass(frozen=True)
class _PathSpec:
    parts: tuple[Union[str, object], ...]


def _parse_path_spec(spec: str) -> _PathSpec:
    parts: List[Union[str, object]] = []
    for token in spec.split("."):
        if token.endswith("[]"):
            key = token[:-2]
            if key:
                parts.append(key)
            parts.append(_ANY)
        else:
            parts.append(token)
    return _PathSpec(tuple(parts))


def _match_path(spec: _PathSpec, path: Sequence[Union[str, int]]) -> bool:
    i = 0
    for part in spec.parts:
        if part is _ANY:
            if i >= len(path) or not isinstance(path[i], int):
                return False
            i += 1
        else:
            if i >= len(path) or path[i] != part:
                return False
            i += 1
    return i == len(path)


def _is_excluded_path(
    path: Sequence[Union[str, int]], patterns: tuple[_PathSpec, ...]
) -> bool:
    return any(_match_path(p, path) for p in patterns)


# RUTAS QUE NUNCA SE DEBEN RESUMIR (nombres, urls, iconos, imágenes, etc.)
EXCLUDE_PATHS = [
    # —— Perfil / Intro (ambos esquemas) ——
    "intro.name",
    "intro.profile_image",
    "intro.links[].icon",
    "intro.links[].url",
    "intro.links[].text",
    # —— Works ——
    "works[].name",
    "works[].title",
    "works[].thumbnail",
    "works[].period_time",
    "works[].links[].icon",
    "works[].links[].url",
    "works[].links[].text",
    "works[].projects[].links[].url",
    "works[].projects[].links[].icon",
    "works[].projects[].links[].text",
    "works[].projects[].technologies[]",
    "works[].technologies[]",
    "works[].images[]",
    # —— Educations (tu esquema tiene objeto con 3 listas) ——
    "educations.university[].images[]",
    "educations.university[].thumbnail",
    "educations.university[].university_name",
    "educations.university[].title",
    "educations.university[].period_time",
    "educations.complementary[].images[]",
    "educations.complementary[].thumbnail",
    "educations.complementary[].institution",
    "educations.complementary[].title",
    "educations.complementary[].period_time",
    "educations.languages[].thumbnail",
    "educations.languages[].language",
    "educations.languages[].spoken",
    "educations.languages[].writen",
    "educations.languages[].read",
    "educations.languages[].acreditations[].institution",
    "educations.languages[].acreditations[].title",
    "educations.languages[].acreditations[].period_time",
]
_EXCLUDE_SPECS = tuple(_parse_path_spec(p) for p in EXCLUDE_PATHS)

# --------------------------------------------------------------------------
# 2) UTILIDADES
# --------------------------------------------------------------------------

RE_URL = re.compile(r"^https?://", re.I)
RE_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
RE_TEL = re.compile(r"^\+?\d[\d\s\-()]{5,}$")
RE_FILE = re.compile(r".+\.(png|jpe?g|svg|webp|gif|pdf|docx?|xlsx?|pptx?|md)$", re.I)


def is_uninteresting_leaf(s: str) -> bool:
    """Cadenas que no queremos procesar como texto (URLs, emails, tel, archivos)."""
    return bool(
        RE_URL.match(s) or RE_EMAIL.match(s) or RE_TEL.match(s) or RE_FILE.match(s)
    )


def is_html_like(s: str) -> bool:
    return "<" in s and ">" in s


# --------------------------------------------------------------------------
# 3) RECORRIDO: construir 'molde' y recolectar textos resumibles
# --------------------------------------------------------------------------


def walk_collect(
    obj: Any,
    path: Tuple[Union[str, int], ...] = (),
    parent_key: str = "",
    pending_texts: Optional[List[Tuple[Tuple[Union[str, int], ...], str]]] = None,
    consider_html: bool = True,
):
    if pending_texts is None:
        pending_texts = []

    if isinstance(obj, dict):
        molded: Dict[Any, Any] = {}
        for k, v in obj.items():
            child_path = path + (k,)
            # si la ruta está excluida, no tocamos nada dentro
            if _is_excluded_path(child_path, _EXCLUDE_SPECS):
                molded[k] = v
                continue
            molded[k] = walk_collect(v, child_path, k, pending_texts, consider_html)
        return molded

    if isinstance(obj, list):
        return [
            walk_collect(v, path + (i,), parent_key, pending_texts, consider_html)
            for i, v in enumerate(obj)
        ]

    if isinstance(obj, str):
        if is_uninteresting_leaf(obj):
            return obj
        if consider_html and is_html_like(obj):
            idx = len(pending_texts)
            pending_texts.append((path, "__HTML__" + obj))
            return {"__SUM_TEXT__": idx}
        idx = len(pending_texts)
        pending_texts.append((path, obj))
        return {"__SUM_TEXT__": idx}

    return obj


def apply_summaries(molded: Any, summaries: List[str]) -> Any:
    if isinstance(molded, dict):
        if "__SUM_TEXT__" in molded and len(molded) == 1:
            return summaries[molded["__SUM_TEXT__"]]
        return {k: apply_summaries(v, summaries) for k, v in molded.items()}
    if isinstance(molded, list):
        return [apply_summaries(v, summaries) for v in molded]
    return molded


def assert_same_shape(a: Any, b: Any, path: str = "$") -> None:
    if type(a) is not type(b):
        raise ValueError(f"Tipo distinto en {path}: {type(a)} vs {type(b)}")
    if isinstance(a, dict):
        if set(a.keys()) != set(b.keys()):
            falta = set(a.keys()) - set(b.keys())
            sobra = set(b.keys()) - set(a.keys())
            raise ValueError(
                f"Claves distintas en {path}. Faltan: {falta}, Sobran: {sobra}"
            )
        for k in a:
            assert_same_shape(a[k], b[k], f"{path}.{k}")
    elif isinstance(a, list):
        if len(a) != len(b):
            raise ValueError(f"Longitud distinta en {path}: {len(a)} vs {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            assert_same_shape(x, y, f"{path}[{i}]")
    # hojas: ok


# --------------------------------------------------------------------------
# 4) RESUMEN EXTRACTIVO (SIN INVENTAR)
# --------------------------------------------------------------------------

# Stopwords muy básicas para ES/EN; (para ZH se extracta por longitud)
_ES_SW = {
    "de",
    "la",
    "que",
    "el",
    "en",
    "y",
    "a",
    "los",
    "del",
    "se",
    "las",
    "por",
    "un",
    "para",
    "con",
    "no",
    "una",
    "su",
    "al",
    "lo",
    "como",
    "más",
    "pero",
    "sus",
    "le",
    "ya",
    "o",
    "fue",
    "ha",
    "si",
    "porque",
    "muy",
    "sin",
    "sobre",
    "también",
    "me",
    "hasta",
    "hay",
    "donde",
    "han",
    "quien",
    "entre",
    "está",
    "cuando",
    "todo",
    "esta",
    "ser",
    "son",
}
_EN_SW = {
    "the",
    "of",
    "and",
    "to",
    "in",
    "a",
    "is",
    "that",
    "for",
    "on",
    "it",
    "as",
    "with",
    "are",
    "was",
    "at",
    "by",
    "from",
    "this",
    "an",
    "be",
    "or",
    "which",
    "we",
    "you",
    "they",
    "has",
    "have",
    "not",
}

_SENT_SPLIT_RE = re.compile(r"(?<=[\.\!\?。！？])\s+|(?<=</p>)", re.UNICODE)
_WORD_RE = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+", re.UNICODE)


def _split_sentences(text: str) -> List[str]:
    parts = [s.strip() for s in _SENT_SPLIT_RE.split(text) if s.strip()]
    # si el texto no trae puntuación, cae como 1 "frase"
    return parts or ([text.strip()] if text.strip() else [])


def _language_hint(text: str) -> str:
    # heurística tonta: si hay muchos caracteres CJK → zh
    cjk = sum(1 for ch in text if "\u4e00" <= ch <= "\u9fff")
    if cjk > max(10, len(text) // 20):
        return "zh"
    # si tildes -> es; si no, por defecto es/en no importa (stopwords compartidas mínimas)
    if any(ch in "áéíóúüñÁÉÍÓÚÜÑ" for ch in text):
        return "es"
    return "en"


def _tokenize(text: str) -> List[str]:
    return [m.group(0).casefold() for m in _WORD_RE.finditer(text)]


def _score_sentences(sentences: List[str]) -> List[Tuple[int, float]]:
    if not sentences:
        return []
    lang = _language_hint(" ".join(sentences))
    sw = _ES_SW if lang == "es" else _EN_SW

    # frecuencia de términos
    freq: Dict[str, int] = {}
    for s in sentences:
        for w in _tokenize(s):
            if w in sw:
                continue
            freq[w] = freq.get(w, 0) + 1

    if not freq:
        # si no hay palabras (p.ej. chino), puntúa por longitud
        return [(i, len(s)) for i, s in enumerate(sentences)]

    # normaliza por máx frecuencia
    max_f = max(freq.values())
    scores: List[Tuple[int, float]] = []
    for i, s in enumerate(sentences):
        score = 0.0
        ws = _tokenize(s)
        for w in ws:
            if w in sw:
                continue
            score += freq.get(w, 0) / max_f
        # pequeño bono por posición (lead bias)
        score *= 1.0 + 0.05 * max(0, (len(sentences) - i))
        scores.append((i, score))
    return scores


def _extractive_summary(
    text: str,
    *,
    ratio: Optional[float] = None,
    min_chars: int = 350,
    max_chars: int = 900,
) -> str:
    sents = _split_sentences(text)
    if not sents:
        return text

    # objetivo: nº de frases por ratio o por límite de caracteres
    if ratio is not None:
        k = max(1, min(len(sents), int(round(len(sents) * ratio))))
    else:
        # adapta por longitud: intenta llegar a ~max_chars sin pasarte mucho
        k = 1
        total = 0
        for i, s in enumerate(sents):
            total += len(s)
            if total < min_chars:
                k = i + 1
            elif total <= max_chars:
                k = i + 1

        k = max(1, min(k, len(sents)))

    # puntuar y elegir top-k (manteniendo ORDEN original)
    scored = _score_sentences(sents)
    if not scored:
        # fallback para textos sin tokens (p.ej. chino puro): coger primeras k
        chosen_idx = list(range(k))
    else:
        top = sorted(scored, key=lambda t: t[1], reverse=True)[:k]
        chosen_idx = sorted(i for i, _ in top)

    selected = [sents[i] for i in chosen_idx]
    return " ".join(selected)


# --------------------------------------------------------------------------
# 5) API de alto nivel
# --------------------------------------------------------------------------


def summarize_batch_extractive(
    texts: List[str],
    *,
    batch_size: int = 8,  # se ignora; por compat
    short_threshold: int = 140,
    keep_html: bool = True,
    ratio: Optional[float] = None,
    min_chars: int = 350,
    max_chars: int = 900,
) -> List[str]:
    out: List[str] = []
    for t in texts:
        is_html = t.startswith("__HTML__")
        raw = t[len("__HTML__") :] if is_html else t

        # si es corto o es "hoja no interesante": devolver tal cual
        if len(raw.strip()) < short_threshold or is_uninteresting_leaf(raw):
            out.append(raw)
            continue

        # extraer texto si viene HTML
        txt = (
            BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
            if (is_html and keep_html)
            else raw
        )
        summarized = _extractive_summary(
            txt, ratio=ratio, min_chars=min_chars, max_chars=max_chars
        )

        if is_html and keep_html:
            # devolver envuelto en <p>…</p>
            paras = [p.strip() for p in re.split(r"\n{2,}", summarized) if p.strip()]
            if not paras:
                paras = [summarized]
            out.append("".join(f"<p>{p}</p>" for p in paras))
        else:
            out.append(summarized)
    return out


def summarize_json_obj(
    data: Any,
    *,
    ratio: Optional[float] = None,
    batch_size: int = 8,
    short_threshold: int = 140,
    keep_html: bool = True,
    min_chars: int = 350,
    max_chars: int = 900,
) -> Any:
    pending_texts: List[Tuple[Tuple[Union[str, int], ...], str]] = []
    molded = walk_collect(
        data,
        path=(),
        parent_key="",
        pending_texts=pending_texts,
        consider_html=keep_html,
    )
    texts = [s for _, s in pending_texts]
    if texts:
        summaries = summarize_batch_extractive(
            texts,
            batch_size=batch_size,
            short_threshold=short_threshold,
            keep_html=keep_html,
            ratio=ratio,
            min_chars=min_chars,
            max_chars=max_chars,
        )
    else:
        summaries = []

    result = apply_summaries(molded, summaries)
    assert_same_shape(data, result)
    return result


def summarize_json_file(
    infile: str,
    outfile: str,
    *,
    ratio: Optional[float] = None,
    batch_size: int = 8,
    short_threshold: int = 140,
    keep_html: bool = True,
    min_chars: int = 350,
    max_chars: int = 900,
) -> None:
    with open(infile, "r", encoding="utf-8") as f:
        data = json.load(f)

    summarized = summarize_json_obj(
        data,
        ratio=ratio,
        batch_size=batch_size,
        short_threshold=short_threshold,
        keep_html=keep_html,
        min_chars=min_chars,
        max_chars=max_chars,
    )

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(summarized, f, ensure_ascii=False, indent=2)


def summarize_json(data: Any, **kwargs) -> Any:
    """
    Resumir un objeto JSON en memoria (EXTRACTIVO, sin inventar).
    kwargs: ratio, batch_size, short_threshold, keep_html, min_chars, max_chars
    """
    return summarize_json_obj(
        data,
        ratio=kwargs.get("ratio"),
        batch_size=kwargs.get("batch_size", 8),
        short_threshold=kwargs.get("short_threshold", 140),
        keep_html=kwargs.get("keep_html", True),
        min_chars=kwargs.get("min_chars", 350),
        max_chars=kwargs.get("max_chars", 900),
    )


def summarize_json_in_memory(data: Any, ratio: float = 0.3):
    return summarize_json(data, ratio=ratio)
