# src/editor/dialogs/acreditation_dialog.py
from __future__ import annotations

from typing import Any, Dict, Optional
from PySide6 import QtCore, QtWidgets

Qt = QtCore.Qt


def _s(v: Any) -> str:
    return "" if v is None else str(v)


class AcreditationDialog(QtWidgets.QDialog):
    """Diálogo de acreditación (mínimo):
    - institution (texto)
    - title (texto)
    - period_time { start, end, current }
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Acreditación")
        self.setModal(True)
        self.resize(560, 220)

        # Campos
        self._institution = QtWidgets.QLineEdit(self)
        self._title = QtWidgets.QLineEdit(self)

        self._start = QtWidgets.QLineEdit(self)
        self._start.setPlaceholderText("YYYY-MM")
        self._end = QtWidgets.QLineEdit(self)
        self._end.setPlaceholderText("YYYY-MM")
        self._current = QtWidgets.QCheckBox("Actual", self)

        # Botonera
        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        self._ok_btn = self._buttons.button(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
        )
        self._ok_btn.setEnabled(False)

        # Layout
        form = QtWidgets.QFormLayout()
        form.addRow("Institución", self._institution)
        form.addRow("Título", self._title)

        gdates = QtWidgets.QGridLayout()
        gdates.addWidget(QtWidgets.QLabel("Inicio"), 0, 0)
        gdates.addWidget(self._start, 0, 1)
        gdates.addWidget(QtWidgets.QLabel("Fin"), 0, 2)
        gdates.addWidget(self._end, 0, 3)
        gdates.addWidget(self._current, 0, 4)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addLayout(gdates)
        root.addStretch(1)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)

        self._institution.textChanged.connect(self._revalidate)
        self._title.textChanged.connect(self._revalidate)
        self._start.textChanged.connect(self._revalidate)
        self._end.textChanged.connect(self._revalidate)
        self._current.toggled.connect(self._revalidate)

    # -------- API pública --------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._institution.setText(_s(data.get("institution")))
        self._title.setText(_s(data.get("title")))
        period = data.get("period_time") or {}
        self._start.setText(_s(period.get("start") or data.get("start")))
        self._end.setText(_s(period.get("end") or data.get("end")))
        self._current.setChecked(
            bool(period.get("current") if "current" in period else data.get("current"))
        )
        self._revalidate()

    def value(self) -> Dict[str, Any]:
        return {
            "institution": self._institution.text().strip(),
            "title": self._title.text().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
        }

    # -------- Internos --------
    def _revalidate(self) -> None:
        # Habilita OK si hay al menos institution o title
        ok = bool(self._institution.text().strip() or self._title.text().strip())
        self._ok_btn.setEnabled(ok)

    def _on_accept(self) -> None:
        self._revalidate()
        if not self._ok_btn.isEnabled():
            (
                self._institution
                if not self._institution.text().strip()
                else self._title
            ).setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()


__all__ = ["AcreditationDialog"]
