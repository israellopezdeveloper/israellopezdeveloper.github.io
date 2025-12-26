# -*- coding: utf-8 -*-
from __future__ import annotations

import os
from pathlib import Path

from editor.dialogs.base_dir_dialog import BaseDirDialog
from PySide6 import QtWidgets

from .window import MainWindow


def main() -> int:
    # Evita logs wayland molestos (opcional)
    os.environ.setdefault(
        "QT_LOGGING_RULES", "qt.qpa.wayland.textinput=false;qt.qpa.wayland.input=false"
    )

    app = QtWidgets.QApplication([])

    # 1) Modal inicial: elegir carpeta base
    base_dlg = BaseDirDialog()
    if not base_dlg.exec():
        # Usuario canceló => salir sin abrir la app
        return 0
    base_dir = base_dlg.base_dir()  # Path

    # 2) Crear ventana principal con esa base
    w = MainWindow(base_dir=Path(base_dir))
    w.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
