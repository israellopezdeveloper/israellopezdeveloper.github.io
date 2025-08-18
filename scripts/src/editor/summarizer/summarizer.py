# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Tuple

import torch
from bs4 import BeautifulSoup
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline

# --------- Reglas de exclusión (mismas ideas que en la traducción) --------

EXCLUDE_KEYS = {
    "url",
    "urls",
    "link",
    "links",
    "thumbnail",
    "thumbnails",
    "icon",
    "icons",
    "image",
    "images",
    "profile_image",
    "period_time",
    "dates",
    "acreditations",
    "phone",
    "tel",
    "email",
    "technologies",
    "name",
    "university_name",
}

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


# -------------------------- Colección / molde -----------------------------


def walk_collect(
    obj: Any,
    path: Tuple[Any, ...] = (),
    parent_key: str = "",
    pending_texts: Optional[List[Tuple[Tuple[Any, ...], str]]] = None,
    consider_html: bool = True,
):
    """
    Recorre el JSON y junta las hojas string resumibles en pending_texts.
    Retorna un 'molde' con marcadores para reinsertar luego.
    """
    if pending_texts is None:
        pending_texts = []

    if isinstance(obj, dict):
        molded: Dict[Any, Any] = {}
        for k, v in obj.items():
            if k in EXCLUDE_KEYS:
                molded[k] = v
                continue
            molded[k] = walk_collect(v, path + (k,), k, pending_texts, consider_html)
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
            # marcamos como HTML para procesar distinto
            pending_texts.append((path, "__HTML__" + obj))
            return {"__SUM_TEXT__": idx}
        else:
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


# -------------------------- Resumen por lotes -----------------------------


class JSONSummarizer:
    """
    Resumidor multilingüe por lotes usando Transformers.
    Por defecto: csebuetnlp/mT5_multilingual_XLSum (funciona bien en español/inglés).
    """

    def __init__(
        self,
        model_name: str = "csebuetnlp/mT5_multilingual_XLSum",
        device: Optional[str] = None,
        fp16: bool = True,
        max_input_length: int = 1024,
        min_length: int = 60,
        max_length: int = 200,
        ratio: Optional[float] = None,
    ):
        self.device = device or ("cuda:0" if torch.cuda.is_available() else "cpu")
        self.dtype = (
            torch.float16 if (fp16 and "cuda" in self.device) else torch.float32
        )
        self.max_input_length = max_input_length
        self.min_length = min_length
        self.max_length = max_length
        self.ratio = ratio

        # Cargamos explícitamente tokenizer+modelo para controlar dtype/device
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            use_fast=False,
            legacy=False,
        )
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            torch_dtype=self.dtype,
        ).to(self.device)

        # Creamos pipeline con los objetos anteriores
        self.pipe = pipeline(
            "summarization",
            model=self.model,
            tokenizer=self.tokenizer,
            device=0 if "cuda" in self.device else -1,
            framework="pt",
        )

    def _effective_lengths(self, text: str) -> Tuple[int, int]:
        """Devuelve (min_len, max_len) efectivos, ajustados por ratio si procede."""
        if self.ratio is None:
            return (self.min_length, self.max_length)
        # calculamos longitudes objetivo por ratio del nº de tokens aproximado
        # NB: no necesitamos exactitud milimétrica
        approx_tokens = max(30, len(text.split()))
        target = max(10, int(approx_tokens * self.ratio))
        min_len = max(10, min(self.min_length, target - 10))
        max_len = max(min_len + 20, min(self.max_length, target + 20))
        return (min_len, max_len)

    def summarize_batch(
        self,
        texts: List[str],
        batch_size: int = 8,
        short_threshold: int = 140,  # caracteres por debajo de los cuales NO resumimos
        keep_html: bool = True,
    ) -> List[str]:
        out: List[str] = []
        # Pre-procesar: distinguir HTML marcado con "__HTML__"
        kinds: List[str] = []  # "html" | "plain"
        clean_texts: List[str] = []

        for t in texts:
            is_html = t.startswith("__HTML__")
            kinds.append("html" if is_html else "plain")
            if is_html:
                raw = t[len("__HTML__") :]
                if keep_html:
                    # Extraemos SOLO texto
                    txt = BeautifulSoup(raw, "html.parser").get_text(" ", strip=True)
                else:
                    # Si no preservamos HTML, tratamos el string completo como texto
                    txt = raw
                clean_texts.append(txt)
            else:
                clean_texts.append(t)

        # Decidimos qué resumir y qué dejar igual
        to_summarize_idx: List[int] = []
        inputs_for_model: List[str] = []
        for i, txt in enumerate(clean_texts):
            if is_uninteresting_leaf(txt) or len(txt.strip()) < short_threshold:
                out.append(  # placeholder; se sobrescribe luego si no se resume
                    ""  # se rellenará con el original al final
                )
            else:
                to_summarize_idx.append(i)
                inputs_for_model.append(txt)
                out.append("")  # placeholder

        # Ejecutar el pipeline en lotes
        results: List[str] = []
        for i in range(0, len(inputs_for_model), batch_size):
            chunk = inputs_for_model[i : i + batch_size]
            # parámetros dinámicos por ratio
            # (usamos el primer elemento del chunk como guía, realmente no importa mucho)
            min_l, max_l = self._effective_lengths(chunk[0])
            summaries = self.pipe(
                chunk,
                truncation=True,
                max_length=max_l,
                min_length=min_l,
                do_sample=False,
            )
            results.extend([s["summary_text"] for s in summaries])

        # Reconstruir en el mismo orden que texts
        rptr = 0
        for i in range(len(out)):
            if i in to_summarize_idx:
                s = results[rptr]
                rptr += 1
                if kinds[i] == "html" and keep_html:
                    # Devolvemos un bloque simple con <p> para evitar HTML roto
                    out[i] = f"<p>{s}</p>"
                else:
                    out[i] = s
            else:
                # no se resumió: devolver original (quitando marcador)
                original = texts[i]
                out[i] = (
                    original[len("__HTML__") :]
                    if original.startswith("__HTML__")
                    else original
                )

        return out


