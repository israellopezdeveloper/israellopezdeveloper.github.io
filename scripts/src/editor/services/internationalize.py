# -*- coding: utf-8 -*-
from __future__ import annotations

from typing import Any, Dict, List

from PySide6 import QtCore


class InternationalizeWorker(QtCore.QObject):
    finished = QtCore.Signal(dict)  # { lang: {"full": dict, "summary": dict}, ... }
    error = QtCore.Signal(str)

    @QtCore.Slot(dict, str, float)
    def run(self, data: dict, src_lang: str, ratio: float) -> None:
        try:
            from editor.summarizer.summarizer import summarize_json_in_memory
            from editor.traductor.traductor import translate_json

            langs = {"es", "en", "zh"}
            if src_lang not in langs:
                raise ValueError(f"Idioma de origen no soportado: {src_lang}")
            targets: List[str] = sorted(list(langs - {src_lang}))

            out: Dict[str, Dict[str, Any]] = {}
            for tgt in targets:
                # 1) Traducción al idioma destino
                translated = translate_json(data, src_lang=src_lang, tgt_lang=tgt)
                # 2) Resumen del traducido
                summarized = summarize_json_in_memory(translated, ratio=ratio)
                out[tgt] = {"full": translated, "summary": summarized}

            summarized = summarize_json_in_memory(data, ratio=ratio)
            out[src_lang] = {"full": data, "summary": summarized}

            self.finished.emit(out)
        except Exception as e:
            self.error.emit(str(e))
