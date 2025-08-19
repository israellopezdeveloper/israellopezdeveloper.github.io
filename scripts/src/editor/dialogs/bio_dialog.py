from typing import Any, Dict, Optional
from PySide6 import QtWidgets


class BioDialog(QtWidgets.QDialog):
    """Fallback minimal: fields {dates, text} en texto plano."""

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        value: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(parent)
        self.setWindowTitle("Bio item")
        self.setModal(True)
        self.resize(520, 260)
        self._dates = QtWidgets.QLineEdit(self)
        self._text = QtWidgets.QPlainTextEdit(self)
        if value:
            self._dates.setText(str(value.get("dates")))
            self._text.setPlainText(str(value.get("text")))
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

    def value(self) -> Dict[str, Any]:
        return {
            "dates": self._dates.text().strip(),
            "text": self._text.toPlainText().strip(),
        }
