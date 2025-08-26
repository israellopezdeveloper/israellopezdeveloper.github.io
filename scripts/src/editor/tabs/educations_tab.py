from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from PySide6 import QtCore, QtWidgets

from ..dialogs.complementary_dialog import ComplementaryDialog
from ..dialogs.language_dialog import LanguageDialog
# Dialogs
from ..dialogs.university_dialog import UniversityDialog
# Utils
from ..utils.lists import CustomList

Qt = QtCore.Qt


class EducationsTab(QtWidgets.QWidget):
    """
    Tres listas: university, complementary, languages.
    - 'Añadir' y 'Editar' abren modal (si existe dialogo específico; si no, fallback).
    - API:
        from_data(dict|None)
        value() -> dict { 'university': [...], 'complementary': [...],
        'languages': [...] }
    """

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        dialog_dir: Path = Path.cwd(),
    ) -> None:
        super().__init__(parent)

        self._dialog_dir = dialog_dir

        # University
        self._university = CustomList(
            self,
            dialog_cls=UniversityDialog,
            dialog_dir=self._dialog_dir,
        )

        # Complementary
        self._complementary = CustomList(
            self,
            dialog_cls=ComplementaryDialog,
            dialog_dir=self._dialog_dir,
        )

        # Languages
        self._languages = CustomList(
            self,
            dialog_cls=LanguageDialog,
            dialog_dir=self._dialog_dir,
        )
        w_uni = QtWidgets.QGroupBox("Universidad", self)
        vl = QtWidgets.QVBoxLayout(w_uni)
        vl.addWidget(self._university)

        w_cmp = QtWidgets.QGroupBox("Complementario", self)
        vl = QtWidgets.QVBoxLayout(w_cmp)
        vl.addWidget(self._complementary)

        w_lng = QtWidgets.QGroupBox("Idiomas", self)
        vl = QtWidgets.QVBoxLayout(w_lng)
        vl.addWidget(self._languages)

        # Tres paneles en splitter vertical para redimensionar
        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        split.setChildrenCollapsible(False)
        split.setOpaqueResize(True)
        split.addWidget(w_uni)
        split.addWidget(w_cmp)
        split.addWidget(w_lng)
        split.setStretchFactor(0, 1)
        split.setStretchFactor(1, 1)
        split.setStretchFactor(2, 1)
        split.setSizes([300, 300, 300])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)

    # ---------- API de datos ----------
    def from_data(self, data: Optional[Dict[str, Any]]) -> None:
        """Carga las tres listas desde un dict con las claves solicitadas."""
        uni = (data or {}).get("university") or []
        cmp = (data or {}).get("complementary") or []
        lng = (data or {}).get("languages") or []

        self._university.setData(uni)
        self._complementary.setData(cmp)
        self._languages.setData(lng)

    def value(self) -> Dict[str, List[Dict[str, Any]]]:
        """Devuelve {'university': [...], 'complementary': [...], 'languages': [...]}"""

        return {
            "university": self._university.data(),
            "complementary": self._complementary.data(),
            "languages": self._complementary.data(),
        }


__all__ = ["EducationsTab"]
