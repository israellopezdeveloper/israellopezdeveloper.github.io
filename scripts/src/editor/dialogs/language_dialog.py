# src/editor/dialogs/language_dialog.py
from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import (
    CustomList,
)

# Widgets
from ..widgets.file_select import FileSelect

# Dialog
from .acreditation_dialog import AcreditationDialog
from .base_dialog import BaseDialog

Qt = QtCore.Qt

# ---- helpers ----
_ALLOWED = ["Básico", "Intermedio", "Fluido", "Avanzado", "Nativo"]


class LanguageDialog(BaseDialog):
    """Diálogo de idioma:
    - language (texto)
    - spoken / writen / read (QComboBox con {Basico, intermedio, fluido, avanzado, nativo})
    - acreditation (lista + modal)
    - thumbnail (selector de imagen)
    """

    @property
    def title(self) -> str:
        return "Language"

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)

        # Campos
        self._language = QtWidgets.QLineEdit(self)

        def make_level_combo() -> QtWidgets.QComboBox:
            cb = QtWidgets.QComboBox(self)
            cb.setEditable(False)
            cb.addItem("")  # opción vacía
            for opt in _ALLOWED:
                cb.addItem(opt)
            cb.currentIndexChanged.connect(self._revalidate)
            return cb

        self._spoken = make_level_combo()
        self._writen = make_level_combo()
        self._read = make_level_combo()

        # Thumbnail
        img_filter = "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)"
        self._thumbnail = FileSelect(
            title="Elegir miniatura",
            file_filter=img_filter,
            must_exist=False,
            parent=self,
        )
        self._thumb_set = self._thumbnail.set_value
        self._thumb_get = self._thumbnail.value

        # Lista de acreditaciones
        self._acreds = CustomList(
            self,
            dialog_cls=AcreditationDialog,
        )

        # Layout superior (datos del idioma)
        form = QtWidgets.QFormLayout()
        form.addRow("Idioma", self._language)
        form.addRow("Hablado (spoken)", self._spoken)
        form.addRow("Escrito (writen)", self._writen)
        form.addRow("Leído (read)", self._read)
        form.addRow("Thumbnail", self._thumbnail)

        # Acreditaciones
        box_acreds = QtWidgets.QGroupBox("Acreditaciones", self)
        vac = QtWidgets.QVBoxLayout(box_acreds)
        vac.addWidget(self._acreds)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        wleft = QtWidgets.QWidget(self)
        wleft.setLayout(form)
        wright = QtWidgets.QWidget(self)
        rlay = QtWidgets.QVBoxLayout(wright)
        rlay.addWidget(box_acreds)
        rlay.addStretch(1)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 2)
        split.setStretchFactor(1, 3)
        split.setSizes([380, 380])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)

        self._language.textChanged.connect(self._revalidate)
        try:
            self._thumbnail.valueChanged.connect(lambda _: self._revalidate())  # type: ignore[attr-defined]
        except Exception:
            pass

    # ---- API pública ----
    def set_value(self, data: Dict[str, Any]) -> None:
        def _set_combo_to(cb: QtWidgets.QComboBox, value: str) -> None:
            """Selecciona en el combo el item que coincide (case-insensitive). Si no, deja vacío."""
            val = (value or "").strip()
            if not val:
                cb.setCurrentIndex(0)
                return
            for i in range(cb.count()):
                if cb.itemText(i).casefold() == val.casefold():
                    cb.setCurrentIndex(i)
                    return
            cb.setCurrentIndex(0)

        self._language.setText(str(data.get("language")))
        _set_combo_to(self._spoken, str(data.get("spoken")))
        _set_combo_to(self._writen, str(data.get("writen")))
        _set_combo_to(self._read, str(data.get("read")))
        self._thumb_set(str(data.get("thumbnail")))

        self._acreds.setData(data.get("acreditation") or [])

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        return {
            "language": self._language.text().strip(),
            "spoken": (self._spoken.currentText() or "").strip(),
            "writen": (self._writen.currentText() or "").strip(),
            "read": (self._read.currentText() or "").strip(),
            "thumbnail": self._thumb_get().strip(),
            "acreditation": self._acreds.data(),
        }

    def str(self) -> str:
        language = self._language.text().strip()
        acreditations = len(self._acreds.data())

        return f"{language} — Acreditaciones: {acreditations}"

    def tuple(self) -> Tuple[str, str]:
        language = self._language.text().strip()
        acreditations = len(self._acreds.data())
        return (language, str(acreditations))

    # ---- Internos ----
    def _revalidate(self) -> None:
        # Requiere al menos 'language' para habilitar OK
        self._ok_btn.setEnabled(bool(self._language.text().strip()))

    def _on_accept(self) -> None:
        # Revalida antes de cerrar
        self._revalidate()
        if not self._ok_btn.isEnabled():
            # Enfoca el primer campo problemático (language vacío)
            if not self._language.text().strip():
                self._language.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()


__all__ = ["LanguageDialog"]
