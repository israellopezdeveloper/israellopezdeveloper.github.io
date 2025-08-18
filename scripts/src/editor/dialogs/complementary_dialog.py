# src/editor/dialogs/complementary_dialog.py
from __future__ import annotations

from typing import Any, Dict, List, Optional
from PySide6 import QtCore, QtWidgets

# ---- opcionales con fallback ----
try:
    from ..widgets.html_editor import HtmlEditor
except Exception:
    HtmlEditor = None  # type: ignore

try:
    from ..widgets.file_select import FileSelect
except Exception:
    FileSelect = None  # type: ignore

try:
    from ..utils.lists import enable_reorder, move_selected, remove_selected, add_item
except Exception:

    def enable_reorder(lw: QtWidgets.QListWidget) -> None:
        lw.setDragEnabled(True)
        lw.setAcceptDrops(True)
        lw.setDefaultDropAction(QtCore.Qt.DropAction.MoveAction)
        lw.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
        lw.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)

    def move_selected(lw: QtWidgets.QListWidget, delta: int) -> None:
        rows = sorted({i.row() for i in lw.selectedIndexes()})
        if not rows:
            return
        iterable = reversed(rows) if delta > 0 else rows
        moved: List[int] = []
        for r in iterable:
            nr = r + delta
            if 0 <= nr < lw.count():
                it = lw.takeItem(r)
                lw.insertItem(nr, it)
                moved.append(nr)
        lw.clearSelection()
        for r in moved:
            it = lw.item(r)
            if it:
                it.setSelected(True)
        if moved:
            lw.setCurrentRow(moved[-1])

    def remove_selected(lw: QtWidgets.QListWidget) -> None:
        for r in sorted({i.row() for i in lw.selectedIndexes()}, reverse=True):
            lw.takeItem(r)

    def add_item(
        lw: QtWidgets.QListWidget,
        text: str,
        data: Any | None = None,
        *,
        role: int = int(QtCore.Qt.ItemDataRole.UserRole),
    ) -> QtWidgets.QListWidgetItem:
        it = QtWidgets.QListWidgetItem(text)
        if data is not None:
            it.setData(role, data)
        lw.addItem(it)
        return it


Qt = QtCore.Qt


def _s(v: Any) -> str:
    return "" if v is None else str(v)


class _FileSelectFallback(QtWidgets.QWidget):
    """Selector simple de archivo cuando no existe FileSelect."""

    valueChanged = QtCore.Signal(str)

    def __init__(
        self, *, filter: str = "Todos (*)", parent: Optional[QtWidgets.QWidget] = None
    ) -> None:
        super().__init__(parent)
        self._filter = filter
        self._edit = QtWidgets.QLineEdit(self)
        btn = QtWidgets.QPushButton("…", self)
        btn.setFixedWidth(28)
        lay = QtWidgets.QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.addWidget(self._edit)
        lay.addWidget(btn)
        btn.clicked.connect(self._pick)
        self._edit.textChanged.connect(self.valueChanged)

    def _pick(self) -> None:
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Elegir imagen", "", self._filter
        )
        if fn:
            self._edit.setText(fn)

    def value(self) -> str:
        return self._edit.text().strip()

    def set_value(self, v: str) -> None:
        self._edit.setText(v or "")


