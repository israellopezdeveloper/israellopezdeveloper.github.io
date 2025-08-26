# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import torch
from bs4 import BeautifulSoup
from bs4.element import NavigableString, Tag
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Evita exceso de hilos en tokenizers (a veces da sensación de "freeze")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

# Cache sencilla de traductores por configuración
_TRANSLATOR_CACHE: dict[tuple, NLLBTranslator] = {}

# ---------- Mapeo de idiomas a códigos NLLB (acepta ISO corto) ------------

NLLB_CODES = {
    # español
    "es": "spa_Latn",
    "spa": "spa_Latn",
    "spa_latn": "spa_Latn",
    "spa-latn": "spa_Latn",
    "spa_Latn": "spa_Latn",
    # inglés
    "en": "eng_Latn",
    "eng": "eng_Latn",
    "eng_latn": "eng_Latn",
    "eng-latn": "eng_Latn",
    "eng_Latn": "eng_Latn",
    # chino
    "zh": "zho_Hans",
    "zh-cn": "zho_Hans",
    "zh_hans": "zho_Hans",
    "zho_hans": "zho_Hans",
    "zho_Hans": "zho_Hans",
    "zh-tw": "zho_Hant",
    "zh_hant": "zho_Hant",
    "zho_hant": "zho_Hant",
    "zho_Hant": "zho_Hant",
}


def to_nllb(code: str) -> str:
    c = code.strip().lower().replace("_", "-")
    return NLLB_CODES.get(c, code)


# ------------------------ Reglas de exclusión ------------------------------

EXCLUDE_PATHS = [
    "intro.name",
    "intro.links[].icon",
    "intro.links[].url",
    "works[].name",
    "works[].thumbnail",
    "works[].links[].icon",
    "works[].links[].url",
    "works[].projects[].links[].url",
    "works[].projects[].links[].icon",
    "works[].projects[].technologies[]",
    "works[].technologies[]",
    "works[].images[]",
    "educations[].university[].images[]",
    "educations[].university[].thumbnail",
    "educations[].university[].university_name",
    "educations[].complementary[].images[]",
    "educations[].complementary[].thumbnail",
    "educations[].complementary[].institution",
    "educations[].languages[].acreditations[].institution",
    "educations[].languages[].acreditations[].title",
    "educations[].languages[].thumbnail",
]


def _compile_exclude_patterns(patterns: List[str]):
    comp = []
    for p in patterns:
        toks = []
        for part in p.split("."):
            if part.endswith("[]"):
                toks.append((part[:-2], True))  # (clave, requiere_indice)
            else:
                toks.append((part, False))
        comp.append(toks)
    return comp


_COMPILED_EXCLUDE = _compile_exclude_patterns(EXCLUDE_PATHS)


def _path_matches_tokens(tokens: List[Tuple[str, bool]], path: Tuple[Any, ...]) -> bool:
    """
    Compara tokens (clave / clave[]) con la tupla de ruta real (claves y enteros).
    """
    j = 0
    for key, wants_index in tokens:
        if j >= len(path) or path[j] != key:
            return False
        j += 1
        if wants_index:
            if j >= len(path) or not isinstance(path[j], int):
                return False
            j += 1
    return j == len(path)


def is_excluded_path(path: Tuple[Any, ...]) -> bool:
    for tokens in _COMPILED_EXCLUDE:
        if _path_matches_tokens(tokens, path):
            return True
    return False


RE_URL = re.compile(r"^https?://", re.I)
RE_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
RE_TEL = re.compile(r"^\+?\d[\d\s\-()]{5,}$")
RE_FILE = re.compile(r".+\.(png|jpe?g|svg|webp|gif|pdf|docx?|xlsx?|pptx?|md)$", re.I)


def is_html_like(s: str) -> bool:
    return "<" in s and ">" in s


def is_untranslatable_leaf(s: str) -> bool:
    return bool(
        RE_URL.match(s) or RE_EMAIL.match(s) or RE_TEL.match(s) or RE_FILE.match(s)
    )


# ------------------- Recolección / reconstrucción JSON --------------------