# ------------------------ API de alto nivel (JSON) ------------------------


def summarize_json_obj(
    data: Any,
    summarizer: JSONSummarizer,
    batch_size: int = 8,
    short_threshold: int = 140,
    keep_html: bool = True,
) -> Any:
    pending_texts: List[Tuple[Tuple[Any, ...], str]] = []
    molded = walk_collect(
        data,
        path=(),
        parent_key="",
        pending_texts=pending_texts,
        consider_html=keep_html,
    )

    texts = [s for _, s in pending_texts]
    summaries: List[str] = []

    if texts:
        summaries = summarizer.summarize_batch(
            texts,
            batch_size=batch_size,
            short_threshold=short_threshold,
            keep_html=keep_html,
        )

    result = apply_summaries(molded, summaries)
    assert_same_shape(data, result)
    return result


def summarize_json_file(
    infile: str,
    outfile: str,
    model_name: str = "csebuetnlp/mT5_multilingual_XLSum",
    device: Optional[str] = None,
    fp16: bool = True,
    batch_size: int = 8,
    short_threshold: int = 140,
    min_length: int = 60,
    max_length: int = 200,
    ratio: Optional[float] = None,
    keep_html: bool = True,
) -> None:
    summarizer = JSONSummarizer(
        model_name=model_name,
        device=device,
        fp16=fp16,
        min_length=min_length,
        max_length=max_length,
        ratio=ratio,
    )
    with open(infile, "r", encoding="utf-8") as f:
        data = json.load(f)

    summarized = summarize_json_obj(
        data,
        summarizer=summarizer,
        batch_size=batch_size,
        short_threshold=short_threshold,
        keep_html=keep_html,
    )

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(summarized, f, ensure_ascii=False, indent=2)


def summarize_json(data: Any, **kwargs) -> Any:
    """
    Resumir un objeto JSON en memoria.
    kwargs puede incluir los mismos parámetros que summarize_json_file
    excepto infile/outfile.
    """
    summarizer = JSONSummarizer(
        model_name=kwargs.get("model_name", "csebuetnlp/mT5_multilingual_XLSum"),
        device=kwargs.get("device"),
        fp16=kwargs.get("fp16", True),
        min_length=kwargs.get("min_length", 60),
        max_length=kwargs.get("max_length", 200),
        ratio=kwargs.get("ratio"),
    )

    return summarize_json_obj(
        data,
        summarizer=summarizer,
        batch_size=kwargs.get("batch_size", 8),
        short_threshold=kwargs.get("short_threshold", 140),
        keep_html=kwargs.get("keep_html", True),
    )


def summarize_json_in_memory(data, ratio: float = 0.3):
    # Reutiliza tu JSONSummarizer ya implementado
    return summarize_json(data, ratio=ratio)
