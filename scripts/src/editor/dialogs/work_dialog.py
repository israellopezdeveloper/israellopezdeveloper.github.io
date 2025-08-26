# src/editor/dialogs/work_dialog.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import CustomList

# Widgets
from ..widgets.file_select import FileSelect
from ..widgets.html_editor import HtmlEditor

# Dialogs
from .base_dialog import BaseDialog
from .file_dialog import FileDialog
from .link_dialog import LinkDialog
from .project_dialog import ProjectDialog

Qt = QtCore.Qt


# -------------------- Formulario de un trabajo --------------------
class WorkDialog(BaseDialog):
    """Diálogo modal para crear/editar un trabajo."""

    changed = QtCore.Signal()

    @property
    def title(self) -> str:
        return "Descripción trabajo"

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
    ) -> None:
        super().__init__(parent)

        # --- Campos ---
        self._name = QtWidgets.QLineEdit()

        # short_description (texto plano)
        self._short_desc = QtWidgets.QPlainTextEdit()
        self._short_desc.setPlaceholderText("Descripción breve…")

        # thumbnail (selector de imagen)
        self._thumbnail = FileSelect(
            title="Elegir miniatura",
            file_filter="Imágenes (*.png *.jpg *.jpeg *.webp *.gif)",
            must_exist=True,
        )
        self._set_thumb = self._thumbnail.set_value
        self._get_thumb = self._thumbnail.value

        # period_time (start, end, current)
        self._start = QtWidgets.QLineEdit()
        self._start.setPlaceholderText("e.g. 2022-01")
        self._end = QtWidgets.QLineEdit()
        self._end.setPlaceholderText("e.g. 2024-06")
        self._current = QtWidgets.QCheckBox("Actual")

        # full_description (HTML)
        self._full_desc = HtmlEditor(show_preview=True, parent=self)
        self._set_full = self._full_desc.set_html
        self._get_full = self._full_desc.html

        # contribution (HTML)
        self._contrib = HtmlEditor(show_preview=True, parent=self)
        self._set_contrib = self._contrib.set_html
        self._get_contrib = self._contrib.html

        # links (lista de dicts)
        self._links = CustomList(
            self,
            dialog_cls=LinkDialog,
        )

        # projects (lista; **abre modal** al añadir/editar)
        self._projects = CustomList(
            self,
            dialog_cls=ProjectDialog,
        )

        # images (lista de rutas de imagen)
        self._images = CustomList(
            self,
            dialog_cls=FileDialog,
        )

        # fila 1: name + thumbnail
        grid = QtWidgets.QGridLayout()
        grid.addWidget(QtWidgets.QLabel("Empresa"), 0, 0)
        grid.addWidget(self._name, 0, 1)
        grid.addWidget(QtWidgets.QLabel("Thumbnail"), 0, 2)
        grid.addWidget(self._thumbnail, 0, 3)

        # period_time
        gdates = QtWidgets.QGridLayout()
        gdates.addWidget(QtWidgets.QLabel("Inicio"), 0, 0)
        gdates.addWidget(self._start, 0, 1)
        gdates.addWidget(QtWidgets.QLabel("Fin"), 0, 2)
        gdates.addWidget(self._end, 0, 3)
        gdates.addWidget(self._current, 0, 4)

        # short_description
        box_short = QtWidgets.QGroupBox("Descripción breve (texto plano)")
        vshort = QtWidgets.QVBoxLayout(box_short)
        vshort.addWidget(self._short_desc)

        # full_description
        box_full = QtWidgets.QGroupBox("Descripción completa (HTML)")
        vfull = QtWidgets.QVBoxLayout(box_full)
        vfull.addWidget(self._full_desc)

        # contribution
        box_contrib = QtWidgets.QGroupBox("Contribución (HTML)")
        vcon = QtWidgets.QVBoxLayout(box_contrib)
        vcon.addWidget(self._contrib)

        box_links = QtWidgets.QGroupBox("Links", self)
        vl = QtWidgets.QVBoxLayout(box_links)
        vl.addWidget(self._links)

        box_projects = QtWidgets.QGroupBox("Projects", self)
        vl = QtWidgets.QVBoxLayout(box_projects)
        vl.addWidget(self._projects)

        box_images = QtWidgets.QGroupBox("Imagenes", self)
        vl = QtWidgets.QVBoxLayout(box_images)
        vl.addWidget(self._images)

        left = QtWidgets.QVBoxLayout()
        left.addLayout(grid)
        left.addLayout(gdates)
        left.addWidget(box_short)
        left.addWidget(box_full)
        left.addWidget(box_contrib)
        left.addStretch(1)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_links)
        right.addWidget(box_projects)
        right.addWidget(box_images)
        right.addStretch(1)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        wleft = QtWidgets.QWidget()
        wleft.setLayout(left)
        wright = QtWidgets.QWidget()
        wright.setLayout(right)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([900, 500])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        self._buttons.accepted.connect(self.accept)
        self._buttons.rejected.connect(self.reject)

    def _connect(self) -> None:
        self._name.textChanged.connect(self.changed)
        self._short_desc.textChanged.connect(self.changed)
        self._start.textChanged.connect(self.changed)
        self._end.textChanged.connect(self.changed)
        self._current.toggled.connect(self.changed)
        if hasattr(self._full_desc, "htmlChanged"):
            self._full_desc.htmlChanged.connect(self.changed)  # type: ignore
        if hasattr(self._contrib, "htmlChanged"):
            self._contrib.htmlChanged.connect(self.changed)  # type: ignore

    def _collect_existing_techs(self) -> List[str]:
        """Agrupa tecnologías de los proyectos ya listados (para sugerencias)."""
        seen = set()
        for item in self._projects.data():
            for t in item.get("technologies") or []:
                if t:
                    seen.add(str(t))
        return list(seen)

    # ----- carga/volcado -----
    def set_value(self, data: Dict[str, Any]) -> None:
        self._name.setText(str(data.get("name")))
        self._short_desc.setPlainText(str(data.get("short_description")))
        self._set_thumb(str(data.get("thumbnail")))

        period = data.get("period_time") or {}
        start = str(period.get("start") or data.get("start"))
        end = str(period.get("end") or data.get("end"))
        current = bool(
            period.get("current") if "current" in period else data.get("current")
        )
        self._start.setText(start)
        self._end.setText(end)
        self._current.setChecked(current)

        self._set_full(str(data.get("full_description")))
        self._set_contrib(str(data.get("contribution")))

        self._links.setData(data.get("links") or [])

        self._projects.setData(data.get("projects") or [])

        self._images.setData(
            list(
                map(
                    lambda img: (
                        {
                            "path": img,
                        }
                        if isinstance(img, str)
                        else img
                    ),
                    data.get("images") or [],
                )
            )
        )

    def value(self) -> Dict[str, Any]:
        return {
            "name": self._name.text().strip(),
            "short_description": self._short_desc.toPlainText().strip(),
            "thumbnail": self._get_thumb().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
            "full_description": self._get_full().strip(),
            "contribution": self._get_contrib().strip(),
            "links": self._links.data(),
            "projects": self._projects.data(),
            "images": list(map(lambda item: item.get("path"), self._images.data())),
        }

    def str(self) -> str:
        dates = self._start.text().strip() + " - "
        dates += "Actualidad" if self._current.isChecked() else self._end.text().strip()
        name = self._name.text().strip()
        return f"[{dates}] {name}"

    def tuple(self) -> Tuple[str, str]:
        dates = self._start.text().strip() + " - "
        dates += "Actualidad" if self._current else self._end.text().strip()
        name = self._name.text().strip()
        return (dates, name)


__all__ = ["WorkDialog"]
