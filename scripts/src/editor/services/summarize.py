# -*- coding: utf-8 -*-
from __future__ import annotations
from typing import Any

from PySide6 import QtCore

from editor.summarizer.summarizer import summarize_json_in_memory

# Si ya tienes summarize_json en otro módulo, importa desde allí:
# from editor.services.summarize_core import summarize_json
# En tu caso ya lo tienes en este mismo paquete:


class SummarizeWorker(QtCore.QObject):
    finished = QtCore.Signal(dict)  # resultado JSON resumido
    error = QtCore.Signal(str)

    @QtCore.Slot(dict, float)
    def run(self, data: dict, ratio: float) -> None:
        try:
            # Llama a tu implementación existente de resumen
            result: Any = summarize_json_in_memory(data, ratio=ratio)
            if not isinstance(result, dict):
                # Asegúrate de devolver dict (si es lista/otro contenedor, adáptalo)
                result = dict(result)
            self.finished.emit(result)  # type: ignore[arg-type]
        except Exception as e:
            self.error.emit(str(e))
