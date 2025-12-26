from __future__ import annotations

import os

from editor.app_desktop import MainWindow
from PySide6 import QtCore, QtGui, QtWidgets


def main():
    # Opcional: ayudar a Qt con HiDPI vía variables de entorno
    os.environ.setdefault("QT_ENABLE_HIGHDPI_SCALING", "1")
    os.environ.setdefault("QT_SCALE_FACTOR_ROUNDING_POLICY", "PassThrough")

    app = QtWidgets.QApplication([])

    # Opcional: política de redondeo de factor de escala (Qt6)
    QtGui.QGuiApplication.setHighDpiScaleFactorRoundingPolicy(
        QtCore.Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )

    win = MainWindow()
    win.show()
    app.exec()


if __name__ == "__main__":
    main()