def walk_collect(
    obj: Any,
    path: Tuple[Any, ...] = (),
    parent_key: str = "",
    pending_plain: Optional[List[Tuple[Tuple[Any, ...], str]]] = None,
    pending_html: Optional[List[Tuple[Tuple[Any, ...], str]]] = None,
):
    if pending_plain is None:
        pending_plain = []
    if pending_html is None:
        pending_html = []

    if isinstance(obj, dict):
        molded: Dict[Any, Any] = {}
        for k, v in obj.items():
            new_path = path + (k,)
            if is_excluded_path(new_path) or v == "":
                # No tocar nada bajo esta ruta
                molded[k] = v
                continue
            molded[k] = walk_collect(v, new_path, k, pending_plain, pending_html)
        return molded

    if isinstance(obj, list):
        out_list: List[Any] = []
        for i, v in enumerate(obj):
            new_path = path + (i,)
            if is_excluded_path(new_path):
                out_list.append(v)  # entero excluido (p.ej. images[], technologies[])
            else:
                out_list.append(
                    walk_collect(v, new_path, parent_key, pending_plain, pending_html)
                )
        return out_list

    if isinstance(obj, str):
        # Excluir por ruta exacta (e.g., intro.name, ... .url, ... .thumbnail, etc.)
        if is_excluded_path(path):
            return obj
        if is_untranslatable_leaf(obj):
            return obj
        if is_html_like(obj):
            idx = len(pending_html)
            pending_html.append((path, obj))
            return {"__TRANS_HTML__": idx}
        idx = len(pending_plain)
        pending_plain.append((path, obj))
        return {"__TRANS_PLAIN__": idx}

    return obj


def apply_translations(
    molded: Any, trans_plain: List[str], trans_html: List[str]
) -> Any:
    if isinstance(molded, dict):
        if "__TRANS_HTML__" in molded and len(molded) == 1:
            return trans_html[molded["__TRANS_HTML__"]]
        if "__TRANS_PLAIN__" in molded and len(molded) == 1:
            return trans_plain[molded["__TRANS_PLAIN__"]]
        return {
            k: apply_translations(v, trans_plain, trans_html) for k, v in molded.items()
        }

    if isinstance(molded, list):
        return [apply_translations(v, trans_plain, trans_html) for v in molded]

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
    # en hojas, no se valida contenido


# -------------------------- Traductor NLLB --------------------------------


class NLLBTranslator:
    def __init__(
        self,
        model_name: str = "facebook/nllb-200-distilled-600M",
        device: Optional[str] = None,
        fp16: bool = True,
        num_beams: int = 4,
        max_input_length: int = 1024,
        max_new_tokens: int = 512,
    ):
        self.device = device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        self.dtype = (
            torch.float16 if (fp16 and "cuda" in self.device) else torch.float32
        )
        self.num_beams = num_beams
        self.max_input_length = max_input_length
        self.max_new_tokens = max_new_tokens

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name, torch_dtype=self.dtype
        ).to(self.device)

    def translate_batch(
        self,
        texts: List[str],
        src_lang: str,
        tgt_lang: str,
        batch_size: int = 32,
    ) -> List[str]:
        out: List[str] = []
        tok = self.tokenizer
        model = self.model

        for i in range(0, len(texts), batch_size):
            chunk = texts[i : i + batch_size]
            tok.src_lang = src_lang
            inputs = tok(
                chunk,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.max_input_length,
            ).to(self.device)

            with torch.no_grad():
                gen = model.generate(
                    **inputs,
                    forced_bos_token_id=tok.convert_tokens_to_ids(tgt_lang),
                    max_new_tokens=self.max_new_tokens,
                    num_beams=self.num_beams,
                    length_penalty=1.0,
                    early_stopping=True,
                )
            out.extend(tok.batch_decode(gen, skip_special_tokens=True))
        return out


# --------------- HTML: preservar etiquetas y traducir textos --------------


def translate_html_preserving_tags(
    html_texts: List[str],
    translator: NLLBTranslator,
    src_lang: str,
    tgt_lang: str,
    batch_size: int,
) -> List[str]:
    soups: List[BeautifulSoup] = [BeautifulSoup(s, "html.parser") for s in html_texts]

    # Recoger nodos de texto traducibles, una sola pasada y sin filtros posteriores
    text_nodes: List[NavigableString] = []
    for soup in soups:
        for node in soup.find_all(string=True):  # correcto (text=True está deprecado)
            if not isinstance(node, NavigableString):
                continue
            parent: Tag | None = getattr(node, "parent", None)
            if parent is None:
                continue
            parent_name: Optional[str] = getattr(parent, "name", None)
            if parent_name in {"script", "style"}:
                continue
            txt = str(node)
            if txt.strip() and not is_untranslatable_leaf(txt):
                text_nodes.append(node)

    if not text_nodes:
        return [str(s) for s in soups]

    raw_texts = [str(n) for n in text_nodes]
    translated = translator.translate_batch(
        raw_texts, src_lang=src_lang, tgt_lang=tgt_lang, batch_size=batch_size
    )

    # Reinyectar 1:1
    for node, new_text in zip(text_nodes, translated, strict=True):
        node.replace_with(NavigableString(new_text))

    return [str(s) for s in soups]


