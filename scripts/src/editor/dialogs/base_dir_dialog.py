# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path
from typing import Optional

from PySide6 import QtWidgets


class BaseDirDialog(QtWidgets.QDialog):
    """
    Diálogo para elegir la carpeta base del proyecto.
    Crea (si no existen) los subdirectorios:
      - public/images/intro
      - public/images/works
      - public/images/educations
      - public/cv
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Carpeta base del proyecto")
        self.setModal(True)

        self._edit = QtWidgets.QLineEdit()
        self._btn_browse = QtWidgets.QPushButton("Examinar…")
        self._btn_browse.setAutoDefault(False)

        form = QtWidgets.QFormLayout()
        form.addRow("Carpeta base:", self._edit)

        browse_row = QtWidgets.QHBoxLayout()
        browse_row.addStretch(1)
        browse_row.addWidget(self._btn_browse)

        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel
        )
        self._ok = self._buttons.button(QtWidgets.QDialogButtonBox.StandardButton.Ok)
        self._ok.setEnabled(False)

        root = QtWidgets.QVBoxLayout(self)
        lbl = QtWidgets.QLabel(
            "Elige la carpeta base. Se usarán estos subdirectorios:\n"
            "  • public/images/intro\n"
            "  • public/images/works\n"
            "  • public/images/educations\n"
            "  • public/cv"
        )
        lbl.setWordWrap(True)
        root.addWidget(lbl)
        root.addLayout(form)
        root.addLayout(browse_row)
        root.addWidget(self._buttons)

        # Conexiones
        self._btn_browse.clicked.connect(self._on_browse)
        self._edit.textChanged.connect(self._revalidate)
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)

        # Sugerir HOME
        self._edit.setText(str(Path.home()))

    # ---- API ----
    def base_dir(self) -> Path:
        return Path(self._edit.text()).expanduser().resolve()

    # ---- Internos ----
    def _on_browse(self) -> None:
        start = self._edit.text() or str(Path.home())
        chosen = QtWidgets.QFileDialog.getExistingDirectory(
            self, "Selecciona carpeta base", start
        )
        if chosen:
            self._edit.setText(chosen)

    def _revalidate(self) -> None:
        ok = False
        try:
            p = Path(self._edit.text()).expanduser()
            ok = p.exists() and p.is_dir()
        except Exception:
            ok = False
        self._ok.setEnabled(ok)

    def _on_accept(self) -> None:
        # Crea las carpetas requeridas
        base = self.base_dir()
        try:
            (base / "public" / "images" / "intro").mkdir(parents=True, exist_ok=True)
            (base / "public" / "images" / "works").mkdir(parents=True, exist_ok=True)
            (base / "public" / "images" / "educations").mkdir(
                parents=True, exist_ok=True
            )
            (base / "public" / "cv").mkdir(parents=True, exist_ok=True)
        except Exception as e:
            QtWidgets.QMessageBox.critical(
                self, "Error", f"No se pudieron crear carpetas:\n{e}"
            )
            return
        self.accept()
