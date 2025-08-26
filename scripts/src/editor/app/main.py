from PySide6 import QtWidgets
from .window import MainWindow
import os


def main() -> int:
    os.environ.setdefault(
        "QT_LOGGING_RULES", "qt.qpa.wayland.textinput=false;qt.qpa.wayland.input=false"
    )
    app = QtWidgets.QApplication([])
    w = MainWindow()
    w.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
