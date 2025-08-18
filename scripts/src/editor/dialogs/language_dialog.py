# src/editor/dialogs/language_dialog.py
from __future__ import annotations

from typing import Any, Dict, List, Optional
from PySide6 import QtCore, QtWidgets

# ---- opcionales con fallback ----
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


# Dialogo específico (si existe)
try:
    from ..dialogs.acreditation_dialog import AcreditationDialog  # type: ignore
except Exception:
    AcreditationDialog = None  # type: ignore


Qt = QtCore.Qt


# ---- fallback de selector de archivo ----
class _FileSelectFallback(QtWidgets.QWidget):
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


# ---- fallback de dialogo de acreditación ----
class _SimpleAcredDialog(QtWidgets.QDialog):
    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        value: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(parent)
        self.setWindowTitle("Acreditación")
        self.setModal(True)
        self._name = QtWidgets.QLineEdit(self)
        self._name.setPlaceholderText("Nombre de la acreditación")
        if value:
            self._name.setText(str(value.get("name") or ""))

        form = QtWidgets.QFormLayout()
        form.addRow("Nombre", self._name)
        buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel,
            parent=self,
        )
        buttons.accepted.connect(self._on_accept)
        buttons.rejected.connect(self.reject)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(buttons)
        self.resize(420, 120)

    def _on_accept(self) -> None:
        if not self._name.text().strip():
            self._name.setFocus(Qt.FocusReason.OtherFocusReason)
            return
        self.accept()

    def value(self) -> Dict[str, Any]:
        return {"name": self._name.text().strip()}


# ---- helpers ----
_ALLOWED = ["Básico", "Intermedio", "Fluido", "Avanzado", "Nativo"]


def _s(v: Any) -> str:
    return "" if v is None else str(v)


def _fmt_acreditation(d: Dict[str, Any] | str) -> str:
    if isinstance(d, str):
        return d
    name = _s((d or {}).get("name"))
    if not name:
        return "(acreditación)"
    return name


def _set_combo_to(cb: QtWidgets.QComboBox, value: str) -> None:
    """Selecciona en el combo el item que coincide (case-insensitive). Si no, deja vacío."""
    val = (value or "").strip()
    if not val:
        cb.setCurrentIndex(0)
        return
    for i in range(cb.count()):
        if cb.itemText(i).casefold() == val.casefold():
            cb.setCurrentIndex(i)
            return
    cb.setCurrentIndex(0)