class ComplementaryDialog(QtWidgets.QDialog):
    """Diálogo para formación complementaria:
    - institution (texto)
    - title (texto)
    - period_time (start, end, current)
    - summary (HTML)
    - images (lista)
    - thumbnail (selector de imagen)
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Complementary")
        self.setModal(True)
        self.resize(900, 640)

        # --- Campos principales ---
        self._institution = QtWidgets.QLineEdit(self)
        self._title = QtWidgets.QLineEdit(self)

        img_filter = "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)"
        if FileSelect is not None:
            self._thumbnail = FileSelect(
                title="Elegir miniatura",
                file_filter=img_filter,
                must_exist=True,
                parent=self,
            )
            self._thumb_set = self._thumbnail.set_value
            self._thumb_get = self._thumbnail.value
        else:
            fs = _FileSelectFallback(filter=img_filter, parent=self)
            self._thumbnail = fs
            self._thumb_set = fs.set_value
            self._thumb_get = fs.value

        # period_time
        self._start = QtWidgets.QLineEdit(self)
        self._start.setPlaceholderText("e.g. 2021-03")
        self._end = QtWidgets.QLineEdit(self)
        self._end.setPlaceholderText("e.g. 2021-07")
        self._current = QtWidgets.QCheckBox("Actual", self)

        # summary (HTML)
        if HtmlEditor:
            self._summary = HtmlEditor(show_preview=True, parent=self)
            self._set_summary = self._summary.set_html
            self._get_summary = self._summary.html
        else:
            self._summary = QtWidgets.QPlainTextEdit(self)
            self._set_summary = self._summary.setPlainText  # type: ignore
            self._get_summary = self._summary.toPlainText  # type: ignore

        # images (lista)
        self._images = QtWidgets.QListWidget(self)
        enable_reorder(self._images)
        self._btn_i_add = QtWidgets.QPushButton("Añadir", self)
        self._btn_i_edit = QtWidgets.QPushButton("Cambiar…", self)
        self._btn_i_del = QtWidgets.QPushButton("Eliminar", self)
        self._btn_i_up = QtWidgets.QPushButton("▲", self)
        self._btn_i_down = QtWidgets.QPushButton("▼", self)

        # Botonera
        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        self._ok_btn = self._buttons.button(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
        )
        self._ok_btn.setEnabled(False)

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
        row = QtWidgets.QGridLayout()
        row.addWidget(self._btn_i_add, 0, 0)
        row.addWidget(self._btn_i_edit, 0, 1)
        row.addWidget(self._btn_i_del, 0, 2)
        row.addWidget(self._btn_i_up, 0, 3)
        row.addWidget(self._btn_i_down, 0, 4)
        vi.addLayout(row)

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
        if hasattr(self._summary, "htmlChanged"):
            self._summary.htmlChanged.connect(self._revalidate)  # type: ignore
        if hasattr(self._thumbnail, "valueChanged"):
            try:
                self._thumbnail.valueChanged.connect(lambda _: self._revalidate())  # type: ignore[attr-defined]
            except Exception:
                pass

        self._btn_i_add.clicked.connect(self._add_image)
        self._btn_i_edit.clicked.connect(self._edit_image)
        self._btn_i_del.clicked.connect(lambda: remove_selected(self._images))
        self._btn_i_up.clicked.connect(lambda: move_selected(self._images, -1))
        self._btn_i_down.clicked.connect(lambda: move_selected(self._images, +1))

    # ---------- API pública ----------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._institution.setText(_s(data.get("institution")))
        self._title.setText(_s(data.get("title")))
        period = data.get("period_time") or {}
        self._start.setText(_s(period.get("start") or data.get("start")))
        self._end.setText(_s(period.get("end") or data.get("end")))
        self._current.setChecked(
            bool(period.get("current") if "current" in period else data.get("current"))
        )
        self._set_summary(_s(data.get("summary")))
        self._thumb_set(_s(data.get("thumbnail")))

        self._images.clear()
        for p in data.get("images") or []:
            path = _s(p)
            it = QtWidgets.QListWidgetItem(path)
            it.setData(Qt.ItemDataRole.UserRole, path)
            self._images.addItem(it)

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "institution": self._institution.text().strip(),
            "title": self._title.text().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
            "summary": self._get_summary().strip(),
            "images": [],
            "thumbnail": self._thumb_get().strip(),
        }
        for i in range(self._images.count()):
            it = self._images.item(i)
            path: str = it.data(Qt.ItemDataRole.UserRole) or ""
            if path:
                out["images"].append(path)
        return out

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

    def _add_image(self) -> None:
        fns, _ = QtWidgets.QFileDialog.getOpenFileNames(
            self,
            "Añadir imágenes",
            "",
            "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
        )
        for fn in fns or []:
            it = QtWidgets.QListWidgetItem(fn)
            it.setData(Qt.ItemDataRole.UserRole, fn)
            self._images.addItem(it)

    def _edit_image(self) -> None:
        it = self._images.currentItem()
        if not it:
            return
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self,
            "Cambiar imagen",
            "",
            "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
        )
        if fn:
            it.setText(fn)
            it.setData(Qt.ItemDataRole.UserRole, fn)


__all__ = ["ComplementaryDialog"]
