# src/editor/dialogs/project_dialog.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
from PySide6 import QtCore, QtWidgets

# ------- opcionales con fallback -------
try:
    from ..widgets.html_editor import HtmlEditor  # editor + preview HTML
except Exception:
    HtmlEditor = None  # type: ignore

try:
    from ..dialogs.link_dialog import LinkDialog  # diálogo de link
except Exception:
    LinkDialog = None  # type: ignore

try:
    from ..utils.lists import enable_reorder, move_selected, remove_selected, add_item
except Exception:
    # Fallbacks mínimos para no depender de utils.lists
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


# -------- utilidades simples --------
def _s(v: Any) -> str:
    return "" if v is None else str(v)


def _to_link_tuple(d: Dict[str, Any]) -> Tuple[str, str, str]:
    return (_s(d.get("text")), _s(d.get("url")), _s(d.get("icon")))


def _to_link_dict(t: Tuple[str, str, str]) -> Dict[str, str]:
    text, url, icon = t
    out = {"text": text, "url": url}
    if icon:
        out["icon"] = icon
    return out


def _fmt_link(text: str, url: str, icon: str) -> str:
    return f"[{icon}] {text} — {url}" if icon else f"{text} — {url}"


# -------- componente propio: TechList --------
class TechList(QtWidgets.QWidget):
    """
    Lista de tecnologías con campo de entrada y sugerencias.
    - Deduplica case-insensitive.
    - Si el texto coincide (case-insensitive) con una sugerencia, usa la forma canónica
      de la sugerencia para estandarizar grafía.
    API:
      set_value(list[str]), value() -> list[str]
      set_suggestions(list[str])
    """

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self._suggestions: List[str] = []

        self._edit = QtWidgets.QLineEdit()
        self._edit.setPlaceholderText("Añadir tecnología…")
        self._btn_add = QtWidgets.QPushButton("+")
        self._btn_add.setFixedWidth(28)

        self._list = QtWidgets.QListWidget()
        enable_reorder(self._list)

        top = QtWidgets.QHBoxLayout()
        top.addWidget(self._edit)
        top.addWidget(self._btn_add)

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addLayout(top)
        root.addWidget(self._list)

        # Completer (sugerencias)
        self._completer = QtWidgets.QCompleter([], self)
        self._completer.setCaseSensitivity(Qt.CaseSensitivity.CaseInsensitive)
        self._completer.setFilterMode(Qt.MatchFlag.MatchContains)
        self._edit.setCompleter(self._completer)

        # Botonera secundaria
        self._btn_edit = QtWidgets.QPushButton("Editar")
        self._btn_del = QtWidgets.QPushButton("Eliminar")
        self._btn_up = QtWidgets.QPushButton("▲")
        self._btn_down = QtWidgets.QPushButton("▼")
        grid = QtWidgets.QGridLayout()
        grid.addWidget(self._btn_edit, 0, 0)
        grid.addWidget(self._btn_del, 0, 1)
        grid.addWidget(self._btn_up, 0, 2)
        grid.addWidget(self._btn_down, 0, 3)
        root.addLayout(grid)

        # Conexiones
        self._btn_add.clicked.connect(self._on_add)
        self._edit.returnPressed.connect(self._on_add)
        self._btn_edit.clicked.connect(self._on_edit)
        self._btn_del.clicked.connect(
            lambda: (remove_selected(self._list), self.changed.emit())
        )
        self._btn_up.clicked.connect(
            lambda: (move_selected(self._list, -1), self.changed.emit())
        )
        self._btn_down.clicked.connect(
            lambda: (move_selected(self._list, +1), self.changed.emit())
        )
        self._list.itemChanged.connect(self._emit_changed)
        self._list.itemSelectionChanged.connect(self._emit_changed)

    # API
    def set_value(self, items: List[str] | None) -> None:
        self._list.clear()
        for t in items or []:
            add_item(self._list, _s(t))

    def value(self) -> List[str]:
        return [self._list.item(i).text() for i in range(self._list.count())]

    def set_suggestions(self, items: List[str]) -> None:
        self._suggestions = [i for i in items if i]
        model = QtCore.QStringListModel(self._suggestions, self)
        self._completer.setModel(model)

    # Internos
    def _emit_changed(self) -> None:
        self.changed.emit()

    def _canonical(self, text: str) -> str:
        """Devuelve forma canónica según sugerencias (si coincide)."""
        t = text.strip()
        if not t:
            return t
        for s in self._suggestions:
            if s.casefold() == t.casefold():
                return s  # usar grafía sugerida
        return t

    def _exists(self, text: str) -> bool:
        norm = text.casefold().strip()
        for i in range(self._list.count()):
            if self._list.item(i).text().casefold().strip() == norm:
                return True
        return False

    def _on_add(self) -> None:
        raw = self._edit.text()
        can = self._canonical(raw)
        if not can:
            return
        if self._exists(can):
            # Selecciona el existente
            for i in range(self._list.count()):
                if (
                    self._list.item(i).text().casefold().strip()
                    == can.casefold().strip()
                ):
                    self._list.setCurrentRow(i)
                    break
            return
        add_item(self._list, can)
        self._edit.clear()
        self.changed.emit()

    def _on_edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        txt, ok = QtWidgets.QInputDialog.getText(
            self, "Editar tecnología", "Nombre:", text=it.text()
        )
        if not ok:
            return
        can = self._canonical(txt)
        if not can:
            return
        it.setText(can)
        self.changed.emit()


