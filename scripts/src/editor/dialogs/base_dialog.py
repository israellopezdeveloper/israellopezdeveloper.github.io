from __future__ import annotations

from abc import ABCMeta, abstractmethod
from typing import Any, Dict, Optional, Tuple
from PySide6 import QtWidgets


class _QDialogABCMeta(ABCMeta, type(QtWidgets.QDialog)):
    pass


class BaseDialog(QtWidgets.QDialog, metaclass=_QDialogABCMeta):
    def __init__(self, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(parent)
        self.setModal(True)
        try:
            self.setWindowTitle(self.title)
        except Exception:
            pass
        # --- Botonera estándar ---
        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel
        )
        self._ok_btn = self._buttons.button(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
        )
        self._ok_btn.setEnabled(False)

    @property
    @abstractmethod
    def title(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def set_value(self, data: Dict[str, Any]) -> None:
        raise NotImplementedError

    @abstractmethod
    def value(self) -> Dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def str(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def tuple(self) -> Tuple:
        raise NotImplementedError

    @abstractmethod
    def _revalidate(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def _on_accept(self) -> None:
        raise NotImplementedError