class LanguageDialog(QtWidgets.QDialog):
    """Diálogo de idioma:
    - language (texto)
    - spoken / writen / read (QComboBox con {Basico, intermedio, fluido, avanzado, nativo})
    - acreditation (lista + modal)
    - thumbnail (selector de imagen)
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Language")
        self.setModal(True)
        self.resize(760, 520)

        # Campos
        self._language = QtWidgets.QLineEdit(self)

        def make_level_combo() -> QtWidgets.QComboBox:
            cb = QtWidgets.QComboBox(self)
            cb.setEditable(False)
            cb.addItem("")  # opción vacía
            for opt in _ALLOWED:
                cb.addItem(opt)
            cb.currentIndexChanged.connect(self._revalidate)
            return cb

        self._spoken = make_level_combo()
        self._writen = make_level_combo()
        self._read = make_level_combo()

        # Thumbnail
        img_filter = "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)"
        if FileSelect is not None:
            self._thumbnail = FileSelect(
                title="Elegir miniatura",
                file_filter=img_filter,
                must_exist=False,
                parent=self,
            )
            self._thumb_set = self._thumbnail.set_value
            self._thumb_get = self._thumbnail.value
        else:
            fs = _FileSelectFallback(filter=img_filter, parent=self)
            self._thumbnail = fs
            self._thumb_set = fs.set_value
            self._thumb_get = fs.value

        # Lista de acreditaciones
        self._acreds = QtWidgets.QListWidget(self)
        enable_reorder(self._acreds)
        self._btn_a_add = QtWidgets.QPushButton("Añadir", self)
        self._btn_a_edit = QtWidgets.QPushButton("Editar", self)
        self._btn_a_del = QtWidgets.QPushButton("Eliminar", self)
        self._btn_a_up = QtWidgets.QPushButton("▲", self)
        self._btn_a_down = QtWidgets.QPushButton("▼", self)

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

        # Layout superior (datos del idioma)
        form = QtWidgets.QFormLayout()
        form.addRow("Idioma", self._language)
        form.addRow("Hablado (spoken)", self._spoken)
        form.addRow("Escrito (writen)", self._writen)
        form.addRow("Leído (read)", self._read)
        form.addRow("Thumbnail", self._thumbnail)

        # Acreditaciones
        box_acreds = QtWidgets.QGroupBox("Acreditaciones", self)
        vac = QtWidgets.QVBoxLayout(box_acreds)
        vac.addWidget(self._acreds)
        row = QtWidgets.QGridLayout()
        row.addWidget(self._btn_a_add, 0, 0)
        row.addWidget(self._btn_a_edit, 0, 1)
        row.addWidget(self._btn_a_del, 0, 2)
        row.addWidget(self._btn_a_up, 0, 3)
        row.addWidget(self._btn_a_down, 0, 4)
        vac.addLayout(row)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        wleft = QtWidgets.QWidget(self)
        wleft.setLayout(form)
        wright = QtWidgets.QWidget(self)
        rlay = QtWidgets.QVBoxLayout(wright)
        rlay.addWidget(box_acreds)
        rlay.addStretch(1)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 2)
        split.setStretchFactor(1, 3)
        split.setSizes([380, 380])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)

        self._language.textChanged.connect(self._revalidate)
        if hasattr(self._thumbnail, "valueChanged"):
            try:
                self._thumbnail.valueChanged.connect(lambda _: self._revalidate())  # type: ignore[attr-defined]
            except Exception:
                pass

        self._btn_a_add.clicked.connect(self._add_acred)
        self._btn_a_edit.clicked.connect(self._edit_acred)
        self._btn_a_del.clicked.connect(lambda: remove_selected(self._acreds))
        self._btn_a_up.clicked.connect(lambda: move_selected(self._acreds, -1))
        self._btn_a_down.clicked.connect(lambda: move_selected(self._acreds, +1))

    # ---- API pública ----
    def set_value(self, data: Dict[str, Any]) -> None:
        self._language.setText(_s(data.get("language")))
        _set_combo_to(self._spoken, _s(data.get("spoken")))
        _set_combo_to(self._writen, _s(data.get("writen")))
        _set_combo_to(self._read, _s(data.get("read")))
        self._thumb_set(_s(data.get("thumbnail")))

        self._acreds.clear()
        for a in data.get("acreditation") or []:
            d = a if isinstance(a, dict) else {"name": _s(a)}
            add_item(self._acreds, _fmt_acreditation(d), d)

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "language": self._language.text().strip(),
            "spoken": (self._spoken.currentText() or "").strip(),
            "writen": (self._writen.currentText() or "").strip(),
            "read": (self._read.currentText() or "").strip(),
            "thumbnail": self._thumb_get().strip(),
            "acreditation": [],
        }
        for i in range(self._acreds.count()):
            it = self._acreds.item(i)
            d = it.data(Qt.ItemDataRole.UserRole) or {}
            out["acreditation"].append(
                dict(d) if isinstance(d, dict) else {"name": str(d)}
            )
        return out

    # ---- Internos ----
    def _revalidate(self) -> None:
        # Requiere al menos 'language' para habilitar OK
        self._ok_btn.setEnabled(bool(self._language.text().strip()))

    def _add_acred(self) -> None:
        dlg = self._make_acred_dialog(None)
        if dlg.exec():
            data = self._dialog_value(dlg)
            if not data:
                return
            add_item(self._acreds, _fmt_acreditation(data), data)

    def _edit_acred(self) -> None:
        it = self._acreds.currentItem()
        if not it:
            return
        cur = it.data(Qt.ItemDataRole.UserRole) or {}
        dlg = self._make_acred_dialog(cur)
        if dlg.exec():
            data = self._dialog_value(dlg)
            if not data:
                return
            it.setText(_fmt_acreditation(data))
            it.setData(Qt.ItemDataRole.UserRole, data)

    def _make_acred_dialog(self, value: Optional[Dict[str, Any]]) -> QtWidgets.QDialog:
        if AcreditationDialog is not None:
            dlg = AcreditationDialog(self)
            if value and hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(value)
                except Exception:
                    pass
            return dlg
        return _SimpleAcredDialog(self, value)

    def _on_accept(self) -> None:
        # Revalida antes de cerrar
        self._revalidate()
        if not self._ok_btn.isEnabled():
            # Enfoca el primer campo problemático (language vacío)
            if not self._language.text().strip():
                self._language.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()

    @staticmethod
    def _dialog_value(dlg: QtWidgets.QDialog) -> Dict[str, Any]:
        if hasattr(dlg, "value"):
            try:
                v = dlg.value()
                if isinstance(v, dict):
                    return v
            except Exception:
                pass
        return {}


__all__ = ["LanguageDialog"]
