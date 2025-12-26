from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from PySide6 import QtCore, QtWidgets

from .base_dialog import BaseDialog


class BioDialog(BaseDialog):
    @property
    def title(self) -> str:
        return "Elemento Bio"

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        suggestions: List[str] = [],
        dialog_dir: Path = Path.cwd(),
    ) -> None:
        super().__init__(
            parent,
            suggestions=suggestions,
            dialog_dir=dialog_dir,
        )
        self._dates = QtWidgets.QLineEdit(self)
        self._text = QtWidgets.QPlainTextEdit(self)
        form = QtWidgets.QFormLayout()
        form.addRow("Fecha(s)", self._dates)
        form.addRow("Texto", self._text)
        btns = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        btns.accepted.connect(self.accept)
        btns.rejected.connect(self.reject)
        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(btns)

    # ------------------------------------------------------------------
    # API pública

    def set_value(self, data: Dict[str, str]) -> None:
        """Rellena los campos desde un dict."""
        self._dates.setText((data.get("dates") or "").strip())
        self._text.setPlainText((data.get("text") or "").strip())
        self._revalidate()

    def value(self) -> Dict[str, Any]:
        return {
            "dates": self._dates.text().strip(),
            "text": self._text.toPlainText().strip(),
        }

    def str(self) -> str:
        dates = self._dates.text().strip()
        text = self._text.toPlainText().strip()
        return f"[{dates}] {text}"

    def tuple(self) -> Tuple[str, str]:
        dates = self._dates.text().strip()
        text = self._text.toPlainText().strip()
        return (text, dates)

    # ------------------------------------------------------------------
    # Lógica de validación y aceptación

    def _revalidate(self) -> None:
        dates_ok = bool(self._dates.text().strip())
        text_ok = bool(self._text.toPlainText().strip())

        # Feedback visual en el campo URL
        self._ok_btn.setEnabled(dates_ok and text_ok)

    def _on_accept(self) -> None:
        # Revalidar por si acaso
        self._revalidate()
        if not self._ok_btn.isEnabled():
            # Marcar foco donde falla
            if not self._dates.text().strip():
                self._dates.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            elif not self._text.toPlainText().strip():
                self._text.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()
