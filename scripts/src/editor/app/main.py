from PySide6 import QtWidgets
from .window import MainWindow


def main() -> int:
    app = QtWidgets.QApplication([])
    w = MainWindow()
    w.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
