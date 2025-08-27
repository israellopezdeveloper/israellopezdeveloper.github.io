# src/editor/services/translate.py
from __future__ import annotations

from PySide6 import QtCore


class TranslateWorker(QtCore.QObject):
    finished = QtCore.Signal(dict)
    error = QtCore.Signal(str)

    @QtCore.Slot(dict, str, str)
    def run(self, data: dict, src: str, tgt: str) -> None:
        try:
            from editor.traductor.traductor import translate_json

            result = translate_json(
                data,
                src_lang=src,
                tgt_lang=tgt,
            )
            self.finished.emit(result)
        except Exception as e:
            self.error.emit(str(e))