# ----------------------- API de alto nivel (JSON) -------------------------


def translate_json_obj(
    data: Any,
    translator: NLLBTranslator,
    src_lang: str,
    tgt_lang: str,
    batch_size: int = 32,
    parse_html: bool = True,
) -> Any:
    pending_plain: List[Tuple[Tuple[Any, ...], str]] = []
    pending_html: List[Tuple[Tuple[Any, ...], str]] = []

    molded = walk_collect(
        data,
        path=(),
        parent_key="",
        pending_plain=pending_plain,
        pending_html=pending_html,
    )

    plain_texts = [s for _, s in pending_plain]
    html_texts = [s for _, s in pending_html]

    trans_plain: List[str] = []
    trans_html: List[str] = []

    if plain_texts:
        trans_plain = translator.translate_batch(
            plain_texts, src_lang=src_lang, tgt_lang=tgt_lang, batch_size=batch_size
        )

    if html_texts:
        if parse_html:
            trans_html = translate_html_preserving_tags(
                html_texts,
                translator=translator,
                src_lang=src_lang,
                tgt_lang=tgt_lang,
                batch_size=max(8, batch_size // 2),
            )
        else:
            # Modo seguro: sin parsear HTML (solo traduce el texto tal cual)
            trans_html = translator.translate_batch(
                html_texts,
                src_lang=src_lang,
                tgt_lang=tgt_lang,
                batch_size=max(8, batch_size // 2),
            )

    result = apply_translations(molded, trans_plain, trans_html)
    # Sanidad: misma forma
    assert_same_shape(data, result)
    return result


def translate_json_file(
    infile: str,
    outfile: str,
    src_lang: str = "spa_Latn",
    tgt_lang: str = "eng_Latn",
    batch_size: int = 32,
    model_name: str = "facebook/nllb-200-distilled-600M",
    device: Optional[str] = None,
    num_beams: int = 4,
    parse_html: bool = True,
) -> None:
    translator = NLLBTranslator(
        model_name=model_name,
        device=device,
        fp16=True,
        num_beams=num_beams,
    )

    with open(infile, "r", encoding="utf-8") as f:
        data = json.load(f)

    translated = translate_json_obj(
        data,
        translator=translator,
        src_lang=src_lang,
        tgt_lang=tgt_lang,
        batch_size=batch_size,
        parse_html=parse_html,
    )

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)


def _get_translator(
    *,
    model_name: str,
    device: Optional[str],
    fp16: bool,
    num_beams: int,
    max_input_length: int = 1024,
    max_new_tokens: int = 512,
) -> NLLBTranslator:
    key = (
        model_name,
        device or ("cuda:0" if torch.cuda.is_available() else "cpu"),
        bool(fp16),
        int(num_beams),
        int(max_input_length),
        int(max_new_tokens),
    )
    tr = _TRANSLATOR_CACHE.get(key)
    if tr is None:
        tr = NLLBTranslator(
            model_name=model_name,
            device=device,
            fp16=fp16,
            num_beams=num_beams,
            max_input_length=max_input_length,
            max_new_tokens=max_new_tokens,
        )
        _TRANSLATOR_CACHE[key] = tr
    return tr


def translate_json(
    data: Any,
    src_lang: str = "es",
    tgt_lang: str = "en",
    *,
    model_name: str = "facebook/nllb-200-distilled-600M",
    device: Optional[str] = None,
    fp16: bool = True,
    num_beams: int = 4,
    batch_size: int = 32,
    parse_html: bool = True,
) -> Any:
    """
    Traduce un objeto JSON ya cargado en memoria usando NLLB.
    Acepta códigos ISO cortos ("es", "en", "zh") o NLLB ("spa_Latn", etc.).
    """
    translator = _get_translator(
        model_name=model_name,
        device=device,
        fp16=True,
        num_beams=num_beams,
    )
    translator = NLLBTranslator(
        model_name=model_name,
        device=device,
        fp16=fp16,
        num_beams=num_beams,
    )

    # Permite pasar ISO cortos y los normaliza a NLLB
    src = to_nllb(src_lang)
    tgt = to_nllb(tgt_lang)

    return translate_json_obj(
        data,
        translator=translator,
        src_lang=src,
        tgt_lang=tgt,
        batch_size=batch_size,
        parse_html=parse_html,
    )
