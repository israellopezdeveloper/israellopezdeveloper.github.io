# --- Diálogo de idiomas ---
from typing import Optional
from PySide6 import QtWidgets


class TranslateDialog(QtWidgets.QDialog):
    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Traducir JSON")

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

        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        self._ok = self._buttons.button(QtWidgets.QDialogButtonBox.StandardButton.Ok)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(self._buttons)

        self._src.currentIndexChanged.connect(self._revalidate)
        self._tgt.currentIndexChanged.connect(self._revalidate)
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)

        self._revalidate()

    def _revalidate(self) -> None:
        self._ok.setEnabled(self._src.currentData() != self._tgt.currentData())

    def _on_accept(self) -> None:
        if self._ok.isEnabled():
            self.accept()

    def codes(self) -> tuple[str, str]:
        return (self._src.currentData(), self._tgt.currentData())