# -------- diálogo principal --------
class ProjectDialog(QtWidgets.QDialog):
    """Proyecto con:
    - name (texto)
    - description (HTML)
    - technologies (lista con sugerencias)
    - links (lista)
    - images (lista)
    """

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Proyecto")
        self.setModal(True)
        self.resize(900, 640)

        # --- Campos ---
        self._name = QtWidgets.QLineEdit()
        self._name.setPlaceholderText("Nombre del proyecto (obligatorio)")

        # description
        if HtmlEditor:
            self._desc = HtmlEditor(show_preview=True, parent=self)
            set_desc = self._desc.set_html
            get_desc = self._desc.html
        else:
            self._desc = QtWidgets.QPlainTextEdit()
            set_desc = self._desc.setPlainText  # type: ignore
            get_desc = self._desc.toPlainText  # type: ignore
        self._set_desc = set_desc
        self._get_desc = get_desc

        # technologies
        self._techs = TechList()

        # links
        self._links = QtWidgets.QListWidget()
        enable_reorder(self._links)
        self._btn_l_add = QtWidgets.QPushButton("Añadir")
        self._btn_l_edit = QtWidgets.QPushButton("Editar")
        self._btn_l_del = QtWidgets.QPushButton("Eliminar")
        self._btn_l_up = QtWidgets.QPushButton("▲")
        self._btn_l_down = QtWidgets.QPushButton("▼")

        # images
        self._images = QtWidgets.QListWidget()
        enable_reorder(self._images)
        self._btn_i_add = QtWidgets.QPushButton("Añadir")
        self._btn_i_edit = QtWidgets.QPushButton("Cambiar…")
        self._btn_i_del = QtWidgets.QPushButton("Eliminar")
        self._btn_i_up = QtWidgets.QPushButton("▲")
        self._btn_i_down = QtWidgets.QPushButton("▼")

        # --- Botonera OK/Cancel ---
        self._buttons = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel
        )
        self._ok_btn = self._buttons.button(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
        )
        self._ok_btn.setEnabled(False)

        # --- Layout ---
        form = QtWidgets.QFormLayout()
        form.addRow("Nombre", self._name)

        box_desc = QtWidgets.QGroupBox("Descripción (HTML)")
        vdesc = QtWidgets.QVBoxLayout(box_desc)
        vdesc.addWidget(self._desc)

        box_tech = QtWidgets.QGroupBox("Tecnologías")
        vtech = QtWidgets.QVBoxLayout(box_tech)
        vtech.addWidget(self._techs)

        def build_section(
            title: str,
            lw: QtWidgets.QListWidget,
            b_add: QtWidgets.QPushButton,
            b_edit: QtWidgets.QPushButton,
            b_del: QtWidgets.QPushButton,
            b_up: QtWidgets.QPushButton,
            b_down: QtWidgets.QPushButton,
        ) -> QtWidgets.QGroupBox:
            box = QtWidgets.QGroupBox(title)
            v = QtWidgets.QVBoxLayout(box)
            v.addWidget(lw)
            row = QtWidgets.QGridLayout()
            row.addWidget(b_add, 0, 0)
            row.addWidget(b_edit, 0, 1)
            row.addWidget(b_del, 0, 2)
            row.addWidget(b_up, 0, 3)
            row.addWidget(b_down, 0, 4)
            v.addLayout(row)
            return box

        box_links = build_section(
            "Links",
            self._links,
            self._btn_l_add,
            self._btn_l_edit,
            self._btn_l_del,
            self._btn_l_up,
            self._btn_l_down,
        )
        box_images = build_section(
            "Imágenes",
            self._images,
            self._btn_i_add,
            self._btn_i_edit,
            self._btn_i_del,
            self._btn_i_up,
            self._btn_i_down,
        )

        # Splitter principal: izquierda (desc+techs) / derecha (links+images)
        left = QtWidgets.QVBoxLayout()
        left.addLayout(form)
        left.addWidget(box_desc)
        left.addWidget(box_tech)
        left.addStretch(1)
        wleft = QtWidgets.QWidget()
        wleft.setLayout(left)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_links)
        right.addWidget(box_images)
        right.addStretch(1)
        wright = QtWidgets.QWidget()
        wright.setLayout(right)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        split.setChildrenCollapsible(False)
        split.setOpaqueResize(True)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([600, 300])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)
        self._name.textChanged.connect(self._revalidate)

        self._btn_l_add.clicked.connect(self._add_link)
        self._btn_l_edit.clicked.connect(self._edit_link)
        self._btn_l_del.clicked.connect(lambda: remove_selected(self._links))
        self._btn_l_up.clicked.connect(lambda: move_selected(self._links, -1))
        self._btn_l_down.clicked.connect(lambda: move_selected(self._links, +1))

        self._btn_i_add.clicked.connect(self._add_image)
        self._btn_i_edit.clicked.connect(self._edit_image)
        self._btn_i_del.clicked.connect(lambda: remove_selected(self._images))
        self._btn_i_up.clicked.connect(lambda: move_selected(self._images, -1))
        self._btn_i_down.clicked.connect(lambda: move_selected(self._images, +1))

    # ------- API pública -------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._name.setText(_s(data.get("name")))
        self._set_desc(_s(data.get("description")))
        self._techs.set_value([_s(x) for x in (data.get("technologies") or [])])

        self._links.clear()
        for lk in data.get("links") or []:
            t, u, i = _to_link_tuple(lk if isinstance(lk, dict) else {})
            it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
            it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
            self._links.addItem(it)

        self._images.clear()
        for path in data.get("images") or []:
            p = _s(path)
            it = QtWidgets.QListWidgetItem(p)
            it.setData(Qt.ItemDataRole.UserRole, p)
            self._images.addItem(it)

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "name": self._name.text().strip(),
            "description": self._get_desc().strip(),
            "technologies": self._techs.value(),
            "links": [],
            "images": [],
        }
        # links
        for i in range(self._links.count()):
            it = self._links.item(i)
            t: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
            out["links"].append(_to_link_dict(t))
        # images
        for i in range(self._images.count()):
            it = self._images.item(i)
            path: str = it.data(Qt.ItemDataRole.UserRole) or ""
            if path:
                out["images"].append(path)
        return out

    def set_tech_suggestions(self, items: List[str]) -> None:
        self._techs.set_suggestions(items)

    # ------- lógicas internas -------
    def _revalidate(self) -> None:
        self._ok_btn.setEnabled(bool(self._name.text().strip()))

    def _on_accept(self) -> None:
        self._revalidate()
        if not self._ok_btn.isEnabled():
            self._name.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()

    # Links
    def _add_link(self) -> None:
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
                self._links.addItem(it)
            return
        # fallback simple
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:")
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:")
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(self, "Link", "Icono (opcional):")
        it = QtWidgets.QListWidgetItem(_fmt_link(t.strip(), u.strip(), i.strip()))
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), i.strip()))
        self._links.addItem(it)

    def _edit_link(self) -> None:
        it = self._links.currentItem()
        if not it:
            return
        cur: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            try:
                dlg.set_value({"text": cur[0], "url": cur[1], "icon": cur[2]})
            except Exception:
                pass
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it.setText(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
            return
        # fallback
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:", text=cur[0])
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:", text=cur[1])
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(
            self, "Link", "Icono (opcional):", text=cur[2]
        )
        it.setText(_fmt_link(t.strip(), u.strip(), i.strip()))
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), i.strip()))

    # Images
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


__all__ = ["ProjectDialog", "TechList"]
