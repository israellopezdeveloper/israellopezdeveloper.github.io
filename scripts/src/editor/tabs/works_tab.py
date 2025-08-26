from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from editor.dialogs.work_dialog import WorkDialog
from editor.models.schema import get_technologies
from editor.utils.lists import CustomList
from PySide6 import QtCore, QtWidgets

Qt = QtCore.Qt


# -------------------- Tab contenedor (lista de trabajos) --------------------
class WorksTab(QtWidgets.QWidget):
    """Pestaña de 'Works' como LISTA. Crear/editar se hace en modal."""

    changed = QtCore.Signal()

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        dialog_dir: Path = Path.cwd(),
    ) -> None:
        super().__init__(parent)

        self._dialog_dir = dialog_dir

        self._list = CustomList(
            self,
            dialog_cls=WorkDialog,
            suggestions=[],
            dialog_dir=self._dialog_dir,
        )
        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(self._list)

    # ---------- Data API ----------
    def from_data(self, works: List[Dict[str, Any]]) -> None:
        """
        Acepta:
          - lista de trabajos: [ {...}, {...} ]
          - dict con clave 'works': { "works": [ {...} ] }
          - dict de un único trabajo (para compatibilidad): { ... }
          - None
        """
        self._list.setData(works)
        self._list.set_suggestions(get_technologies(works))

    def value(self) -> List[Dict[str, Any]]:
        return self._list.data()


__all__ = ["WorksTab"]
