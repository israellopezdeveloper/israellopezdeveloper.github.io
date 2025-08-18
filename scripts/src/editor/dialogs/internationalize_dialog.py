from PySide6 import QtWidgets


class InternationalizeDialog(QtWidgets.QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Internationalize")
        self.setModal(True)

        lab_src = QtWidgets.QLabel("Idioma de origen:")
        self.cmb_src = QtWidgets.QComboBox()
        # (texto, código)
        self.cmb_src.addItem("Español", "es")
        self.cmb_src.addItem("Inglés", "en")
        self.cmb_src.addItem("Chino", "zh")

        lab_ratio = QtWidgets.QLabel("Ratio resumen (0-1):")
        self.sp_ratio = QtWidgets.QDoubleSpinBox()
        self.sp_ratio.setRange(0.05, 1.0)
        self.sp_ratio.setSingleStep(0.05)
        self.sp_ratio.setValue(0.5)
        self.sp_ratio.setDecimals(2)

        form = QtWidgets.QFormLayout()
        form.addRow(lab_src, self.cmb_src)
        form.addRow(lab_ratio, self.sp_ratio)

        btns = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel
        )
        btns.accepted.connect(self.accept)
        btns.rejected.connect(self.reject)

        v = QtWidgets.QVBoxLayout(self)
        v.addLayout(form)
        v.addWidget(btns)

    def values(self) -> tuple[str, float]:
        return self.cmb_src.currentData(), float(self.sp_ratio.value())
