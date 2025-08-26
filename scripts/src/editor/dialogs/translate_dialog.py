from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from PySide6 import QtCore, QtWidgets

from .base_dialog import BaseDialog


class TranslateDialog(BaseDialog):
    changed = QtCore.Signal()

    @property
    def title(self) -> str:
        return "Traducir CV"

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

        self._choices = [("es", "Español"), ("en", "Inglés"), ("zh", "Chino")]

        self._src = QtWidgets.QComboBox(self)
        self._tgt = QtWidgets.QComboBox(self)
        for code, label in self._choices:
            self._src.addItem(label, code)
            self._tgt.addItem(label, code)

        # valores por defecto: ES -> EN (ajusta si quieres)
        self._src.setCurrentIndex(0)  # es
        self._tgt.setCurrentIndex(1)  # en

        form = QtWidgets.QFormLayout()
        form.addRow("Origen", self._src)
        form.addRow("Destino", self._tgt)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(self._buttons)

        self._src.currentIndexChanged.connect(self._revalidate)
        self._tgt.currentIndexChanged.connect(self._revalidate)
        self._buttons.accepted.connect(self.accept)
        self._buttons.rejected.connect(self.reject)

        self._revalidate()

    def _revalidate(self) -> None:
        self._ok_btn.setEnabled(self._src.currentData() != self._tgt.currentData())

    def codes(self) -> tuple[str, str]:
        return (self._src.currentData(), self._tgt.currentData())

    def set_value(self, data: Dict[str, Any]) -> None:
        pass

    def value(self) -> Dict[str, Any]:
        return {}

    def str(self) -> str:
        return ""

    def tuple(self) -> Tuple:
        return ()

    def _on_accept(self) -> None:
        pass
