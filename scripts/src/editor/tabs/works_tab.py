from __future__ import annotations

from typing import Any, Dict, List, Optional
from PySide6 import QtCore, QtWidgets

from editor.dialogs.work_dialog import WorkDialog
from editor.utils.lists import (
    CustomList,
)

Qt = QtCore.Qt


# -------------------- Tab contenedor (lista de trabajos) --------------------
class WorksTab(QtWidgets.QWidget):
    """Pestaña de 'Works' como LISTA. Crear/editar se hace en modal."""

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self._list = CustomList(
            self,
            dialog_cls=WorkDialog,
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

    def value(self) -> List[Dict[str, Any]]:
        return self._list.data()


__all__ = ["WorksTab"]
