from __future__ import annotations

from pathlib import Path
from typing import Any, List, Optional

from editor.widgets.file_select import FileSelect
from PySide6 import QtCore, QtWidgets

from .base_dialog import BaseDialog


class FileDialog(BaseDialog):
    @property
    def title(self) -> str:
        return "Seleccionar imagen"

    changed = QtCore.Signal()

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        suggestions: List[str] = [],
        dialog_dir: Path = Path.cwd(),
    ):
        super().__init__(
            parent,
            suggestions=suggestions,
            dialog_dir=dialog_dir,
        )
        self._file = FileSelect(
            title="Elegir imagen de perfil",
            file_filter="Imágenes (*.png *.jpg *.jpeg *.webp *.gif *.svg);;Todos (*)",
            must_exist=False,
            parent=self,
            dialog_dir=self._dialog_dir,
        )
        lay = QtWidgets.QVBoxLayout(self)
        lay.addWidget(self._file)
        lay.addWidget(self._buttons)
        self._buttons.accepted.connect(self.accept)
        self._buttons.rejected.connect(self.reject)
        self._revalidate()

    def set_value(self, data: dict[str, Any]) -> None:
        self._file.set_value(data if isinstance(data, str) else data.get("path", ""))
        self._revalidate()

    def value(self) -> dict[str, Any]:
        return {
            "path": self._file.value(),
        }

    def str(self) -> str:
        return self._file.value()

    def tuple(self) -> tuple[str]:
        return (self._file.value(),)

    def _revalidate(self) -> None:
        self._ok_btn.setEnabled(bool(self._file.value() != ""))
