from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import CustomList

# Widgets
from ..widgets.html_editor import HtmlEditor
from ..widgets.file_select import FileSelect

# Dialogs
from .file_dialog import FileDialog
from .base_dialog import BaseDialog


Qt = QtCore.Qt


class ComplementaryDialog(BaseDialog):
    """Diálogo para formación complementaria:
    - institution (texto)
    - title (texto)
    - period_time (start, end, current)
    - summary (HTML)
    - images (lista)
    - thumbnail (selector de imagen)
    """

    @property
    def title(self) -> str:
        return "Complementario"

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        suggestions: List[str] = [],
        dialog_dir: Path = Path.cwd(),
    ) -> None:
        super().__init__(
            parent,
            suggestions=suggestions,
            dialog_dir=dialog_dir,
        )

        # --- Campos principales ---
        self._institution = QtWidgets.QLineEdit(self)
        self._title = QtWidgets.QLineEdit(self)

        self._thumbnail = FileSelect(
            title="Elegir miniatura",
            file_filter="Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
            must_exist=False,
            parent=self,
            dialog_dir=self._dialog_dir,
        )
        self._thumb_set = self._thumbnail.set_value
        self._thumb_get = self._thumbnail.value

        # period_time
        self._start = QtWidgets.QLineEdit(self)
        self._start.setPlaceholderText("e.g. 2021-03")
        self._end = QtWidgets.QLineEdit(self)
        self._end.setPlaceholderText("e.g. 2021-07")
        self._current = QtWidgets.QCheckBox("Actual", self)

        # summary (HTML)
        self._summary = HtmlEditor(show_preview=True, parent=self)
        self._set_summary = self._summary.set_html
        self._get_summary = self._summary.html

        # images (lista)
        self._images = CustomList(
            self,
            dialog_cls=FileDialog,
            dialog_dir=self._dialog_dir,
        )

        # --- Layout ---
        form = QtWidgets.QGridLayout()
        form.addWidget(QtWidgets.QLabel("Institución"), 0, 0)
        form.addWidget(self._institution, 0, 1)
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

        box_images = QtWidgets.QGroupBox("Imágenes", self)
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
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([620, 380])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)
        self._institution.textChanged.connect(self._revalidate)
        self._title.textChanged.connect(self._revalidate)
        self._summary.htmlChanged.connect(self._revalidate)
        try:
            self._thumbnail.valueChanged.connect(lambda _: self._revalidate())
        except Exception:
            pass

    # ---------- API pública ----------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._institution.setText(str(data.get("institution")))
        self._title.setText(str(data.get("title")))
        period = data.get("period_time") or {}
        self._start.setText(str(period.get("start") or data.get("start")))
        self._end.setText(str(period.get("end") or data.get("end")))
        self._current.setChecked(
            bool(period.get("current") if "current" in period else data.get("current"))
        )
        self._set_summary(str(data.get("summary")))
        self._thumb_set(str(data.get("thumbnail")))

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
            "institution": self._institution.text().strip(),
            "title": self._title.text().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
            "summary": self._get_summary().strip(),
            "images": list(map(lambda item: item.get("path"), self._images.data())),
            "thumbnail": self._thumb_get().strip(),
        }

    def str(self) -> str:
        uni = self._institution.text().strip()
        title = self._title.text().strip()
        date = self._start.text().strip() + " - "
        date += "Actualidad" if self._current.isChecked() else self._end.text().strip()
        return f"[{date}] {uni} — {title}" if date else f"{uni} — {title}"

    def tuple(self) -> Tuple[str, str, str]:
        uni = self._institution.text().strip()
        title = self._title.text().strip()
        date = self._start.text().strip() + " - "
        date += "Actualidad" if self._current.isChecked() else self._end.text().strip()
        return (date, uni, title)

    # ---------- Internos ----------
    def _revalidate(self) -> None:
        ok = bool(self._institution.text().strip() or self._title.text().strip())
        self._ok_btn.setEnabled(ok)

    def _on_accept(self) -> None:
        self._revalidate()
        if not self._ok_btn.isEnabled():
            (
                self._institution
                if not self._institution.text().strip()
                else self._title
            ).setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()


__all__ = ["ComplementaryDialog"]
