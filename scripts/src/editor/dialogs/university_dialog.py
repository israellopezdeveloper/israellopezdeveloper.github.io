from __future__ import annotations

from typing import Any, Dict, Optional, Tuple

from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import CustomList
from ..widgets.file_select import FileSelect

# Widgets
from ..widgets.html_editor import HtmlEditor

# Dialogs
from .base_dialog import BaseDialog
from .file_dialog import FileDialog

Qt = QtCore.Qt


class UniversityDialog(BaseDialog):
    """Diálogo para estudios universitarios."""

    changed = QtCore.Signal()

    @property
    def title(self) -> str:
        return "Descripción estudio universitario"

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)

        self._university = QtWidgets.QLineEdit(self)
        self._title = QtWidgets.QLineEdit(self)

        self._thumbnail = FileSelect(
            title="Elegir miniatura",
            file_filter="Imágenes (*.png *.jpg *.jpeg *.webp *.gif)",
            must_exist=True,
        )
        self._set_thumb = self._thumbnail.set_value
        self._get_thumb = self._thumbnail.value

        # period_time
        self._start = QtWidgets.QLineEdit(self)
        self._start.setPlaceholderText("e.g. 2018-09")
        self._end = QtWidgets.QLineEdit(self)
        self._end.setPlaceholderText("e.g. 2022-06")
        self._current = QtWidgets.QCheckBox("Actual", self)

        # summary (HTML)
        self._summary = HtmlEditor(show_preview=True, parent=self)
        self._set_summary = self._summary.set_html
        self._get_summary = self._summary.html

        # images (lista)
        self._images = CustomList(
            self,
            dialog_cls=FileDialog,
        )

        # --- Layout ---
        form = QtWidgets.QGridLayout()
        form.addWidget(QtWidgets.QLabel("Universidad"), 0, 0)
        form.addWidget(self._university, 0, 1)
        form.addWidget(QtWidgets.QLabel("Título"), 0, 2)
        form.addWidget(self._title, 0, 3)
        form.addWidget(QtWidgets.QLabel("Thumbnail"), 1, 0)
        form.addWidget(self._thumbnail, 1, 1, 1, 3)

        gdates = QtWidgets.QGridLayout()
        gdates.addWidget(QtWidgets.QLabel("Inicio"), 0, 0)
        gdates.addWidget(self._start, 0, 1)
        gdates.addWidget(QtWidgets.QLabel("Fin"), 0, 2)
        gdates.addWidget(self._end, 0, 3)
        gdates.addWidget(self._current, 0, 4)

        box_summary = QtWidgets.QGroupBox("Resumen (HTML)", self)
        vsm = QtWidgets.QVBoxLayout(box_summary)
        vsm.addWidget(self._summary)

        box_images = QtWidgets.QGroupBox("Imagenes", self)
        vi = QtWidgets.QVBoxLayout(box_images)
        vi.addWidget(self._images)

        left = QtWidgets.QVBoxLayout()
        left.addLayout(form)
        left.addLayout(gdates)
        left.addWidget(box_summary)
        left.addStretch(1)
        wleft = QtWidgets.QWidget(self)
        wleft.setLayout(left)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_images)
        right.addStretch(1)
        wright = QtWidgets.QWidget(self)
        wright.setLayout(right)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        split.setChildrenCollapsible(False)
        split.setOpaqueResize(True)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 4)
        split.setStretchFactor(1, 1)

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)
        self._university.textChanged.connect(self._revalidate)
        self._title.textChanged.connect(self._revalidate)
        self._summary.htmlChanged.connect(self._revalidate)  # type: ignore

    # ---------- API pública ----------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._university.setText(str(data.get("university_name")))
        self._title.setText(str(data.get("title")))
        period = data.get("period_time") or {}
        self._start.setText(str(period.get("start") or data.get("start")))
        self._end.setText(str(period.get("end") or data.get("end")))
        self._current.setChecked(
            bool(period.get("current") if "current" in period else data.get("current"))
        )
        self._set_summary(str(data.get("summary")))
        self._set_thumb(str(data.get("thumbnail")))

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

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        return {
            "university_name": self._university.text().strip(),
            "title": self._title.text().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
            "summary": self._get_summary().strip(),
            "images": list(map(lambda item: item.get("path"), self._images.data())),
            "thumbnail": self._get_thumb().strip(),
        }

    def str(self) -> str:
        uni = self._university.text().strip()
        title = self._title.text().strip()
        date = self._start.text().strip() + " - "
        date += "Actualidad" if self._current.isChecked() else self._end.text().strip()
        return f"[{date}] {uni} — {title}" if date else f"{uni} — {title}"

    def tuple(self) -> Tuple[str, str, str]:
        uni = self._university.text().strip()
        title = self._title.text().strip()
        date = self._start.text().strip() + " - "
        date += "Actualidad" if self._current.isChecked() else self._end.text().strip()
        return (date, uni, title)

    # ---------- Internos ----------
    def _revalidate(self) -> None:
        # Habilita OK si hay al menos university_name o title
        ok = bool(self._university.text().strip() or self._title.text().strip())
        self._ok_btn.setEnabled(ok)

    def _on_accept(self) -> None:
        self._revalidate()
        if not self._ok_btn.isEnabled():
            (
                self._university if not self._university.text().strip() else self._title
            ).setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()


__all__ = ["UniversityDialog"]
